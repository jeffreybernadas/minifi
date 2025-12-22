import {
	ActionIcon,
	Box,
	Center,
	Group,
	Paper,
	ScrollArea,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { IconX, IconCircle } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setChatOpen } from "@/features/chat/chat.slice";
import { MessageBubble } from "../MessageBubble/MessageBubble";
import { MessageInput } from "../MessageInput/MessageInput";
import type { Message } from "@/types";
import { TypingIndicator } from "../TypingIndicator/TypingIndicator";

export function ChatWindow() {
	const dispatch = useAppDispatch();
	const viewport = useRef<HTMLDivElement>(null);
	const { user } = useAppSelector((state) => state.auth);

	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			chatId: "chat-1",
			senderId: "admin-1",
			content: "Hello! How can I help you today?",
			isEdited: false,
			isDeleted: false,
			createdAt: new Date(Date.now() - 3600000).toISOString(),
			updatedAt: new Date(Date.now() - 3600000).toISOString(),
		},
		{
			id: "2",
			chatId: "chat-1",
			senderId: "user-1",
			content: "Hi! I have a question about my subscription.",
			isEdited: false,
			isDeleted: false,
			createdAt: new Date(Date.now() - 3000000).toISOString(),
			updatedAt: new Date(Date.now() - 3000000).toISOString(),
		},
		{
			id: "3",
			chatId: "chat-1",
			senderId: "admin-1",
			content: "Sure! I'd be happy to help. What would you like to know?",
			isEdited: false,
			isDeleted: false,
			createdAt: new Date(Date.now() - 2400000).toISOString(),
			updatedAt: new Date(Date.now() - 2400000).toISOString(),
		},
	]);
	const [replyingTo, setReplyingTo] = useState<Message | null>(null);

	const handleSend = (content: string) => {
		const newMessage: Message = {
			id: `msg-${Date.now()}`,
			chatId: "chat-1",
			senderId: user?.id || "user-1",
			content,
			isEdited: false,
			isDeleted: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			replyToId: replyingTo?.id,
			replyTo: replyingTo
				? {
						id: replyingTo.id,
						content: replyingTo.content,
						senderId: replyingTo.senderId,
						isDeleted: replyingTo.isDeleted,
					}
				: null,
		};
		setMessages((prev) => [...prev, newMessage]);
		setReplyingTo(null);

		setTimeout(() => {
			viewport.current?.scrollTo({
				top: viewport.current.scrollHeight,
				behavior: "smooth",
			});
		}, 100);
	};

	const handleEdit = (messageId: string, content: string) => {
		setMessages((prev) =>
			prev.map((msg) =>
				msg.id === messageId
					? {
							...msg,
							content,
							isEdited: true,
							updatedAt: new Date().toISOString(),
						}
					: msg,
			),
		);
	};

	const handleDelete = (messageId: string) => {
		setMessages((prev) =>
			prev.map((msg) =>
				msg.id === messageId
					? { ...msg, isDeleted: true, updatedAt: new Date().toISOString() }
					: msg,
			),
		);
	};

	const handleReply = (message: Message) => {
		setReplyingTo(message);
	};

	const handleClose = () => {
		setReplyingTo(null);
		dispatch(setChatOpen(false));
	};

	return (
		<Paper
			shadow="xl"
			radius="lg"
			withBorder
			w={{ base: "100%", sm: 380 }}
			h={{ base: "100%", sm: 500 }}
			style={{
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}
		>
			{/* Header */}
			<Group
				bg="blue"
				px="md"
				py="xs"
				justify="space-between"
				style={{
					background:
						"linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-blue-7) 100%)",
				}}
			>
				<Stack gap={0}>
					<Group gap="xs">
						<Text c="white" fw={600} size="sm">
							Support Chat
						</Text>
						<Tooltip label="Connected" position="bottom">
							<IconCircle
								size={8}
								fill="var(--mantine-color-green-6)"
								color="var(--mantine-color-green-6)"
								style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
							/>
						</Tooltip>
					</Group>
					<Text size="xs" c="blue.1">
						Online
					</Text>
				</Stack>
				<ActionIcon
					variant="transparent"
					c="white"
					onClick={handleClose}
					size="sm"
				>
					<IconX />
				</ActionIcon>
			</Group>

			{/* Messages Area */}
			<Box style={{ flex: 1, position: "relative", overflow: "hidden" }}>
				<ScrollArea h="100%" viewportRef={viewport} p="md">
					{messages.length === 0 ? (
						<Center h="100%">
							<Stack gap="xs" align="center">
								<Text c="dimmed" size="sm" ta="center" fw={500}>
									👋 Hi! How can we help you today?
								</Text>
								<Text c="dimmed" size="xs" ta="center">
									Start a conversation with our support team
								</Text>
							</Stack>
						</Center>
					) : (
						<Stack gap="md">
							{messages.map((msg, index) => (
								<MessageBubble
									key={msg.id}
									message={msg}
									chatId="chat-1"
									showAvatar={
										index === 0 || messages[index - 1].senderId !== msg.senderId
									}
									onEdit={handleEdit}
									onDelete={handleDelete}
									onReply={handleReply}
								/>
							))}
						</Stack>
					)}
				</ScrollArea>
			</Box>
			<TypingIndicator userName="John Doe" />
			{/* Input Area */}
			<MessageInput
				onSend={handleSend}
				disabled={false}
				replyingTo={replyingTo}
				onCancelReply={() => setReplyingTo(null)}
			/>
		</Paper>
	);
}
