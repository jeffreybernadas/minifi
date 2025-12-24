import {
	ActionIcon,
	Box,
	Center,
	Group,
	Loader,
	Paper,
	ScrollArea,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { IconX, IconCircle } from "@tabler/icons-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setChatOpen } from "@/features/chat/chat.slice";
import {
	useGetUserChatsQuery,
	useGetChatMessagesQuery,
	useGetChatPresenceQuery,
	useSendMessageMutation,
	useUpdateMessageMutation,
	useDeleteMessageMutation,
	useCreateChatMutation,
} from "@/app/api/chat.api";
import { isSocketConnected } from "@/lib/socket";
import { MessageBubble } from "../MessageBubble/MessageBubble";
import { MessageInput } from "../MessageInput/MessageInput";
import { TypingIndicator } from "../TypingIndicator/TypingIndicator";
import type { Message } from "@/types";

export function ChatWindow() {
	const dispatch = useAppDispatch();
	const viewport = useRef<HTMLDivElement>(null);
	const { user } = useAppSelector((state) => state.auth);
	const prevMessagesLengthRef = useRef(0);

	const [replyingTo, setReplyingTo] = useState<Message | null>(null);

	// Get user's chats - find the support chat
	const { data: chats = [], isLoading: chatsLoading } = useGetUserChatsQuery();
	const [createChat] = useCreateChatMutation();

	// Find or create a support chat
	const supportChat = chats.find((c) => c.type === "DIRECT") ?? chats[0];
	const chatId = supportChat?.id;

	// Create a new support chat if user has no chats
	useEffect(() => {
		if (!chatsLoading && chats.length === 0) {
			createChat({ type: "DIRECT" });
		}
	}, [chatsLoading, chats.length, createChat]);

	// Fetch messages for the active chat
	const { data: messagesData, isLoading: messagesLoading } =
		useGetChatMessagesQuery({ chatId: chatId! }, { skip: !chatId });

	// Get typing/online presence
	const { data: presence } = useGetChatPresenceQuery(chatId!, {
		skip: !chatId,
	});

	const messages = messagesData?.data ?? [];
	const typingUsers = presence?.typingUsers ?? [];

	// Mutations
	const [sendMessage] = useSendMessageMutation();
	const [updateMessage] = useUpdateMessageMutation();
	const [deleteMessage] = useDeleteMessageMutation();

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (messages.length > prevMessagesLengthRef.current) {
			setTimeout(() => {
				viewport.current?.scrollTo({
					top: viewport.current.scrollHeight,
					behavior: "smooth",
				});
			}, 100);
		}
		prevMessagesLengthRef.current = messages.length;
	}, [messages.length]);

	const handleSend = useCallback(
		(content: string) => {
			if (!chatId || !user?.id) return;

			sendMessage({
				chatId,
				data: {
					content,
					replyToId: replyingTo?.id,
				},
				senderId: user.id,
				tempId: `temp-${Date.now()}`,
			});

			setReplyingTo(null);
		},
		[chatId, user?.id, replyingTo, sendMessage],
	);

	const handleEdit = useCallback(
		(messageId: string, content: string) => {
			if (!chatId) return;
			updateMessage({
				chatId,
				messageId,
				data: { content },
			});
		},
		[chatId, updateMessage],
	);

	const handleDelete = useCallback(
		(messageId: string) => {
			if (!chatId) return;
			deleteMessage({ chatId, messageId });
		},
		[chatId, deleteMessage],
	);

	const handleReply = useCallback((message: Message) => {
		setReplyingTo(message);
	}, []);

	const handleClose = () => {
		setReplyingTo(null);
		dispatch(setChatOpen(false));
	};

	const isConnected = isSocketConnected();
	const isLoading = chatsLoading || (chatId && messagesLoading);

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
						<Tooltip
							label={isConnected ? "Connected" : "Connecting..."}
							position="bottom"
						>
							<IconCircle
								size={8}
								fill={
									isConnected
										? "var(--mantine-color-green-6)"
										: "var(--mantine-color-yellow-6)"
								}
								color={
									isConnected
										? "var(--mantine-color-green-6)"
										: "var(--mantine-color-yellow-6)"
								}
								style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
							/>
						</Tooltip>
					</Group>
					<Text size="xs" c="blue.1">
						{isConnected ? "Online" : "Connecting..."}
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
					{isLoading ? (
						<Center h="100%">
							<Loader size="md" />
						</Center>
					) : messages.length === 0 ? (
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
									chatId={chatId!}
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

			{/* Typing Indicator - outside scroll so always visible, above input */}
			<TypingIndicator typingUsers={typingUsers} />

			{/* Input Area */}
			<MessageInput
				onSend={handleSend}
				disabled={!chatId || !isConnected}
				replyingTo={replyingTo}
				onCancelReply={() => setReplyingTo(null)}
				chatId={chatId}
				userId={user?.id}
			/>
		</Paper>
	);
}
