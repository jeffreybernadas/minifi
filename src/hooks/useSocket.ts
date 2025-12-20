import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { VITE_WS_URL } from "@/constants/env.constant";
import { setUserTyping } from "@/features/chat/chat.slice";
import { chatApi } from "@/app/api/chat.api";
import { keycloak } from "@/features/auth/keycloak";
import type { Message } from "@/types";

// Events matching backend constants
const EVENTS = {
	CONNECT: "connect",
	DISCONNECT: "disconnect",
	JOIN_ROOM: "join-room",
	LEAVE_ROOM: "leave-room",
	NEW_MESSAGE: "chat:new-message",
	MESSAGE_UPDATED: "chat:message-updated",
	USER_TYPING: "chat:user-typing",
	USER_STOPPED_TYPING: "chat:user-stopped-typing",
} as const;

export const useSocket = () => {
	const dispatch = useAppDispatch();
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		if (!isAuthenticated || !keycloak.token) {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
			return;
		}

		// Initialize socket connection
		if (!socketRef.current) {
			socketRef.current = io(VITE_WS_URL, {
				auth: {
					token: keycloak.token,
				},
				transports: ["websocket"],
				autoConnect: true,
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
			});

			const socket = socketRef.current;

			// Connection events
			socket.on(EVENTS.CONNECT, () => {
				console.log("Socket connected:", socket.id);
			});

			socket.on(EVENTS.DISCONNECT, (reason) => {
				console.log("Socket disconnected:", reason);
			});

			// Chat events
			socket.on(
				EVENTS.NEW_MESSAGE,
				(payload: { data: Message; success: boolean }) => {
					// Invalidate cache to fetch new messages
					dispatch(
						chatApi.util.invalidateTags([
							{ type: "Message", id: `LIST:${payload.data.chatId}` },
							{ type: "Chat", id: "LIST" }, // Update chat list order/last message
						]),
					);
				},
			);

			socket.on(
				EVENTS.MESSAGE_UPDATED,
				(payload: { data: Message; success: boolean }) => {
					dispatch(
						chatApi.util.invalidateTags([
							{ type: "Message", id: `LIST:${payload.data.chatId}` },
						]),
					);
				},
			);

			socket.on(
				EVENTS.USER_TYPING,
				(payload: { data: { userId: string; chatId: string } }) => {
					// The payload structure from backend gateway is { data: { chatId, userId } }
					// But we should verify if the backend sends it wrapped in `data` or flat.
					// Looking at backend gateway:
					// client.to(...).emit(..., { success: true, ..., data: { chatId, userId } })
					dispatch(
						setUserTyping({ userId: payload.data.userId, isTyping: true }),
					);
				},
			);

			socket.on(
				EVENTS.USER_STOPPED_TYPING,
				(payload: { data: { userId: string; chatId: string } }) => {
					dispatch(
						setUserTyping({ userId: payload.data.userId, isTyping: false }),
					);
				},
			);
		}

		return () => {
			if (socketRef.current) {
				// Don't disconnect on unmount, only on logout
				// This keeps the socket alive while navigating
			}
		};
	}, [isAuthenticated, dispatch]);

	const joinChat = (chatId: string) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit(EVENTS.JOIN_ROOM, { room: `chat:${chatId}` });
		}
	};

	const leaveChat = (chatId: string) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit(EVENTS.LEAVE_ROOM, { room: `chat:${chatId}` });
		}
	};

	const sendTyping = (chatId: string, userId: string) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit(EVENTS.USER_TYPING, { chatId, userId });
		}
	};

	const stopTyping = (chatId: string, userId: string) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit(EVENTS.USER_STOPPED_TYPING, { chatId, userId });
		}
	};

	return {
		socket: socketRef.current,
		joinChat,
		leaveChat,
		sendTyping,
		stopTyping,
	};
};
