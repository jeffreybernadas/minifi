import { io, type Socket } from "socket.io-client";
import { VITE_WS_URL } from "@/constants/env.constant";
import { keycloak } from "@/features/auth/keycloak";

let socket: Socket | null = null;

/**
 * Get or create the singleton socket instance.
 * Does NOT auto-connect - use connectSocket() after auth.
 */
export const getSocket = (): Socket => {
	if (!socket) {
		socket = io(VITE_WS_URL, {
			autoConnect: false, // Manual connect after auth
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			auth: {
				token: keycloak.token,
			},
		});

		// Update auth token on reconnect attempts
		socket.on("connect", () => {
			console.log("[Socket] Connected:", socket?.id);
		});

		socket.on("disconnect", (reason) => {
			console.log("[Socket] Disconnected:", reason);
		});

		socket.on("connect_error", (error) => {
			console.error("[Socket] Connection error:", error.message);
		});
	}
	return socket;
};

/**
 * Connect the socket with current auth token.
 * Call this after successful Keycloak authentication.
 * Returns a promise that resolves when connected.
 */
export const connectSocket = (): Promise<void> => {
	return new Promise((resolve) => {
		const s = getSocket();
		if (s.connected) {
			resolve();
			return;
		}
		// Update token before connecting
		s.auth = { token: keycloak.token };
		s.once("connect", () => {
			resolve();
		});
		s.connect();
	});
};

/**
 * Disconnect the socket.
 * Call this on logout.
 */
export const disconnectSocket = (): void => {
	if (socket?.connected) {
		socket.disconnect();
	}
};

/**
 * Check if socket is currently connected.
 */
export const isSocketConnected = (): boolean => {
	return socket?.connected ?? false;
};

// ============ Room Management ============

/**
 * Join a socket room.
 * Used for chat rooms: `chat:{chatId}` or user rooms: `user:{userId}`
 */
export const joinRoom = (room: string): void => {
	const s = getSocket();
	if (s.connected) {
		s.emit("join-room", { room });
	}
};

/**
 * Leave a socket room.
 */
export const leaveRoom = (room: string): void => {
	const s = getSocket();
	if (s.connected) {
		s.emit("leave-room", { room });
	}
};

// ============ Typing Indicators ============

/**
 * Emit that the current user started typing in a chat.
 */
export const emitTyping = (chatId: string, userId: string): void => {
	const s = getSocket();
	if (s.connected) {
		s.emit("chat:user-typing", { chatId, userId });
	}
};

/**
 * Emit that the current user stopped typing in a chat.
 */
export const emitStoppedTyping = (chatId: string, userId: string): void => {
	const s = getSocket();
	if (s.connected) {
		s.emit("chat:user-stopped-typing", { chatId, userId });
	}
};

// ============ Read Receipts ============

/**
 * Mark a single message as read.
 */
export const emitMessageRead = (
	chatId: string,
	messageId: string,
	userId: string,
): void => {
	const s = getSocket();
	if (s.connected) {
		s.emit("chat:message-read", { chatId, messageId, userId });
	}
};

/**
 * Mark multiple messages as read (batch).
 */
export const emitMessagesRead = (
	chatId: string,
	messageIds: string[],
	userId: string,
): void => {
	const s = getSocket();
	if (s.connected && messageIds.length > 0) {
		s.emit("chat:messages-read", { chatId, messageIds, userId });
	}
};
