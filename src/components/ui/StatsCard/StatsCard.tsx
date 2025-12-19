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
}: Readonly<StatsCardProps>) {
	return (
		<Paper withBorder p="md" radius="md">
			<Group justify="space-between" align="flex-start" wrap="nowrap">
				<Stack gap={4} style={{ overflow: "hidden" }}>
					<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
						{title}
					</Text>
					<Text
						size="lg"
						fw={700}
						style={{
							lineHeight: 1.2,
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
						title={String(value)}
					>
						{loading ? "—" : value}
					</Text>
					{description && (
						<Text size="xs" c="dimmed">
							{description}
						</Text>
					)}
				</Stack>
				{Icon && (
					<ThemeIcon
						size={36}
						radius="md"
						variant="light"
						color={iconColor}
						style={{ flexShrink: 0 }}
					>
						<Icon size={20} />
					</ThemeIcon>
				)}
			</Group>
		</Paper>
	);
}
