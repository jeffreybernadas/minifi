import { LineChart } from "@mantine/charts";
import { Paper, Stack, Title } from "@mantine/core";
import type { ClicksByDate } from "@/types";
import { AnalyticsEmptyState } from "../AnalyticsEmptyState";

export interface ClicksTimelineChartProps {
	/**
	 * Clicks by date data
	 */
	data: ClicksByDate[];

	/**
	 * Loading state
	 */
	loading?: boolean;

	/**
	 * Chart title
	 * @default "Clicks Over Time"
	 */
	title?: string;

	/**
	 * Chart height in pixels
	 * @default 300
	 */
	height?: number;
}

/**
 * ClicksTimelineChart Component
 *
 * Displays a line chart showing clicks over time.
 * Used for both individual link and global analytics.
 */
export function ClicksTimelineChart({
	data,
	loading,
	title = "Clicks Over Time",
	height = 300,
}: Readonly<ClicksTimelineChartProps>) {
	if (loading || !data || data.length === 0) {
		return (
			<AnalyticsEmptyState
				title={title}
				message="No click data available"
				height={height}
				loading={loading}
			/>
		);
	}

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="md">
				<Title order={4}>{title}</Title>
				<LineChart
					h={height}
					data={[...data].sort(
						(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
					)}
					dataKey="date"
					series={[{ name: "count", label: "Clicks", color: "blue.6" }]}
					curveType="linear"
					withLegend
					legendProps={{ verticalAlign: "bottom", height: 50 }}
					withDots
					gridAxis="xy"
					xAxisProps={{
						tickFormatter: (value: string) => {
							const date = new Date(value);
							return date.toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
							});
						},
					}}
				/>
			</Stack>
		</Paper>
	);
}
