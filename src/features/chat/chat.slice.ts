import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Chat } from "@/types";

interface ChatState {
	isOpen: boolean;
	activeChatId: string | null;
	activeChat: Chat | null;
	typingUsers: { [userId: string]: boolean };
	// For DIRECT chats: tracks if the other user (not current user) is online
	// Key: chatId, Value: userId of the other user who is online (or null if offline)
	otherUserOnline: { [chatId: string]: string | null };
	connectionStatus: "connected" | "disconnected" | "connecting";
}

const initialState: ChatState = {
	isOpen: false,
	activeChatId: null,
	activeChat: null,
	typingUsers: {},
	otherUserOnline: {},
	connectionStatus: "disconnected",
};

const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		toggleChat: (state) => {
			state.isOpen = !state.isOpen;
		},
		setChatOpen: (state, action: PayloadAction<boolean>) => {
			state.isOpen = action.payload;
		},
		setActiveChat: (state, action: PayloadAction<Chat | null>) => {
			state.activeChat = action.payload;
			state.activeChatId = action.payload?.id ?? null;
		},
		setUserTyping: (
			state,
			action: PayloadAction<{ userId: string; isTyping: boolean }>,
		) => {
			const { userId, isTyping } = action.payload;
			if (isTyping) {
				state.typingUsers[userId] = true;
			} else {
				delete state.typingUsers[userId];
			}
		},
		// Set the other user's online status for a DIRECT chat
		// In DIRECT chats, there's only one "other user" to track
		setOtherUserOnline: (
			state,
			action: PayloadAction<{ chatId: string; userId: string | null }>,
		) => {
			state.otherUserOnline[action.payload.chatId] = action.payload.userId;
		},
		setConnectionStatus: (
			state,
			action: PayloadAction<"connected" | "disconnected" | "connecting">,
		) => {
			state.connectionStatus = action.payload;
		},
	},
});

export const {
	toggleChat,
	setChatOpen,
	setActiveChat,
	setUserTyping,
	setOtherUserOnline,
	setConnectionStatus,
} = chatSlice.actions;

export default chatSlice.reducer;
