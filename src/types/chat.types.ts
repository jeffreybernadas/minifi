export interface ChatMember {
	userId: string;
	role: "admin" | "member";
	joinedAt: string;
}

export interface Chat {
	id: string;
	name?: string | null;
	type: "DIRECT" | "GROUP";
	creatorId: string;
	members?: ChatMember[];
	createdAt: string;
	updatedAt: string;
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
}

export interface SendMessageDto {
	content: string;
}
