import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

export interface TypingIndicatorProps {
	userName: string;
}

export function TypingIndicator({ userName }: Readonly<TypingIndicatorProps>) {
	return (
		<Group gap="xs" px="md" py="xs">
			<ThemeIcon variant="transparent" color="gray" size="sm">
				<IconDots
					style={{
						animation: "pulse 1.5s infinite",
					}}
				/>
			</ThemeIcon>
			<Text size="xs" c="dimmed" fs="italic">
				{userName} is typing...
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
