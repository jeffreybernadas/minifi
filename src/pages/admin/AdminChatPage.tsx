import {
	Avatar,
	Badge,
	Box,
	Center,
	Group,
	Paper,
	ScrollArea,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { IconCircle, IconMessageCircle } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useAuth } from "@/hooks";
import { MessageBubble } from "@/components/chat/MessageBubble/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput/MessageInput";
import type { Chat, Message } from "@/types";
import { formatTime } from "@/utils/time.util";
import { upperFirst } from "@mantine/hooks";

export default function AdminChatPage() {
	const { user, isAdmin } = useAuth();
	const viewport = useRef<HTMLDivElement>(null);

	const [activeChatId, setActiveChatId] = useState<string | null>(null);
	const [replyingTo, setReplyingTo] = useState<Message | null>(null);
	const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({
		"chat-1": [
			{
				id: "msg-1",
				chatId: "chat-1",
				senderId: "user-1",
				content: "Hi, I need help with my subscription.",
				isEdited: false,
				isDeleted: false,
				createdAt: new Date(Date.now() - 3600000).toISOString(),
				updatedAt: new Date(Date.now() - 3600000).toISOString(),
			},
			{
				id: "msg-2",
				chatId: "chat-1",
				senderId: "admin-1",
				content: "Hello! I'd be happy to help. What seems to be the issue?",
				isEdited: false,
				isDeleted: false,
				createdAt: new Date(Date.now() - 3000000).toISOString(),
				updatedAt: new Date(Date.now() - 3000000).toISOString(),
			},
		],
		"chat-2": [
			{
				id: "msg-4",
				chatId: "chat-2",
				senderId: "user-2",
				content: "Quick question about the PRO features",
				isEdited: false,
				isDeleted: false,
				createdAt: new Date(Date.now() - 7200000).toISOString(),
				updatedAt: new Date(Date.now() - 7200000).toISOString(),
			},
		],
	});

	const chats: Chat[] = [
		{
			id: "chat-1",
			name: null,
			type: "DIRECT",
			creatorId: "user-1",
			createdAt: new Date(Date.now() - 86400000).toISOString(),
			updatedAt: new Date(Date.now() - 1800000).toISOString(),
			members: [
				{
					id: "member-1",
					userId: "user-1",
					joinedAt: new Date(Date.now() - 86400000).toISOString(),
					displayName: "John Doe",
					email: "john@example.com",
					avatarUrl: null,
				},
			],
			lastMessage: {
				id: "msg-2",
				content: "Hello! I'd be happy to help.",
				senderId: "admin-1",
				isDeleted: false,
				createdAt: new Date(Date.now() - 3000000).toISOString(),
			},
			unreadCount: 2,
		},
		{
			id: "chat-2",
			name: null,
			type: "DIRECT",
			creatorId: "user-2",
			createdAt: new Date(Date.now() - 172800000).toISOString(),
			updatedAt: new Date(Date.now() - 7200000).toISOString(),
			members: [
				{
					id: "member-3",
					userId: "user-2",
					joinedAt: new Date(Date.now() - 172800000).toISOString(),
					displayName: "Jane Smith",
					email: "jane@example.com",
					avatarUrl: null,
				},
			],
			lastMessage: {
				id: "msg-4",
				content: "Quick question about the PRO features",
				senderId: "user-2",
				isDeleted: false,
				createdAt: new Date(Date.now() - 7200000).toISOString(),
			},
			unreadCount: 0,
		},
	];

	const messages = activeChatId ? (messagesMap[activeChatId] ?? []) : [];

	const handleSelectChat = (chat: Chat) => {
		setReplyingTo(null);
		setActiveChatId(chat.id);
	};

	const handleSend = (content: string) => {
		if (!activeChatId) return;

		const newMessage: Message = {
			id: `msg-${Date.now()}`,
			chatId: activeChatId,
			senderId: user?.id || "admin-1",
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

		setMessagesMap((prev) => ({
			...prev,
			[activeChatId]: [...(prev[activeChatId] ?? []), newMessage],
		}));
		setReplyingTo(null);

		setTimeout(() => {
			viewport.current?.scrollTo({
				top: viewport.current.scrollHeight,
				behavior: "smooth",
			});
		}, 100);
	};

	const handleReply = (message: Message) => {
		setReplyingTo(message);
	};

	const handleEdit = (messageId: string, content: string) => {
		if (!activeChatId) return;
		setMessagesMap((prev) => ({
			...prev,
			[activeChatId]: prev[activeChatId].map((msg) =>
				msg.id === messageId
					? {
							...msg,
							content,
							isEdited: true,
							updatedAt: new Date().toISOString(),
						}
					: msg,
			),
		}));
	};

	const handleDelete = (messageId: string) => {
		if (!activeChatId) return;
		setMessagesMap((prev) => ({
			...prev,
			[activeChatId]: prev[activeChatId].map((msg) =>
				msg.id === messageId
					? { ...msg, isDeleted: true, updatedAt: new Date().toISOString() }
					: msg,
			),
		}));
	};

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
					<Tooltip label={upperFirst("connected")} position="bottom">
						<IconCircle
							size={16}
							fill="var(--mantine-color-green-6)"
							color="var(--mantine-color-green-6)"
							style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
						/>
					</Tooltip>
				</Group>

				{/* Chat List */}
				<ScrollArea style={{ flex: 1 }}>
					<Stack gap={0}>
						{chats.map((chat) => {
							const otherMember = getOtherMember(chat);
							const isActive = chat.id === activeChatId;
							const hasUnread = (chat.unreadCount ?? 0) > 0;

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
											{otherMember?.displayName?.charAt(0).toUpperCase() || "?"}
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
													{chat.id === "chat-1" && (
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
											<Text size="xs" fw={hasUnread ? 700 : 400} lineClamp={1}>
												{chat.lastMessage?.content || "No messages yet"}
											</Text>
											<Text size="xs" c="dimmed" lineClamp={1}>
												{formatTime(
													chat.lastMessage?.createdAt || chat.updatedAt,
												)}
											</Text>
										</Stack>
									</Group>
								</Paper>
							);
						})}
					</Stack>
				</ScrollArea>
			</Paper>

			{/* Chat Window */}
			<Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
				{activeChatId ? (
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
									{(() => {
										const activeChat = chats.find((c) => c.id === activeChatId);
										const otherMember = activeChat
											? getOtherMember(activeChat)
											: null;
										const isOnline = activeChatId === "chat-1";

										return (
											<>
												<Avatar
													src={otherMember?.avatarUrl}
													alt={otherMember?.displayName || "User"}
													radius="xl"
													size="md"
													color="white"
												>
													{otherMember?.displayName?.charAt(0).toUpperCase() ||
														"?"}
												</Avatar>
												<Stack gap={0}>
													<Group gap="xs">
														<Text c="white" fw={600} size="sm">
															{otherMember?.displayName || "Unknown User"}
														</Text>
														{isOnline && (
															<Badge
																size="xs"
																color="green"
																variant="filled"
																leftSection={
																	<IconCircle
																		size={6}
																		fill="white"
																		color="white"
																	/>
																}
															>
																Online
															</Badge>
														)}
													</Group>
													<Text c="blue.1" size="xs">
														{isOnline ? "Active now" : "Offline"}
													</Text>
												</Stack>
											</>
										);
									})()}
								</Group>
							</Group>
						</Paper>

						{/* Messages Area */}
						<Box style={{ flex: 1, position: "relative", overflow: "hidden" }}>
							<ScrollArea h="100%" viewportRef={viewport} p="md">
								{messages.length === 0 ? (
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
											/>
										))}
									</Stack>
								)}
							</ScrollArea>
						</Box>

						{/* Input Area */}
						<MessageInput
							onSend={handleSend}
							disabled={false}
							replyingTo={replyingTo}
							onCancelReply={() => setReplyingTo(null)}
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
