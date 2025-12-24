import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
	isOpen: boolean;
	activeChatId: string | null;
	replyingToMessageId: string | null;
}

const initialState: ChatState = {
	isOpen: false,
	activeChatId: null,
	replyingToMessageId: null,
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
			if (!action.payload) {
				// Clear reply state when closing chat
				state.replyingToMessageId = null;
			}
		},
		setActiveChat: (state, action: PayloadAction<string | null>) => {
			state.activeChatId = action.payload;
			// Clear reply state when switching chats
			state.replyingToMessageId = null;
		},
		setReplyingTo: (state, action: PayloadAction<string | null>) => {
			state.replyingToMessageId = action.payload;
		},
		clearReply: (state) => {
			state.replyingToMessageId = null;
		},
	},
});

export const {
	toggleChat,
	setChatOpen,
	setActiveChat,
	setReplyingTo,
	clearReply,
} = chatSlice.actions;

export default chatSlice.reducer;
