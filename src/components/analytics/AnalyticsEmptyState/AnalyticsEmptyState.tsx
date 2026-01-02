import { Center, Loader, Paper, Stack, Text, Title } from "@mantine/core";

export interface AnalyticsEmptyStateProps {
	/**
	 * Chart/section title
	 */
	title?: string;

	/**
	 * Empty state message
	 * @default "No data available"
	 */
	message?: string;

	/**
	 * Height of the empty state
	 * @default 300
	 */
	height?: number;

	/**
	 * Whether to show border
	 * @default true
	 */
	withBorder?: boolean;

	/**
	 * Loading state
	 * @default false
	 */
	loading?: boolean;
}

/**
 * AnalyticsEmptyState Component
 *
 * Reusable empty/loading state for analytics charts.
 * Provides consistent styling across all analytics components.
 *
 * @example
 * ```tsx
 * // Loading state
 * <AnalyticsEmptyState loading height={300} />
 *
 * // Empty state
 * <AnalyticsEmptyState
 *   title="Clicks Over Time"
 *   message="No click data available yet"
 *   height={300}
 * />
 * ```
 */
export function AnalyticsEmptyState({
	title,
	message = "No data available",
	height = 300,
	withBorder = true,
	loading = false,
}: Readonly<AnalyticsEmptyStateProps>) {
	// Loading state - just show loader without title
	if (loading) {
		return (
			<Paper withBorder={withBorder} p="md" radius="md">
				<Center h={height}>
					<Loader size="lg" />
				</Center>
			</Paper>
		);
	}

	// Empty state - show title and message
	return (
		<Paper withBorder={withBorder} p="md" radius="md">
			<Stack gap="md">
				{title && <Title order={4}>{title}</Title>}
				<Center h={title ? height - 60 : height}>
					<Text c="dimmed" size="sm">
						{message}
					</Text>
				</Center>
			</Stack>
		</Paper>
	);
}
