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
			invalidatesTags: ["Chat"],
		}),

		/**
		 * List all chats user belongs to
		 */
		getUserChats: builder.query<Chat[], void>({
			query: () => "/chat",
			providesTags: (result) =>
				result
					? [
							...result.map(({ id }) => ({ type: "Chat" as const, id })),
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
		 * Uses onCacheEntryAdded to listen for socket events and update cache
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
			// Real-time updates via Socket.IO are handled in the component via useSocket
			// or here if we moved the socket logic entirely into the API.
			// For now, we'll keep the socket logic separate or integrate it later
			// if we want pure cache-based updates.
		}),

		/**
		 * Send a message
		 */
		sendMessage: builder.mutation<
			Message,
			{ chatId: string; data: SendMessageDto }
		>({
			query: ({ chatId, data }) => ({
				url: `/chat/${chatId}/messages`,
				method: "POST",
				body: data,
			}),
			// Optimistic update could be added here
			invalidatesTags: (_result, _error, { chatId }) => [
				{ type: "Message", id: `LIST:${chatId}` },
				{ type: "Chat", id: chatId }, // Update lastMessageAt
			],
		}),

		/**
		 * Edit a message
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
			invalidatesTags: (_result, _error, { chatId }) => [
				{ type: "Message", id: `LIST:${chatId}` },
			],
		}),

		/**
		 * Delete a message
		 */
		deleteMessage: builder.mutation<
			Message,
			{ chatId: string; messageId: string }
		>({
			query: ({ chatId, messageId }) => ({
				url: `/chat/${chatId}/messages/${messageId}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, { chatId }) => [
				{ type: "Message", id: `LIST:${chatId}` },
			],
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
