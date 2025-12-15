import { Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import type { TablerIcon } from "@tabler/icons-react";

export interface StatsCardProps {
	/** Card title/label */
	title: string;
	/** Main value to display */
	value: string | number;
	/** Optional icon component */
	icon?: TablerIcon;
	/** Icon color */
	iconColor?: string;
	/** Optional description/subtitle */
	description?: string;
	/** Loading state */
	loading?: boolean;
}

/**
 * Reusable stats card for displaying metrics
 */
export function StatsCard({
	title,
	value,
	icon: Icon,
	iconColor = "blue",
	description,
	loading = false,
}: StatsCardProps) {
	return (
		<Paper withBorder p="md" radius="md">
			<Group justify="space-between" align="flex-start">
				<Stack gap={4}>
					<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
						{title}
					</Text>
					<Text size="xl" fw={700}>
						{loading ? "—" : value}
					</Text>
					{description && (
						<Text size="xs" c="dimmed">
							{description}
						</Text>
					)}
				</Stack>
				{Icon && (
					<ThemeIcon size={40} radius="md" variant="light" color={iconColor}>
						<Icon size={22} />
					</ThemeIcon>
				)}
			</Group>
		</Paper>
	);
}

