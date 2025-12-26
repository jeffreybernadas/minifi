import {
	ActionIcon,
	Group,
	Paper,
	Stack,
	Text,
	Textarea,
	Tooltip,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconSend, IconX } from "@tabler/icons-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { emitStoppedTyping, emitTyping } from "@/lib/socket";
import type { Message } from "@/types";

export interface MessageInputProps {
	onSend: (content: string) => void;
	disabled?: boolean;
	replyingTo?: Message | null;
	onCancelReply?: () => void;
	/** Chat ID for typing indicator emission */
	chatId?: string;
	/** User ID for typing indicator emission */
	userId?: string;
}

export function MessageInput({
	onSend,
	disabled,
	replyingTo,
	onCancelReply,
	chatId,
	userId,
}: Readonly<MessageInputProps>) {
	const [value, setValue] = useState("");
	const isTypingRef = useRef(false);
	const stopTypingTimeoutRef = useRef<
		ReturnType<typeof setTimeout> | undefined
	>(undefined);

	// Emit stopped typing when component unmounts or chatId changes
	useEffect(() => {
		return () => {
			if (isTypingRef.current && chatId && userId) {
				emitStoppedTyping(chatId, userId);
				isTypingRef.current = false;
			}
			if (stopTypingTimeoutRef.current) {
				clearTimeout(stopTypingTimeoutRef.current);
			}
		};
	}, [chatId, userId]);

	// Debounced function to emit typing - waits 300ms before emitting
	const debouncedEmitTyping = useDebouncedCallback(() => {
		if (chatId && userId && !isTypingRef.current) {
			emitTyping(chatId, userId);
			isTypingRef.current = true;
		}
	}, 300);

	// Schedule stopped typing after 1s of no input
	const scheduleStopTyping = () => {
		if (stopTypingTimeoutRef.current) {
			clearTimeout(stopTypingTimeoutRef.current);
		}
		stopTypingTimeoutRef.current = setTimeout(() => {
			if (chatId && userId && isTypingRef.current) {
				emitStoppedTyping(chatId, userId);
				isTypingRef.current = false;
			}
		}, 1000);
	};

	const handleChange = (newValue: string) => {
		setValue(newValue);
		if (newValue.trim()) {
			debouncedEmitTyping();
			scheduleStopTyping();
		} else if (chatId && userId && isTypingRef.current) {
			// Immediately stop if input is cleared
			emitStoppedTyping(chatId, userId);
			isTypingRef.current = false;
		}
	};

	const handleSend = () => {
		if (value.trim() && !disabled) {
			// Stop typing indicator immediately when sending
			if (chatId && userId && isTypingRef.current) {
				emitStoppedTyping(chatId, userId);
				isTypingRef.current = false;
			}
			if (stopTypingTimeoutRef.current) {
				clearTimeout(stopTypingTimeoutRef.current);
			}
			onSend(value.trim());
			setValue("");
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
		if (e.key === "Escape" && replyingTo && onCancelReply) {
			onCancelReply();
		}
	};

	return (
		<Paper
			p="xs"
			withBorder
			radius={0}
			style={{
				borderLeft: "none",
				borderRight: "none",
				borderBottom: "none",
			}}
		>
			<Stack gap="xs">
				{/* Reply preview */}
				{replyingTo && (
					<Paper
						p="xs"
						bg="var(--mantine-color-blue-light)"
						radius="sm"
						style={{ borderLeft: "2px solid var(--mantine-color-blue-5)" }}
					>
						<Group justify="space-between" wrap="nowrap">
							<Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
								<Text size="xs" c="blue" fw={500}>
									Replying to message
								</Text>
								<Text size="xs" c="dimmed" lineClamp={1}>
									{replyingTo.isDeleted
										? "Deleted message"
										: replyingTo.content}
								</Text>
							</Stack>
							<ActionIcon
								variant="subtle"
								size="sm"
								color="gray"
								onClick={onCancelReply}
							>
								<IconX size={14} />
							</ActionIcon>
						</Group>
					</Paper>
				)}

				{/* Input area */}
				<Group align="center" gap="xs">
					<Textarea
						placeholder={disabled ? "Connecting..." : "Type a message..."}
						value={value}
						onChange={(e) => handleChange(e.currentTarget.value)}
						onKeyDown={handleKeyDown}
						minRows={1}
						maxRows={4}
						autosize
						style={{ flex: 1 }}
						disabled={disabled}
						styles={{
							input: {
								paddingTop: 10,
								paddingBottom: 10,
								borderRadius: "var(--mantine-radius-md)",
								border: "1px solid var(--mantine-color-gray-3)",
								transition: "border-color 0.2s",
								"&:focus": {
									borderColor: "var(--mantine-color-blue-5)",
								},
							},
						}}
					/>
					<Tooltip label="Send message (Enter)" position="top" zIndex={1001}>
						<ActionIcon
							variant="filled"
							color="blue"
							size="lg"
							radius="xl"
							onClick={handleSend}
							disabled={!value.trim() || disabled}
							style={{
								transition: "all 0.2s",
								transform:
									!value.trim() || disabled ? "scale(0.95)" : "scale(1)",
								opacity: !value.trim() || disabled ? 0.6 : 1,
							}}
						>
							<IconSend size={18} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Stack>
		</Paper>
	);
}
