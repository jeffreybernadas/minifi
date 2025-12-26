import { SOCKET_ROOMS, WEBSOCKET_EVENTS } from "@/constants/websocket.constant";
import { getSocket, joinRoom, leaveRoom } from "@/lib/socket";
import type { Chat, Message, SendMessageDto } from "@/types";
import type { RootState } from "../store";
import { baseApi } from "./base.api";

// ============ DTOs ============

export interface CreateChatDto {
	name?: string;
	type: "DIRECT" | "GROUP" | "SUPPORT";
	memberIds?: string[];
}

export interface CursorPageOptionsDto {
	limit?: number;
	before?: string;
	after?: string;
	search?: string;
}

export interface CursorPaginatedResponse<T> {
	data: T[];
	meta: {
		itemsPerPage: number;
		hasPreviousPage: boolean;
		hasNextPage: boolean;
		nextCursor?: string;
		previousCursor?: string;
	};
}

// ============ Presence Types ============

interface ChatPresence {
	typingUsers: string[];
}

/**
 * Chat API slice - REST endpoints + Socket streaming for real-time updates
 * Uses optimistic updates for instant UI feedback
 * Uses onCacheEntryAdded for real-time socket streaming
 */
export const chatApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// ============ CHAT MANAGEMENT ============

		/**
		 * Create a new chat (DIRECT with admin)
		 */
		createChat: builder.mutation<Chat, CreateChatDto>({
			query: (body) => ({
				url: "/chat",
				method: "POST",
				body,
			}),
			invalidatesTags: [{ type: "Chat", id: "LIST" }],
		}),

		/**
		 * List all chats user belongs to
		 * STREAMING: Listens for new chats, unread counts, last message updates
		 */
		getUserChats: builder.query<Chat[], void>({
			query: () => "/chat",
			transformResponse: (response: { data: Chat[] }) => response.data,
			providesTags: (chats) =>
				chats
					? [
							...chats.map(({ id }) => ({ type: "Chat" as const, id })),
							{ type: "Chat", id: "LIST" },
						]
					: [{ type: "Chat", id: "LIST" }],

			// STREAMING: Listen for socket events when query is active
			// Events are received via user:${userId} room (joined on login in App.tsx)
			// No need to join chat rooms here - backend emits to user's personal room
			async onCacheEntryAdded(
				_arg,
				{ updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState },
			) {
				const socket = getSocket();

				try {
					await cacheDataLoaded;

					// New chat created (user joined a chat)
					const onUserJoinedChat = (payload: { data: Chat }) => {
						updateCachedData((draft) => {
							const exists = draft.some((c) => c.id === payload.data.id);
							if (!exists) {
								draft.unshift(payload.data);
							}
						});
					};

					// Unread increment - update lastMessage and unreadCount
					// This event is only sent to user:${userId} room, separate from chat:new-message
					const onUnreadIncrement = (payload: { data: Message }) => {
						const state = getState() as RootState;
						const isChatOpen = state.chat?.isOpen ?? false;
						const activeChatId = state.chat?.activeChatId ?? null;

						updateCachedData((draft) => {
							const chat = draft.find((c) => c.id === payload.data.chatId);
							if (chat) {
								chat.lastMessage = {
									id: payload.data.id,
									content: payload.data.content,
									senderId: payload.data.senderId,
									isDeleted: payload.data.isDeleted,
									createdAt: payload.data.createdAt,
								};
								// Only increment unread if:
								// 1. Chat window is NOT open (for user side), AND
								// 2. This specific chat is NOT the active one (for admin side)
								const isViewingThisChat =
									isChatOpen || activeChatId === payload.data.chatId;
								if (!isViewingThisChat) {
									chat.unreadCount = (chat.unreadCount ?? 0) + 1;
								}
								chat.updatedAt = payload.data.createdAt;
							}
						});
					};

					// Messages read - reset unread count when current user reads
					const onMessagesRead = (payload: {
						data: { chatId: string; messageIds: string[]; userId: string };
					}) => {
						const state = getState() as RootState;
						const currentUserId = state.auth?.user?.id;

						// Only reset if current user read the messages
						if (payload.data.userId === currentUserId) {
							updateCachedData((draft) => {
								const chat = draft.find((c) => c.id === payload.data.chatId);
								if (chat) {
									// Reset unread count (user has read messages)
									chat.unreadCount = 0;
								}
							});
						}
					};

					socket.on(WEBSOCKET_EVENTS.USER_JOINED_CHAT, onUserJoinedChat);
					socket.on(WEBSOCKET_EVENTS.UNREAD_INCREMENT, onUnreadIncrement);
					socket.on(WEBSOCKET_EVENTS.MESSAGES_READ, onMessagesRead);

					await cacheEntryRemoved;

					socket.off(WEBSOCKET_EVENTS.USER_JOINED_CHAT, onUserJoinedChat);
					socket.off(WEBSOCKET_EVENTS.UNREAD_INCREMENT, onUnreadIncrement);
					socket.off(WEBSOCKET_EVENTS.MESSAGES_READ, onMessagesRead);
				} catch {
					// Cache entry was removed before data loaded
				}
			},
		}),

		/**
		 * Get specific chat details
		 */
		getChatById: builder.query<Chat, string>({
			query: (chatId) => `/chat/${chatId}`,
			providesTags: (_result, _error, id) => [{ type: "Chat", id }],
		}),

		// ============ MESSAGES (with Infinite Scroll) ============

		/**
		 * Fetch chat message history with infinite scroll support
		 * STREAMING: Real-time updates via socket
		 */
		getChatMessages: builder.query<
			CursorPaginatedResponse<Message>,
			{ chatId: string; cursor?: string }
		>({
			query: ({ chatId, cursor }) => ({
				url: `/chat/${chatId}/messages`,
				params: {
					limit: 20,
					// DESC order = newest first (then we reverse for display)
					order: "desc",
					// Use afterCursor to load older messages (next page in DESC = older)
					...(cursor && { afterCursor: cursor }),
				},
			}),

			// Transform: API returns DESC (newest first), reverse for chat display (oldest at top, newest at bottom)
			transformResponse: (response: CursorPaginatedResponse<Message>) => ({
				...response,
				data: [...response.data].reverse(),
			}),

			// KEY: serializeQueryArgs keeps all pages in ONE cache entry per chatId
			serializeQueryArgs: ({ queryArgs }) => {
				return queryArgs.chatId; // Cache key ignores cursor
			},

			// MERGE: Combine new page with existing messages
			merge: (currentCache, newResponse, { arg }) => {
				if (!arg.cursor) {
					// Initial load - replace cache
					return newResponse;
				}
				// Loading more (older messages) - prepend to existing
				return {
					data: [...newResponse.data, ...currentCache.data],
					meta: newResponse.meta,
				};
			},

			// FORCE REFETCH: Only fetch when cursor changes
			forceRefetch: ({ currentArg, previousArg }) => {
				return currentArg?.cursor !== previousArg?.cursor;
			},

			providesTags: (_result, _error, { chatId }) => [
				{ type: "Message", id: `LIST:${chatId}` },
			],

			// STREAMING: Real-time updates via socket
			async onCacheEntryAdded(
				{ chatId },
				{ dispatch, updateCachedData, cacheDataLoaded, cacheEntryRemoved },
			) {
				const socket = getSocket();

				try {
					await cacheDataLoaded;
					joinRoom(SOCKET_ROOMS.CHAT(chatId));

					// New message - append to end (newest)
					const onNewMessage = (payload: { data: Message }) => {
						if (payload.data.chatId !== chatId) return;
						updateCachedData((draft) => {
							// Check if this exact message already exists (by ID)
							const existsByBId = draft.data.some(
								(m) => m.id === payload.data.id,
							);
							if (existsByBId) return;

							// Check for temp messages from same sender with matching content
							// This handles the race condition between optimistic update and socket
							const tempMessageIdx = draft.data.findIndex(
								(m) =>
									m.id.startsWith("temp-") &&
									m.senderId === payload.data.senderId &&
									m.content === payload.data.content,
							);

							if (tempMessageIdx !== -1) {
								// Replace temp message with real one from socket
								draft.data[tempMessageIdx] = payload.data;
							} else {
								// New message from another user - add it
								draft.data.push(payload.data);
							}
						});

						// Also update sidebar: lastMessage (unread count handled by onUnreadIncrement/onMessagesRead)
						dispatch(
							chatApi.util.updateQueryData(
								"getUserChats",
								undefined,
								(draft) => {
									const chat = draft.find((c) => c.id === chatId);
									if (chat) {
										chat.lastMessage = {
											id: payload.data.id,
											content: payload.data.content,
											senderId: payload.data.senderId,
											isDeleted: payload.data.isDeleted,
											createdAt: payload.data.createdAt,
										};
										chat.updatedAt = payload.data.createdAt;
									}
								},
							),
						);
					};

					// Message edited
					const onMessageUpdated = (payload: { data: Message }) => {
						if (payload.data.chatId !== chatId) return;
						updateCachedData((draft) => {
							const idx = draft.data.findIndex((m) => m.id === payload.data.id);
							if (idx !== -1) {
								draft.data[idx] = payload.data;
							}
						});
					};

					// Message deleted
					const onMessageDeleted = (payload: {
						data: { messageId: string };
					}) => {
						updateCachedData((draft) => {
							const idx = draft.data.findIndex(
								(m) => m.id === payload.data.messageId,
							);
							if (idx !== -1) {
								draft.data[idx].isDeleted = true;
							}
						});
					};

					// Message read - single message
					const onMessageRead = (payload: {
						data: { chatId: string; messageId: string; userId: string };
					}) => {
						if (payload.data.chatId !== chatId) return;
						updateCachedData((draft) => {
							const msg = draft.data.find(
								(m) => m.id === payload.data.messageId,
							);
							if (msg) {
								msg.readBy = msg.readBy || [];
								// Avoid duplicates
								if (!msg.readBy.some((r) => r.userId === payload.data.userId)) {
									msg.readBy.push({
										userId: payload.data.userId,
										readAt: new Date().toISOString(),
									});
								}
							}
						});
					};

					// Messages read - batch
					const onMessagesRead = (payload: {
						data: { chatId: string; messageIds: string[]; userId: string };
					}) => {
						if (payload.data.chatId !== chatId) return;
						updateCachedData((draft) => {
							for (const msgId of payload.data.messageIds) {
								const msg = draft.data.find((m) => m.id === msgId);
								if (msg) {
									msg.readBy = msg.readBy || [];
									if (
										!msg.readBy.some((r) => r.userId === payload.data.userId)
									) {
										msg.readBy.push({
											userId: payload.data.userId,
											readAt: new Date().toISOString(),
										});
									}
								}
							}
						});
					};

					socket.on(WEBSOCKET_EVENTS.NEW_MESSAGE, onNewMessage);
					socket.on(WEBSOCKET_EVENTS.MESSAGE_UPDATED, onMessageUpdated);
					socket.on(WEBSOCKET_EVENTS.MESSAGE_DELETED, onMessageDeleted);
					socket.on(WEBSOCKET_EVENTS.MESSAGE_READ, onMessageRead);
					socket.on(WEBSOCKET_EVENTS.MESSAGES_READ, onMessagesRead);

					await cacheEntryRemoved;

					leaveRoom(SOCKET_ROOMS.CHAT(chatId));
					socket.off(WEBSOCKET_EVENTS.NEW_MESSAGE, onNewMessage);
					socket.off(WEBSOCKET_EVENTS.MESSAGE_UPDATED, onMessageUpdated);
					socket.off(WEBSOCKET_EVENTS.MESSAGE_DELETED, onMessageDeleted);
					socket.off(WEBSOCKET_EVENTS.MESSAGE_READ, onMessageRead);
					socket.off(WEBSOCKET_EVENTS.MESSAGES_READ, onMessagesRead);
				} catch {
					// Cache entry was removed before data loaded
				}
			},
		}),

		// ============ PRESENCE (Typing & Online Status) ============

		/**
		 * Chat presence state - typing users only
		 * Online status is now handled by global presence (getAdminPresence/getUsersPresence)
		 * No REST endpoint, purely socket-driven
		 */
		getChatPresence: builder.query<ChatPresence, string>({
			// No actual API call - data is socket-driven
			queryFn: () => ({ data: { typingUsers: [] } }),

			async onCacheEntryAdded(
				chatId,
				{ updateCachedData, cacheDataLoaded, cacheEntryRemoved },
			) {
				const socket = getSocket();

				try {
					await cacheDataLoaded;

					const onUserTyping = (payload: {
						data: { chatId: string; userId: string };
					}) => {
						if (payload.data.chatId !== chatId) return;
						updateCachedData((draft) => {
							if (!draft.typingUsers.includes(payload.data.userId)) {
								draft.typingUsers.push(payload.data.userId);
							}
						});
					};

					const onUserStoppedTyping = (payload: {
						data: { chatId: string; userId: string };
					}) => {
						if (payload.data.chatId !== chatId) return;
						updateCachedData((draft) => {
							draft.typingUsers = draft.typingUsers.filter(
								(id) => id !== payload.data.userId,
							);
						});
					};

					// Clear typing when user sends a message
					const onNewMessage = (payload: { data: Message }) => {
						if (payload.data.chatId !== chatId) return;
						updateCachedData((draft) => {
							// Remove sender from typing users (they sent a message)
							draft.typingUsers = draft.typingUsers.filter(
								(id) => id !== payload.data.senderId,
							);
						});
					};

					socket.on(WEBSOCKET_EVENTS.USER_TYPING, onUserTyping);
					socket.on(WEBSOCKET_EVENTS.USER_STOPPED_TYPING, onUserStoppedTyping);
					socket.on(WEBSOCKET_EVENTS.NEW_MESSAGE, onNewMessage);

					await cacheEntryRemoved;

					socket.off(WEBSOCKET_EVENTS.USER_TYPING, onUserTyping);
					socket.off(WEBSOCKET_EVENTS.USER_STOPPED_TYPING, onUserStoppedTyping);
					socket.off(WEBSOCKET_EVENTS.NEW_MESSAGE, onNewMessage);
				} catch {
					// Cache entry was removed before data loaded
				}
			},
		}),

		// ============ GLOBAL PRESENCE (User-Level Online Status) ============

		/**
		 * Admin presence - for regular users
		 * Returns whether any admin is currently online
		 * Uses socket streaming for real-time updates
		 */
		getAdminPresence: builder.query<{ isAdminOnline: boolean }, void>({
			queryFn: () => ({ data: { isAdminOnline: false } }),

			async onCacheEntryAdded(
				_arg,
				{ updateCachedData, cacheDataLoaded, cacheEntryRemoved },
			) {
				const socket = getSocket();

				try {
					await cacheDataLoaded;

					// Request initial status
					socket.emit(WEBSOCKET_EVENTS.GET_PRESENCE, {});

					const onPresenceStatus = (payload: {
						data: { isAdminOnline?: boolean };
					}) => {
						if (payload.data.isAdminOnline !== undefined) {
							updateCachedData(() => ({
								isAdminOnline: payload.data.isAdminOnline!,
							}));
						}
					};

					const onAdminOnline = () => {
						updateCachedData(() => ({ isAdminOnline: true }));
					};

					const onAdminOffline = () => {
						// Re-query - might be another admin still online
						socket.emit(WEBSOCKET_EVENTS.GET_PRESENCE, {});
					};

					socket.on(WEBSOCKET_EVENTS.PRESENCE_STATUS, onPresenceStatus);
					socket.on(WEBSOCKET_EVENTS.PRESENCE_ADMIN_ONLINE, onAdminOnline);
					socket.on(WEBSOCKET_EVENTS.PRESENCE_ADMIN_OFFLINE, onAdminOffline);

					await cacheEntryRemoved;

					socket.off(WEBSOCKET_EVENTS.PRESENCE_STATUS, onPresenceStatus);
					socket.off(WEBSOCKET_EVENTS.PRESENCE_ADMIN_ONLINE, onAdminOnline);
					socket.off(WEBSOCKET_EVENTS.PRESENCE_ADMIN_OFFLINE, onAdminOffline);
				} catch {
					// Cache entry was removed before data loaded
				}
			},
		}),

		/**
		 * Users presence - for admin sidebar
		 * Returns which users from the list are currently online
		 * Uses socket streaming for real-time updates
		 */
		getUsersPresence: builder.query<{ onlineUserIds: string[] }, string[]>({
			queryFn: () => ({ data: { onlineUserIds: [] } }),

			async onCacheEntryAdded(
				userIds,
				{ updateCachedData, cacheDataLoaded, cacheEntryRemoved },
			) {
				const socket = getSocket();

				try {
					await cacheDataLoaded;

					// Request initial status for these users
					if (userIds.length > 0) {
						socket.emit(WEBSOCKET_EVENTS.GET_PRESENCE, { userIds });
					}

					const onPresenceStatus = (payload: {
						data: { onlineUserIds?: string[] };
					}) => {
						if (payload.data.onlineUserIds) {
							updateCachedData(() => ({
								onlineUserIds: payload.data.onlineUserIds!,
							}));
						}
					};

					const onUserOnline = (payload: { data: { userId: string } }) => {
						updateCachedData((draft) => {
							if (!draft.onlineUserIds.includes(payload.data.userId)) {
								draft.onlineUserIds.push(payload.data.userId);
							}
						});
					};

					const onUserOffline = (payload: { data: { userId: string } }) => {
						updateCachedData((draft) => {
							draft.onlineUserIds = draft.onlineUserIds.filter(
								(id) => id !== payload.data.userId,
							);
						});
					};

					socket.on(WEBSOCKET_EVENTS.PRESENCE_STATUS, onPresenceStatus);
					socket.on(WEBSOCKET_EVENTS.PRESENCE_USER_ONLINE, onUserOnline);
					socket.on(WEBSOCKET_EVENTS.PRESENCE_USER_OFFLINE, onUserOffline);

					await cacheEntryRemoved;

					socket.off(WEBSOCKET_EVENTS.PRESENCE_STATUS, onPresenceStatus);
					socket.off(WEBSOCKET_EVENTS.PRESENCE_USER_ONLINE, onUserOnline);
					socket.off(WEBSOCKET_EVENTS.PRESENCE_USER_OFFLINE, onUserOffline);
				} catch {
					// Cache entry was removed before data loaded
				}
			},
		}),

		// ============ MUTATIONS ============

		/**
		 * Send a message - with optimistic update
		 */
		sendMessage: builder.mutation<
			Message,
			{
				chatId: string;
				data: SendMessageDto;
				tempId?: string;
				senderId?: string;
			}
		>({
			query: ({ chatId, data }) => ({
				url: `/chat/${chatId}/messages`,
				method: "POST",
				body: data,
			}),
			// Optimistic update - show message immediately
			async onQueryStarted(
				{ chatId, data, tempId, senderId },
				{ dispatch, queryFulfilled, getState },
			) {
				// Get reply context from cache if replying
				let replyTo: Message["replyTo"] = null;
				if (data.replyToId) {
					const state = getState() as RootState;
					const messagesResult = chatApi.endpoints.getChatMessages.select({
						chatId,
					})(state);
					const replyTarget = messagesResult.data?.data.find(
						(m: Message) => m.id === data.replyToId,
					);
					if (replyTarget) {
						replyTo = {
							id: replyTarget.id,
							content: replyTarget.content,
							senderId: replyTarget.senderId,
							isDeleted: replyTarget.isDeleted,
						};
					}
				}

				// Create temporary message for optimistic update
				const tempMessage: Message = {
					id: tempId || `temp-${Date.now()}`,
					chatId,
					senderId: senderId || "",
					content: data.content,
					isEdited: false,
					isDeleted: false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					replyToId: data.replyToId || null,
					replyTo,
				};

				// Optimistically add message to cache
				const patchResult = dispatch(
					chatApi.util.updateQueryData(
						"getChatMessages",
						{ chatId },
						(draft) => {
							draft.data.push(tempMessage);
						},
					),
				);

				// Optimistically update sidebar lastMessage
				const sidebarPatchResult = dispatch(
					chatApi.util.updateQueryData("getUserChats", undefined, (draft) => {
						const chat = draft.find((c) => c.id === chatId);
						if (chat) {
							chat.lastMessage = {
								id: tempMessage.id,
								content: tempMessage.content,
								senderId: tempMessage.senderId,
								isDeleted: tempMessage.isDeleted,
								createdAt: tempMessage.createdAt,
							};
							chat.updatedAt = tempMessage.createdAt;
						}
					}),
				);

				try {
					// Wait for actual response
					const { data: realMessage } = await queryFulfilled;

					// Replace temp message with real one
					dispatch(
						chatApi.util.updateQueryData(
							"getChatMessages",
							{ chatId },
							(draft) => {
								const index = draft.data.findIndex(
									(m) => m.id === tempMessage.id,
								);
								if (index !== -1) {
									draft.data[index] = realMessage;
								}
							},
						),
					);

					// Update sidebar with real message data
					dispatch(
						chatApi.util.updateQueryData("getUserChats", undefined, (draft) => {
							const chat = draft.find((c) => c.id === chatId);
							if (chat) {
								chat.lastMessage = {
									id: realMessage.id,
									content: realMessage.content,
									senderId: realMessage.senderId,
									isDeleted: realMessage.isDeleted,
									createdAt: realMessage.createdAt,
								};
								chat.updatedAt = realMessage.createdAt;
							}
						}),
					);
				} catch {
					// Rollback on error
					patchResult.undo();
					sidebarPatchResult.undo();
				}
			},
		}),

		/**
		 * Edit a message - with optimistic update
		 */
		updateMessage: builder.mutation<
			Message,
			{ chatId: string; messageId: string; data: SendMessageDto }
		>({
			query: ({ chatId, messageId, data }) => ({
				url: `/chat/${chatId}/messages/${messageId}`,
				method: "PUT",
				body: data,
			}),
			// Optimistic update
			async onQueryStarted(
				{ chatId, messageId, data },
				{ dispatch, queryFulfilled },
			) {
				// Optimistically update message in cache
				const patchResult = dispatch(
					chatApi.util.updateQueryData(
						"getChatMessages",
						{ chatId },
						(draft) => {
							const message = draft.data.find((m) => m.id === messageId);
							if (message) {
								message.content = data.content;
								message.isEdited = true;
								message.updatedAt = new Date().toISOString();
							}
						},
					),
				);

				try {
					await queryFulfilled;
				} catch {
					// Rollback on error
					patchResult.undo();
				}
			},
		}),

		/**
		 * Delete a message - with optimistic update
		 */
		deleteMessage: builder.mutation<
			Message,
			{ chatId: string; messageId: string }
		>({
			query: ({ chatId, messageId }) => ({
				url: `/chat/${chatId}/messages/${messageId}`,
				method: "DELETE",
			}),
			// Optimistic update - mark as deleted immediately
			async onQueryStarted(
				{ chatId, messageId },
				{ dispatch, queryFulfilled },
			) {
				// Optimistically mark message as deleted
				const patchResult = dispatch(
					chatApi.util.updateQueryData(
						"getChatMessages",
						{ chatId },
						(draft) => {
							const message = draft.data.find((m) => m.id === messageId);
							if (message) {
								message.isDeleted = true;
								message.updatedAt = new Date().toISOString();
							}
						},
					),
				);

				try {
					await queryFulfilled;
				} catch {
					// Rollback on error
					patchResult.undo();
				}
			},
		}),
	}),
});

export const {
	useCreateChatMutation,
	useGetUserChatsQuery,
	useGetChatByIdQuery,
	useGetChatMessagesQuery,
	useGetChatPresenceQuery,
	useGetAdminPresenceQuery,
	useGetUsersPresenceQuery,
	useSendMessageMutation,
	useUpdateMessageMutation,
	useDeleteMessageMutation,
} = chatApi;
