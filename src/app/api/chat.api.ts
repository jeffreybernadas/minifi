import type { Chat, Message, SendMessageDto } from "@/types";
import { baseApi } from "./base.api";

// Assuming we might need to add CreateChatDto to types
export interface CreateChatDto {
	name?: string;
	type: "DIRECT" | "GROUP" | "SUPPORT"; // Enum from backend
	memberIds?: string[];
}

export interface CursorPageOptionsDto {
	limit?: number;
	before?: string; // ID of the message to fetch before
	after?: string; // ID of the message to fetch after
	search?: string;
}

export interface CursorPaginatedResponse<T> {
	data: T[];
	meta: {
		itemsPerPage: number;
		totalItems: number;
		currentPage: number;
		totalPages: number;
		sortBy: [string, string][];
		searchBy: string[];
		search: string;
		select: string[];
		filter?: Record<string, string>;
		hasPreviousPage: boolean;
		hasNextPage: boolean;
		startCursor?: string;
		endCursor?: string;
	};
}

/**
 * Chat API slice - REST endpoints for chat management
 * Uses optimistic updates for instant UI feedback
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
		}),

		/**
		 * Get specific chat details
		 */
		getChatById: builder.query<Chat, string>({
			query: (chatId) => `/chat/${chatId}`,
			providesTags: (_result, _error, id) => [{ type: "Chat", id }],
		}),

		// ============ MESSAGES ============

		/**
		 * Fetch chat message history (Cursor-based)
		 */
		getChatMessages: builder.query<
			CursorPaginatedResponse<Message>,
			{ chatId: string; params?: CursorPageOptionsDto }
		>({
			query: ({ chatId, params }) => ({
				url: `/chat/${chatId}/messages`,
				params: params || {},
			}),
			providesTags: (_result, _error, { chatId }) => [
				{ type: "Message", id: `LIST:${chatId}` },
			],
		}),

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
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const state = getState() as any;
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
							draft.meta.totalItems += 1;
						},
					),
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
				} catch {
					// Rollback on error
					patchResult.undo();
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
	useSendMessageMutation,
	useUpdateMessageMutation,
	useDeleteMessageMutation,
} = chatApi;
