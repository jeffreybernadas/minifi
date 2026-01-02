import { LineChart } from "@mantine/charts";
import { Paper, Stack, Text, Title } from "@mantine/core";
import { AnalyticsEmptyState } from "../AnalyticsEmptyState";

export interface MultiSeriesLineChartProps {
	/**
	 * Chart data - each object should have a date key and values for each series
	 */
	data: Record<string, string | number>[];

	/**
	 * Series configuration for each line
	 */
	series: Array<{ name: string; label: string; color: string }>;

	/**
	 * Loading state
	 */
	loading?: boolean;

	/**
	 * Chart title
	 * @default "Trend Chart"
	 */
	title?: string;

	/**
	 * Subtitle text (e.g., "Daily data for the last 30 days")
	 */
	subtitle?: string;

	/**
	 * Chart height in pixels
	 * @default 350
	 */
	height?: number;

	/**
	 * Data key for the x-axis
	 * @default "date"
	 */
	dataKey?: string;
}

/**
 * MultiSeriesLineChart Component
 *
 * Displays a line chart with multiple data series.
 * Used for showing trends over time with multiple metrics.
 *
 * Pattern based on ClicksTimelineChart.
 */
export function MultiSeriesLineChart({
	data,
	series,
	loading,
	title = "Trend Chart",
	subtitle,
	height = 350,
	dataKey = "date",
}: Readonly<MultiSeriesLineChartProps>) {
	if (loading || !data || data.length === 0) {
		return (
			<AnalyticsEmptyState
				title={title}
				message="No trend data available"
				height={height}
				loading={loading}
			/>
		);
	}

	// Sort data by date
	const sortedData = [...data].sort(
		(a, b) =>
			new Date(a[dataKey] as string).getTime() -
			new Date(b[dataKey] as string).getTime(),
	);

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="md">
				<div>
					<Title order={4}>{title}</Title>
					{subtitle && (
						<Text size="sm" c="dimmed" mt={4}>
							{subtitle}
						</Text>
					)}
				</div>
				<LineChart
					h={height}
					data={sortedData}
					dataKey={dataKey}
					series={series}
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
