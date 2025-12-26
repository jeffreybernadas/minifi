/**
 * WebSocket event names for client-side communication
 * Must match the backend WEBSOCKET_EVENTS constants
 */
export const WEBSOCKET_EVENTS = {
	// Chat typing indicators
	USER_TYPING: "chat:user-typing",
	USER_STOPPED_TYPING: "chat:user-stopped-typing",

	// Chat messages
	NEW_MESSAGE: "chat:new-message",
	MESSAGE_UPDATED: "chat:message-updated",
	MESSAGE_DELETED: "chat:message-deleted",

	// Chat read receipts
	MESSAGE_READ: "chat:message-read",
	MESSAGES_READ: "chat:messages-read",

	// Chat unread notifications
	UNREAD_INCREMENT: "chat:unread-increment",

	// Chat member events
	USER_JOINED_CHAT: "chat:user-joined",

	// Global presence (user-level online status)
	GET_PRESENCE: "get-presence",
	PRESENCE_STATUS: "presence-status",
	PRESENCE_USER_ONLINE: "presence:user-online",
	PRESENCE_USER_OFFLINE: "presence:user-offline",
	PRESENCE_ADMIN_ONLINE: "presence:admin-online",
	PRESENCE_ADMIN_OFFLINE: "presence:admin-offline",
} as const;
