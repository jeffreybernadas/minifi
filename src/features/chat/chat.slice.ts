import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Chat } from "@/types";

interface ChatState {
	isOpen: boolean;
	activeChatId: string | null;
	activeChat: Chat | null;
	typingUsers: { [userId: string]: boolean };
	unreadCount: number;
}

const initialState: ChatState = {
	isOpen: false,
	activeChatId: null,
	activeChat: null,
	typingUsers: {},
	unreadCount: 0,
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
		incrementUnreadCount: (state) => {
			state.unreadCount += 1;
		},
		resetUnreadCount: (state) => {
			state.unreadCount = 0;
		},
	},
});

export const {
	toggleChat,
	setChatOpen,
	setActiveChat,
	setUserTyping,
	incrementUnreadCount,
	resetUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;
