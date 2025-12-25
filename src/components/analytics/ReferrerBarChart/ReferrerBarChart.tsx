import { BarChart } from "@mantine/charts";
import { Paper, Stack, Title } from "@mantine/core";
import type { TopReferrer } from "@/types";
import { AnalyticsEmptyState } from "../AnalyticsEmptyState";

export interface ReferrerBarChartProps {
	/**
	 * Top referrers data
	 */
	data: TopReferrer[];

	/**
	 * Loading state
	 */
	loading?: boolean;

	/**
	 * Chart title
	 * @default "Top Referrers"
	 */
	title?: string;

	/**
	 * Number of top referrers to display
	 * @default 5
	 */
	limit?: number;

	/**
	 * Chart height in pixels
	 * @default 300
	 */
	height?: number;
}

/**
 * ReferrerBarChart Component
 *
 * Displays a horizontal bar chart showing top traffic sources/referrers.
 * PRO feature for both individual link and global analytics.
 */
export function ReferrerBarChart({
	data,
	loading,
	title = "Top Referrers",
	limit = 5,
	height = 300,
}: Readonly<ReferrerBarChartProps>) {
	if (loading || !data || data.length === 0) {
		return (
			<AnalyticsEmptyState
				title={title}
				message="No referrer data available"
				height={height}
				loading={loading}
			/>
		);
	}

	// Limit to top N referrers
	const topReferrers = data.slice(0, limit);

	// Format data for Mantine BarChart
	const chartData = topReferrers.map((item) => ({
		referrer:
			item.referrer === "Direct" || !item.referrer ? "Direct" : item.referrer,
		clicks: item.count,
	}));

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="md">
				<Title order={4}>{title}</Title>
				<BarChart
					h={height}
					data={chartData}
					dataKey="referrer"
					series={[{ name: "clicks", label: "Clicks", color: "indigo.6" }]}
					orientation="horizontal"
					gridAxis="x"
					withLegend={false}
					yAxisProps={{
						width: 100,
						tickFormatter: (value: string) => {
							// Truncate long referrer URLs
							if (value.length > 15) {
								return `${value.substring(0, 12)}...`;
							}
							return value;
						},
					}}
					valueFormatter={(value) => `${value} clicks`}
				/>
			</Stack>
		</Paper>
	);
}
