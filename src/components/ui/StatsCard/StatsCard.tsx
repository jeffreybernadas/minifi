import { Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import {
	IconArrowDown,
	IconArrowUp,
	type TablerIcon,
} from "@tabler/icons-react";

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
	/** Optional growth value */
	growth?: number;
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
	growth,
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
					{growth && (
						<Group gap={4}>
							{growth && growth >= 0 ? (
								<IconArrowUp size={16} color="var(--mantine-color-green-6)" />
							) : (
								<IconArrowDown size={16} color="var(--mantine-color-red-6)" />
							)}
							<Text size="xs" c={growth >= 0 ? "green" : "red"} fw={500}>
								{Math.abs(growth).toFixed(1)}% vs last month
							</Text>
						</Group>
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
