import { Button, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";

export interface EmptyStateProps {
	/** Icon to display */
	icon?: TablerIcon;
	/** Main title */
	title: string;
	/** Description text */
	description?: string;
	/** Primary action button text */
	actionLabel?: string;
	/** Action button click handler */
	onAction?: () => void;
}

/**
 * Reusable empty state component for tables/lists
 */
export function EmptyState({
	icon: Icon = IconPlus,
	title,
	description,
	actionLabel,
	onAction,
}: EmptyStateProps) {
	return (
		<Stack align="center" gap="md" py="xl">
			<ThemeIcon size={60} radius="xl" variant="light" color="gray">
				<Icon size={30} />
			</ThemeIcon>
			<Stack align="center" gap="xs">
				<Title order={3} ta="center">
					{title}
				</Title>
				{description && (
					<Text c="dimmed" size="sm" ta="center" maw={400}>
						{description}
					</Text>
				)}
			</Stack>
			{actionLabel && onAction && (
				<Button leftSection={<IconPlus size={16} />} onClick={onAction}>
					{actionLabel}
				</Button>
			)}
		</Stack>
	);
}

