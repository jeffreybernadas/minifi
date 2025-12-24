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
import { IconCircle, IconMessageCircle } from "@tabler/icons-react";
import { useRef, useEffect, useState, useCallback } from "react";
import TimeAgo from "react-timeago";
import { upperFirst } from "@mantine/hooks";
import { useAuth } from "@/hooks";
import {
	useGetUserChatsQuery,
	useGetChatMessagesQuery,
	useGetChatPresenceQuery,
	useSendMessageMutation,
	useUpdateMessageMutation,
	useDeleteMessageMutation,
	useMarkChatAsReadMutation,
} from "@/app/api/chat.api";
import { isSocketConnected } from "@/lib/socket";
import { MessageBubble } from "@/components/chat/MessageBubble/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator/TypingIndicator";
import type { Chat, Message } from "@/types";

export default function AdminChatPage() {
	const { user, isAdmin } = useAuth();
	const viewport = useRef<HTMLDivElement>(null);
	const prevMessagesLengthRef = useRef(0);

	const [activeChatId, setActiveChatId] = useState<string | null>(null);
	const [replyingTo, setReplyingTo] = useState<Message | null>(null);

	// Fetch all chats for admin
	const { data: chats = [], isLoading: chatsLoading } = useGetUserChatsQuery(
		undefined,
		{ skip: !isAdmin },
	);

	// Fetch messages for active chat
	const { data: messagesData, isLoading: messagesLoading } =
		useGetChatMessagesQuery({ chatId: activeChatId! }, { skip: !activeChatId });

	// Get typing/online presence for active chat
	const { data: presence } = useGetChatPresenceQuery(activeChatId!, {
		skip: !activeChatId,
	});

	const messages = messagesData?.data ?? [];
	const typingUsers = presence?.typingUsers ?? [];
	const onlineUsers = presence?.onlineUsers ?? [];

	// Mutations
	const [sendMessage] = useSendMessageMutation();
	const [updateMessage] = useUpdateMessageMutation();
	const [deleteMessage] = useDeleteMessageMutation();
	const [markChatAsRead] = useMarkChatAsReadMutation();

	const isConnected = isSocketConnected();

	// Auto-scroll when new messages arrive
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

	const handleSelectChat = useCallback(
		(chat: Chat) => {
			setReplyingTo(null);
			setActiveChatId(chat.id);
			// Mark as read when selecting
			if ((chat.unreadCount ?? 0) > 0) {
				markChatAsRead(chat.id);
			}
		},
		[markChatAsRead],
	);

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
	const activeMember = activeChat ? getOtherMember(activeChat) : null;
	const isUserOnline = activeMember
		? onlineUsers.includes(activeMember.userId)
		: false;

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
								const memberOnline = otherMember
									? onlineUsers.includes(otherMember.userId)
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
												>
													{chat.lastMessage?.content || "No messages yet"}
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
									>
										{activeMember?.displayName?.charAt(0).toUpperCase() || "?"}
									</Avatar>
									<Stack gap={0}>
										<Group gap="xs">
											<Text c="white" fw={600} size="sm">
												{activeMember?.displayName || "Unknown User"}
											</Text>
											{isUserOnline && (
												<Badge
													size="xs"
													color="green"
													variant="filled"
													leftSection={
														<IconCircle size={6} fill="white" color="white" />
													}
												>
													Online
												</Badge>
											)}
										</Group>
										<Text c="blue.1" size="xs">
											{isUserOnline ? "Active now" : "Offline"}
										</Text>
									</Stack>
								</Group>
							</Group>
						</Paper>

						{/* Messages Area */}
						<Box style={{ flex: 1, position: "relative", overflow: "hidden" }}>
							<ScrollArea h="100%" viewportRef={viewport} p="md">
								{messagesLoading ? (
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
												senderName={activeMember?.displayName as string}
												senderAvatarUrl={activeMember?.avatarUrl}
											/>
										))}
									</Stack>
								)}
							</ScrollArea>
						</Box>

						{/* Typing Indicator - outside scroll so always visible */}
						<TypingIndicator typingUsers={typingUsers} />

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
		</Box>
	);
}
