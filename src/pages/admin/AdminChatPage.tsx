import {
	Avatar,
	Badge,
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
import { upperFirst } from "@mantine/hooks";
import { IconCircle, IconMessageCircle } from "@tabler/icons-react";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import TimeAgo from "react-timeago";
import {
	chatApi,
	useDeleteMessageMutation,
	useGetChatMessagesQuery,
	useGetChatPresenceQuery,
	useGetUserChatsQuery,
	useGetUsersPresenceQuery,
	useSendMessageMutation,
	useUpdateMessageMutation,
} from "@/app/api/chat.api";
import { useAppDispatch } from "@/app/hooks";
import { MessageBubble } from "@/components/chat/MessageBubble/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator/TypingIndicator";
import { setActiveChat } from "@/features/chat/chat.slice";
import { useAuth } from "@/hooks";
import { emitMessagesRead, isSocketConnected } from "@/lib/socket";
import type { Chat, ChatMember, Message } from "@/types";
import { UserDetailDrawer } from "./components/UserDetailDrawer";

export default function AdminChatPage() {
	const { user, isAdmin } = useAuth();
	const dispatch = useAppDispatch();
	const viewport = useRef<HTMLDivElement>(null);
	const prevMessagesLengthRef = useRef(0);
	const isNearBottomRef = useRef(true);
	const isLoadingOlderRef = useRef(false);

	const [activeChatId, setActiveChatId] = useState<string | null>(null);
	const [replyingTo, setReplyingTo] = useState<Message | null>(null);
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	// Fetch all chats for admin
	const { data: chats = [], isLoading: chatsLoading } = useGetUserChatsQuery(
		undefined,
		{ skip: !isAdmin },
	);

	// Fetch messages for active chat with cursor pagination
	const {
		data: messagesData,
		isLoading: messagesLoading,
		isFetching,
	} = useGetChatMessagesQuery(
		{ chatId: activeChatId!, cursor },
		{ skip: !activeChatId },
	);

	// Get typing presence for active chat (chat-room scoped)
	const { data: presence } = useGetChatPresenceQuery(activeChatId!, {
		skip: !activeChatId,
	});

	// Extract user IDs from all chats for global presence query
	const userIds = useMemo(() => {
		return chats
			.map((c) => c.members?.[0]?.userId)
			.filter((id): id is string => Boolean(id));
	}, [chats]);

	// Get global user presence (user-level online status)
	const { data: usersPresence } = useGetUsersPresenceQuery(userIds, {
		skip: userIds.length === 0,
	});

	const messages = messagesData?.data ?? [];
	const hasMoreMessages = messagesData?.meta?.hasNextPage ?? false;
	const nextCursor = messagesData?.meta?.nextCursor;
	const typingUsers = presence?.typingUsers ?? [];
	const onlineUserIds = usersPresence?.onlineUserIds ?? [];
	const isTyping = typingUsers.length > 0;

	// Mutations
	const [sendMessage] = useSendMessageMutation();
	const [updateMessage] = useUpdateMessageMutation();
	const [deleteMessage] = useDeleteMessageMutation();

	const isConnected = isSocketConnected();

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

	// Auto-scroll when new messages arrive (only if near bottom)
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

	// Auto-scroll when typing indicator or reply preview appears
	useLayoutEffect(() => {
		if ((isTyping || replyingTo) && isNearBottomRef.current) {
			requestAnimationFrame(() => {
				viewport.current?.scrollTo({
					top: viewport.current.scrollHeight,
					behavior: "smooth",
				});
			});
		}
	}, [isTyping, replyingTo]);

	// Emit read events for unread messages when chat is selected
	useEffect(() => {
		if (!activeChatId || !user?.id || !isConnected || messages.length === 0)
			return;

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
			// Optimistically reset unread count in sidebar
			dispatch(
				chatApi.util.updateQueryData("getUserChats", undefined, (draft) => {
					const chat = draft.find((c) => c.id === activeChatId);
					if (chat) {
						chat.unreadCount = 0;
					}
				}),
			);
			// Emit socket event to persist and notify other users
			emitMessagesRead(activeChatId, unreadMessageIds, user.id);
		}
	}, [activeChatId, user?.id, isConnected, messages, dispatch]);

	const handleSelectChat = useCallback(
		(chat: Chat) => {
			setReplyingTo(null);
			setCursor(undefined); // Reset cursor for new chat
			prevMessagesLengthRef.current = 0; // Reset for initial scroll
			setActiveChatId(chat.id);
			// Update Redux state so socket listener knows which chat is active
			dispatch(setActiveChat(chat.id));
			// Mark as read when selecting - optimistically update cache and emit socket event
			if ((chat.unreadCount ?? 0) > 0 && user?.id) {
				// Optimistically update unread count in cache
				dispatch(
					chatApi.util.updateQueryData("getUserChats", undefined, (draft) => {
						const c = draft.find((c) => c.id === chat.id);
						if (c) c.unreadCount = 0;
					}),
				);
				// Note: We'll emit read events after messages load to get actual message IDs
			}
		},
		[dispatch, user?.id],
	);

	// Clear active chat on unmount
	useEffect(() => {
		return () => {
			dispatch(setActiveChat(null));
		};
	}, [dispatch]);

	const handleSend = useCallback(
		(content: string) => {
			if (!activeChatId || !user?.id) return;

			sendMessage({
				chatId: activeChatId,
				data: {
					content,
					replyToId: replyingTo?.id,
				},
				senderId: user.id,
				tempId: `temp-${Date.now()}`,
			});

			setReplyingTo(null);
		},
		[activeChatId, user?.id, replyingTo, sendMessage],
	);

	const handleEdit = useCallback(
		(messageId: string, content: string) => {
			if (!activeChatId) return;
			updateMessage({
				chatId: activeChatId,
				messageId,
				data: { content },
			});
		},
		[activeChatId, updateMessage],
	);

	const handleDelete = useCallback(
		(messageId: string) => {
			if (!activeChatId) return;
			deleteMessage({ chatId: activeChatId, messageId });
		},
		[activeChatId, deleteMessage],
	);

	const handleReply = useCallback((message: Message) => {
		setReplyingTo(message);
	}, []);

	// Handle scroll for infinite scroll and position tracking
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

	const handleViewDetails = useCallback((user: ChatMember | null) => {
		setSelectedUserId(user?.userId ?? null);
	}, []);

	const handleCloseDrawer = useCallback(() => {
		setSelectedUserId(null);
	}, []);

	const getOtherMember = (chat: Chat) => {
		return chat.members?.[0] ?? null;
	};

	if (!isAdmin) {
		return (
			<Center h="100%">
				<Text c="dimmed">Access denied. Admin only.</Text>
			</Center>
		);
	}

	const activeChat = chats.find((c) => c.id === activeChatId);
	const activeMember = activeChat ? getOtherMember(activeChat) : undefined;
	// Use global presence (user logged in anywhere)
	const isUserOnline = activeMember
		? onlineUserIds.includes(activeMember.userId)
		: false;

	// Build userNames map for typing indicator
	const userNames = useMemo(() => {
		const names: Record<string, string> = {};
		if (activeChat?.members) {
			for (const member of activeChat.members) {
				names[member.userId] = member.displayName || member.email || "User";
			}
		}
		return names;
	}, [activeChat?.members]);

	return (
		<Box
			style={{
				display: "flex",
				height: "calc(100dvh - 60px)",
				overflow: "hidden",
				margin: "-1rem",
			}}
		>
			{/* Chat List Sidebar */}
			<Paper
				w={320}
				withBorder
				radius={0}
				style={{
					borderLeft: "none",
					borderTop: "none",
					borderBottom: "none",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
				}}
			>
				{/* Header */}
				<Group
					p="md"
					justify="space-between"
					style={{
						background:
							"linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-blue-7) 100%)",
						height: "70px",
					}}
				>
					<Group gap="xs">
						<IconMessageCircle size={24} color="white" />
						<Text c="white" fw={600} size="lg">
							Support Chats
						</Text>
					</Group>
					<Tooltip
						label={upperFirst(isConnected ? "connected" : "connecting")}
						position="bottom"
					>
						<IconCircle
							size={16}
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

				{/* Chat List */}
				<ScrollArea style={{ flex: 1 }}>
					{chatsLoading ? (
						<Center h={200}>
							<Loader size="md" />
						</Center>
					) : chats.length === 0 ? (
						<Center h={200}>
							<Text c="dimmed" size="sm">
								No chats yet
							</Text>
						</Center>
					) : (
						<Stack gap={0}>
							{chats.map((chat) => {
								const otherMember = getOtherMember(chat);
								const isActive = chat.id === activeChatId;
								const hasUnread = (chat.unreadCount ?? 0) > 0;
								// Use global presence (user logged in anywhere)
								const memberOnline = otherMember
									? onlineUserIds.includes(otherMember.userId)
									: false;

								return (
									<Paper
										key={chat.id}
										p="md"
										withBorder
										radius={0}
										style={{
											cursor: "pointer",
											backgroundColor: isActive
												? "var(--mantine-color-blue-light)"
												: "transparent",
											borderLeft: isActive
												? "3px solid var(--mantine-color-blue-6)"
												: "none",
											transition: "all 0.2s",
										}}
										onClick={() => handleSelectChat(chat)}
									>
										<Group gap="sm" wrap="nowrap">
											<Avatar
												src={otherMember?.avatarUrl}
												alt={otherMember?.displayName || "User"}
												radius="xl"
												size="md"
												color="blue"
											>
												{otherMember?.displayName?.charAt(0).toUpperCase() ||
													"?"}
											</Avatar>
											<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
												<Group gap="xs" justify="space-between" wrap="nowrap">
													<Text
														size="sm"
														fw={hasUnread ? 600 : 500}
														lineClamp={1}
														style={{ flex: 1, minWidth: 0 }}
													>
														{otherMember?.displayName ||
															otherMember?.email ||
															"Unknown User"}
													</Text>
													<Group gap={4} wrap="nowrap">
														{memberOnline && (
															<IconCircle size={8} fill="green" color="green" />
														)}
														{hasUnread && (
															<Badge
																size="xs"
																color="red"
																variant="filled"
																circle
															>
																{chat.unreadCount}
															</Badge>
														)}
													</Group>
												</Group>
												<Text
													size="xs"
													fw={hasUnread ? 700 : 400}
													lineClamp={1}
													fs={
														chat.lastMessage?.isDeleted ? "italic" : undefined
													}
												>
													{chat.lastMessage?.isDeleted
														? "This message was deleted"
														: chat.lastMessage?.content || "No messages yet"}
												</Text>
												<Text size="xs" c="dimmed" lineClamp={1}>
													<TimeAgo
														date={chat.lastMessage?.createdAt || chat.updatedAt}
														live
													/>
												</Text>
											</Stack>
										</Group>
									</Paper>
								);
							})}
						</Stack>
					)}
				</ScrollArea>
			</Paper>

			{/* Chat Window */}
			<Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
				{activeChatId && activeChat ? (
					<>
						{/* Chat Header */}
						<Paper
							p="md"
							withBorder
							radius={0}
							style={{
								borderTop: "none",
								borderRight: "none",
								background:
									"linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-blue-7) 100%)",
							}}
						>
							<Group justify="space-between">
								<Group gap="sm">
									<Avatar
										src={activeMember?.avatarUrl}
										alt={activeMember?.displayName || "User"}
										radius="xl"
										size="md"
										color="white"
										style={{ cursor: "pointer" }}
										onClick={() => handleViewDetails(activeMember!)}
									>
										{activeMember?.displayName?.charAt(0).toUpperCase() || "?"}
									</Avatar>
									<Stack gap={0}>
										<Group gap="xs">
											<Text c="white" fw={600} size="sm">
												{activeMember?.displayName || "Unknown User"}
											</Text>
											<Badge
												size="xs"
												color={isUserOnline ? "green" : "gray"}
												variant="filled"
											>
												{isUserOnline ? "Online" : "Offline"}
											</Badge>
										</Group>
									</Stack>
								</Group>
							</Group>
						</Paper>

						{/* Messages Area */}
						<Box style={{ flex: 1, position: "relative", overflow: "hidden" }}>
							<ScrollArea
								h="100%"
								viewportRef={viewport}
								p="md"
								onScrollPositionChange={handleScroll}
							>
								{messagesLoading || (isFetching && !cursor) ? (
									<Center h="100%">
										<Loader size="md" />
									</Center>
								) : messages.length === 0 ? (
									<Center h="100%">
										<Stack gap="xs" align="center">
											<Text c="dimmed" size="sm" ta="center" fw={500}>
												No messages yet
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
												chatId={activeChatId}
												showAvatar={
													index === 0 ||
													messages[index - 1].senderId !== msg.senderId
												}
												onEdit={handleEdit}
												onDelete={handleDelete}
												onReply={handleReply}
												senderName={
													msg.senderId !== user?.id
														? (activeMember?.displayName as string | undefined)
														: undefined
												}
												senderAvatarUrl={
													msg.senderId !== user?.id
														? activeMember?.avatarUrl
														: undefined
												}
											/>
										))}
									</Stack>
								)}
							</ScrollArea>
						</Box>

						{/* Typing Indicator - outside scroll so always visible */}
						<TypingIndicator typingUsers={typingUsers} userNames={userNames} />

						{/* Input Area */}
						<MessageInput
							onSend={handleSend}
							disabled={!isConnected}
							replyingTo={replyingTo}
							onCancelReply={() => setReplyingTo(null)}
							chatId={activeChatId}
							userId={user?.id}
						/>
					</>
				) : (
					<Center h="100%">
						<Stack gap="xs" align="center">
							<IconMessageCircle size={64} color="gray" />
							<Text c="dimmed" size="lg" fw={500}>
								Select a chat to start
							</Text>
							<Text c="dimmed" size="sm" ta="center">
								Choose a conversation from the sidebar
							</Text>
						</Stack>
					</Center>
				)}
			</Box>

			<UserDetailDrawer
				userId={selectedUserId}
				disableActions
				onClose={handleCloseDrawer}
				onChangeTier={() => {}}
				onBlock={() => {}}
				onUnblock={() => {}}
				onDelete={() => {}}
			/>
		</Box>
	);
}
