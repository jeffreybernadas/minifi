import {
	ActionIcon,
	Avatar,
	Flex,
	Group,
	Menu,
	Paper,
	Stack,
	Text,
	Textarea,
	Tooltip,
} from "@mantine/core";
import {
	IconCheck,
	IconCornerUpLeft,
	IconDots,
	IconEdit,
	IconTrash,
	IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import TimeAgo from "react-timeago";
import { useAuth } from "@/hooks";
import type { Message } from "@/types";

export interface MessageBubbleProps {
	message: Message;
	showAvatar?: boolean;
	onEdit?: (messageId: string, content: string) => void;
	onDelete?: (messageId: string) => void;
	onReply?: (message: Message) => void;
	chatId: string;
	/** Display name for the sender (for non-current-user messages) */
	senderName?: string;
	/** Avatar URL for the sender (for non-current-user messages) */
	senderAvatarUrl?: string | null;
}

function MessageMenu({
	isMe,
	setIsEditing,
	handleDelete,
}: Readonly<{
	isMe: boolean;
	setIsEditing: (value: boolean) => void;
	handleDelete: () => void;
}>) {
	return (
		<Menu position={isMe ? "bottom-end" : "bottom-start"} zIndex={1001}>
			<Menu.Target>
				<ActionIcon size="xs" variant="subtle" color="gray">
					<IconDots size={14} />
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item
					leftSection={<IconEdit size={16} />}
					onClick={() => setIsEditing(true)}
				>
					Edit
				</Menu.Item>
				<Menu.Item
					leftSection={<IconTrash size={16} />}
					color="red"
					onClick={handleDelete}
				>
					Delete
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}

function ReplyArrow({
	onReply,
	message,
}: Readonly<{ onReply?: (message: Message) => void; message: Message }>) {
	return (
		<IconCornerUpLeft
			size={16}
			onClick={() => onReply?.(message)}
			style={{ cursor: "pointer" }}
		/>
	);
}

export function MessageBubble({
	message,
	showAvatar = true,
	onEdit,
	onDelete,
	onReply,
	chatId: _chatId,
	senderName,
	senderAvatarUrl,
}: Readonly<MessageBubbleProps>) {
	const { user } = useAuth();
	const isMe = message.senderId === user?.id;
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(message.content);

	const handleEdit = () => {
		if (onEdit && editContent.trim() && editContent !== message.content) {
			onEdit(message.id, editContent.trim());
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditContent(message.content);
		setIsEditing(false);
	};

	const handleDelete = () => {
		if (onDelete) {
			onDelete(message.id);
		}
	};

	if (message.isDeleted) {
		return (
			<Group
				align="flex-end"
				justify={isMe ? "flex-end" : "flex-start"}
				gap="xs"
				w="100%"
			>
				{!isMe && showAvatar && (
					<Avatar
						src={senderAvatarUrl}
						alt={senderName || "Support"}
						radius="xl"
						size="sm"
						color="gray"
					>
						{(senderName || "S").charAt(0).toUpperCase()}
					</Avatar>
				)}
				{!isMe && !showAvatar && <div style={{ width: 26 }} />}
				<Stack gap={2} maw="75%">
					<Flex gap="md" align="center">
						<ReplyArrow onReply={onReply} message={message} />
						<Paper
							p="xs"
							radius="md"
							bg="var(--mantine-color-gray-light)"
							c="dimmed"
							style={{
								borderBottomRightRadius: isMe ? 0 : undefined,
								borderBottomLeftRadius: !isMe ? 0 : undefined,
								fontStyle: "italic",
							}}
						>
							<Text size="sm" c="dimmed">
								This message was deleted
							</Text>
						</Paper>
					</Flex>
					<Text size="xs" c="dimmed" ta={isMe ? "right" : "left"}>
						<TimeAgo date={message.createdAt} live />
					</Text>
				</Stack>
			</Group>
		);
	}

	return (
		<Group
			align="flex-end"
			justify={isMe ? "flex-end" : "flex-start"}
			gap="xs"
			w="100%"
			style={{ position: "relative" }}
		>
			{!isMe && showAvatar && (
				<Tooltip label={senderName || "Support Agent"} zIndex={1001}>
					<Avatar
						src={senderAvatarUrl}
						alt={senderName || "Support"}
						radius="xl"
						size="sm"
						color="blue"
					>
						{(senderName || "S").charAt(0).toUpperCase()}
					</Avatar>
				</Tooltip>
			)}
			{!isMe && !showAvatar && <div style={{ width: 26 }} />}

			<Stack gap={2} maw="75%" style={{ position: "relative" }}>
				<Flex gap="md" direction={isMe ? "row" : "row-reverse"}>
					<Group
						gap={4}
						style={{
							[isMe ? "right" : "left"]: 0,
						}}
						className="message-actions"
					>
						<ReplyArrow onReply={onReply} message={message} />
						{isMe && (
							<MessageMenu
								isMe={isMe}
								setIsEditing={setIsEditing}
								handleDelete={handleDelete}
							/>
						)}
					</Group>
					<Paper
						p="xs"
						radius="md"
						bg={isMe ? "blue" : "var(--mantine-color-gray-filled)"}
						c={"white"}
						style={{
							boxShadow: isMe
								? "0 1px 2px rgba(0,0,0,0.1)"
								: "0 1px 2px rgba(0,0,0,0.05)",
						}}
					>
						{isEditing ? (
							<Stack gap="xs">
								<Textarea
									value={editContent}
									onChange={(e) => setEditContent(e.currentTarget.value)}
									minRows={1}
									maxRows={4}
									autosize
									autoFocus
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleEdit();
										}
										if (e.key === "Escape") {
											handleCancel();
										}
									}}
									styles={{
										input: {
											backgroundColor: isMe
												? "rgba(255,255,255,0.2)"
												: undefined,
											color: isMe ? "white" : undefined,
											border: `1px solid ${
												isMe ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)"
											}`,
										},
									}}
								/>
								<Group gap="xs" justify="flex-end">
									<ActionIcon
										size="sm"
										variant="subtle"
										onClick={handleCancel}
										color="white"
									>
										<IconX size={16} />
									</ActionIcon>
									<ActionIcon
										size="sm"
										variant="subtle"
										onClick={handleEdit}
										color="white"
										disabled={
											!editContent.trim() || editContent === message.content
										}
									>
										<IconCheck size={16} />
									</ActionIcon>
								</Group>
							</Stack>
						) : (
							<>
								{/* Reply context */}
								{message.replyTo && (
									<Paper
										p="xs"
										mb="xs"
										radius="sm"
										style={{
											borderLeft: "2px solid var(--mantine-color-blue-5)",
											backgroundColor: "rgba(255,255,255,0.2)",
										}}
									>
										<Text size="xs" c={isMe ? "blue.1" : "blue.6"} fw={500}>
											Replying to
										</Text>
										<Text size="xs" c={isMe ? "white" : "dark"} lineClamp={2}>
											{message.replyTo.isDeleted
												? "Deleted message"
												: message.replyTo.content}
										</Text>
									</Paper>
								)}
								<Text
									size="sm"
									style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
								>
									{message.content}
								</Text>
							</>
						)}
					</Paper>
				</Flex>
				<Group gap={4} justify={isMe ? "flex-end" : "flex-start"}>
					<Text size="xs" c="dimmed">
						<TimeAgo date={message.createdAt} live />
					</Text>
					{message.isEdited && !isEditing && (
						<Tooltip
							label={new Date(message.updatedAt).toLocaleString()}
							position="top"
							zIndex={1001}
						>
							<Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>
								(edited)
							</Text>
						</Tooltip>
					)}
				</Group>
			</Stack>
		</Group>
	);
}
