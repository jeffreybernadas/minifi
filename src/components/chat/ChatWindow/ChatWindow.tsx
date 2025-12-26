import {
	ActionIcon,
	Badge,
	Box,
	Center,
	Group,
	Loader,
	Paper,
	ScrollArea,
	Stack,
	Text,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	chatApi,
	useCreateChatMutation,
	useDeleteMessageMutation,
	useGetChatMessagesQuery,
	useGetChatPresenceQuery,
	useGetUserChatsQuery,
	useSendMessageMutation,
	useUpdateMessageMutation,
} from "@/app/api/chat.api";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setChatOpen } from "@/features/chat/chat.slice";
import {
	emitMessagesRead,
	emitUserOffline,
	emitUserOnline,
	isSocketConnected,
} from "@/lib/socket";
import type { Message } from "@/types";
import { MessageBubble } from "../MessageBubble/MessageBubble";
import { MessageInput } from "../MessageInput/MessageInput";
import { TypingIndicator } from "../TypingIndicator/TypingIndicator";

export function ChatWindow() {
	const dispatch = useAppDispatch();
	const viewport = useRef<HTMLDivElement>(null);
	const { user } = useAppSelector((state) => state.auth);
	const prevMessagesLengthRef = useRef(0);
	const isNearBottomRef = useRef(true);
	const isLoadingOlderRef = useRef(false);

	const [replyingTo, setReplyingTo] = useState<Message | null>(null);
	const [cursor, setCursor] = useState<string | undefined>(undefined);

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

	// Fetch messages for the active chat with cursor pagination
	const {
		data: messagesData,
		isLoading: messagesLoading,
		isFetching,
	} = useGetChatMessagesQuery({ chatId: chatId!, cursor }, { skip: !chatId });

	// Get typing/online presence
	const { data: presence } = useGetChatPresenceQuery(chatId!, {
		skip: !chatId,
	});

	const messages = messagesData?.data ?? [];
	// With DESC order, "hasNextPage" means there are older messages to load
	const hasMoreMessages = messagesData?.meta?.hasNextPage ?? false;
	// nextCursor points to the oldest message in current batch (for loading older)
	const nextCursor = messagesData?.meta?.nextCursor;
	const typingUsers = presence?.typingUsers ?? [];
	const onlineUsers = presence?.onlineUsers ?? [];
	const isTyping = typingUsers.length > 0;

	// Get admin member from chat
	const adminMember = useMemo(() => {
		return supportChat?.members?.find((m) => m.userId !== user?.id) ?? null;
	}, [supportChat?.members, user?.id]);

	const isAdminOnline = adminMember
		? onlineUsers.includes(adminMember.userId)
		: false;

	// Build userNames map for typing indicator
	const userNames = useMemo(() => {
		const names: Record<string, string> = {};
		if (supportChat?.members) {
			for (const member of supportChat.members) {
				names[member.userId] =
					member.displayName || member.email || "Support Agent";
			}
		}
		return names;
	}, [supportChat?.members]);

	// Mutations
	const [sendMessage] = useSendMessageMutation();
	const [updateMessage] = useUpdateMessageMutation();
	const [deleteMessage] = useDeleteMessageMutation();

	const isConnected = isSocketConnected();

	// Emit online status when chat opens/closes
	useEffect(() => {
		if (chatId && user?.id && isConnected) {
			emitUserOnline(chatId, user.id);

			return () => {
				emitUserOffline(chatId, user.id);
			};
		}
	}, [chatId, user?.id, isConnected]);

	// Emit read receipts for unread messages when chat opens
	useEffect(() => {
		if (!chatId || !user?.id || !isConnected || messages.length === 0) return;

		// Find messages from other users that haven't been read by us
		const unreadMessageIds = messages
			.filter(
				(m) =>
					m.senderId !== user.id &&
					!m.id.startsWith("temp-") &&
					(!m.readBy || !m.readBy.some((r) => r.userId === user.id)),
			)
			.map((m) => m.id);

		if (unreadMessageIds.length > 0) {
			// Optimistically reset unread count immediately for instant UI feedback
			dispatch(
				chatApi.util.updateQueryData("getUserChats", undefined, (draft) => {
					const chat = draft.find((c) => c.id === chatId);
					if (chat) {
						chat.unreadCount = 0;
					}
				}),
			);

			// Emit socket event to persist and notify other users
			emitMessagesRead(chatId, unreadMessageIds, user.id);
		}
	}, [chatId, user?.id, isConnected, messages, dispatch]);

	// Initial scroll to bottom when messages first load
	useLayoutEffect(() => {
		if (messages.length > 0 && prevMessagesLengthRef.current === 0) {
			// First load - scroll to bottom immediately (no animation)
			viewport.current?.scrollTo({
				top: viewport.current.scrollHeight,
				behavior: "instant",
			});
		}
	}, [messages.length]);

	// Auto-scroll to bottom when new messages arrive (only if near bottom)
	useLayoutEffect(() => {
		// Skip auto-scroll when loading older messages
		if (isLoadingOlderRef.current) {
			isLoadingOlderRef.current = false;
			prevMessagesLengthRef.current = messages.length;
			return;
		}

		// Skip if this is initial load (handled above)
		if (prevMessagesLengthRef.current === 0) {
			prevMessagesLengthRef.current = messages.length;
			return;
		}

		if (
			messages.length > prevMessagesLengthRef.current &&
			isNearBottomRef.current
		) {
			viewport.current?.scrollTo({
				top: viewport.current.scrollHeight,
				behavior: "smooth",
			});
		}
		prevMessagesLengthRef.current = messages.length;
	}, [messages.length]);

	// Auto-scroll to bottom when typing indicator or reply preview appears
	// This ensures the latest messages stay visible when these UI elements take space
	useLayoutEffect(() => {
		if ((isTyping || replyingTo) && isNearBottomRef.current) {
			// Use requestAnimationFrame to ensure DOM has updated with the new layout
			requestAnimationFrame(() => {
				viewport.current?.scrollTo({
					top: viewport.current.scrollHeight,
					behavior: "smooth",
				});
			});
		}
	}, [isTyping, replyingTo]);

	// Handle scroll events for infinite scroll and tracking position
	const handleScroll = useCallback(
		({ y }: { x: number; y: number }) => {
			const v = viewport.current;
			if (!v) return;

			// Track if user is near bottom (within 100px)
			const distanceFromBottom = v.scrollHeight - y - v.clientHeight;
			isNearBottomRef.current = distanceFromBottom < 100;

			// Infinite scroll - load more when near top (scrollTop < 50px)
			if (y < 50 && hasMoreMessages && !isFetching && nextCursor) {
				isLoadingOlderRef.current = true;
				setCursor(nextCursor);
			}
		},
		[hasMoreMessages, isFetching, nextCursor],
	);

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
						<Badge
							size="xs"
							color={isAdminOnline ? "green" : "gray"}
							variant="filled"
						>
							{isAdminOnline ? "Online" : "Offline"}
						</Badge>
					</Group>
					<Text size="xs" c="blue.1">
						{adminMember?.displayName || "Support Agent"}
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
				<ScrollArea
					h="100%"
					viewportRef={viewport}
					p="md"
					onScrollPositionChange={handleScroll}
				>
					{isLoading ? (
						<Center h="100%">
							<Loader size="md" />
						</Center>
					) : messages.length === 0 ? (
						<Center h="100%">
							<Stack gap="xs" align="center">
								<Text c="dimmed" size="sm" ta="center" fw={500}>
									Hi! How can we help you today?
								</Text>
								<Text c="dimmed" size="xs" ta="center">
									Start a conversation with our support team
								</Text>
							</Stack>
						</Center>
					) : (
						<Stack gap="md">
							{/* Loader at top when fetching older messages */}
							{isFetching && cursor && (
								<Center py="xs">
									<Loader size="sm" />
								</Center>
							)}
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
									senderName={
										msg.senderId !== user?.id
											? adminMember?.displayName || "Support Agent"
											: undefined
									}
									senderAvatarUrl={
										msg.senderId !== user?.id
											? adminMember?.avatarUrl
											: undefined
									}
								/>
							))}
						</Stack>
					)}
				</ScrollArea>
			</Box>

			{/* Typing Indicator - outside scroll so always visible, above input */}
			<TypingIndicator typingUsers={typingUsers} userNames={userNames} />

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
