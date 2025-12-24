export interface ChatMember {
	id: string;
	userId: string;
	joinedAt: string;
	displayName?: string | null;
	email?: string | null;
	avatarUrl?: string | null;
}

export interface LastMessage {
	id: string;
	content: string;
	senderId: string;
	isDeleted: boolean;
	createdAt: string;
}

export interface Chat {
	id: string;
	name?: string | null;
	type: "DIRECT" | "GROUP";
	creatorId: string;
	members?: ChatMember[];
	createdAt: string;
	updatedAt: string;
	lastMessage?: LastMessage | null;
	unreadCount?: number;
}

export interface ReplyTo {
	id: string;
	content: string;
	senderId: string;
	isDeleted: boolean;
}

export interface MessageSender {
	id: string;
	firstName?: string | null;
	lastName?: string | null;
	username?: string | null;
	email: string;
	avatarUrl?: string | null;
}

export interface Message {
	id: string;
	chatId: string;
	senderId: string;
	content: string;
	isEdited: boolean;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
	replyToId?: string | null;
	replyTo?: ReplyTo | null;
	sender?: MessageSender | null;
}

export interface SendMessageDto {
	content: string;
	replyToId?: string;
}
