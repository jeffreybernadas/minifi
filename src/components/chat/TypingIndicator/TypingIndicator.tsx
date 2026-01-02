import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

export interface TypingIndicatorProps {
	/** Array of user IDs or names who are currently typing */
	typingUsers: string[];
	/** Optional map of userId to display name */
	userNames?: Record<string, string>;
}

/**
 * Shows who is typing in a chat.
 * Renders nothing if no one is typing.
 */
export function TypingIndicator({
	typingUsers,
	userNames = {},
}: Readonly<TypingIndicatorProps>) {
	if (typingUsers.length === 0) return null;

	const getDisplayName = (userId: string) => {
		return userNames[userId] || "Someone";
	};

	const getMessage = () => {
		if (typingUsers.length === 1) {
			return `${getDisplayName(typingUsers[0])} is typing...`;
		}
		if (typingUsers.length === 2) {
			return `${getDisplayName(typingUsers[0])} and ${getDisplayName(
				typingUsers[1],
			)} are typing...`;
		}
		return `${typingUsers.length} people are typing...`;
	};

	return (
		<Group gap="xs" px="md" py="xs" style={{ flexShrink: 0 }}>
			<ThemeIcon variant="transparent" color="gray" size="sm">
				<IconDots
					style={{
						animation: "pulse 1.5s infinite",
					}}
				/>
			</ThemeIcon>
			<Text size="xs" c="dimmed" fs="italic">
				{getMessage()}
			</Text>
			<style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
		</Group>
	);
}
