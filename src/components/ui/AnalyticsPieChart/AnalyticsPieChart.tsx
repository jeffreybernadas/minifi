import { PieChart } from "@mantine/charts";
import { Paper, Stack, Title, useMantineTheme } from "@mantine/core";
import { AnalyticsEmptyState } from "@/components/analytics/AnalyticsEmptyState";

export interface AnalyticsPieChartDatum {
	device?: string;
	browser?: string;
	count: number;
}

export interface AnalyticsPieChartProps {
	/**
	 * Pie chart data
	 */
	data: AnalyticsPieChartDatum[];

	/**
	 * Loading state
	 */
	loading?: boolean;

	/**
	 * Chart title
	 */
	title?: string;

	/**
	 * Chart height in pixels
	 * @default 300
	 */
	height?: number;

	/**
	 * Empty state message
	 * @default "No data available"
	 */
	emptyMessage?: string;
}

const COLOR_MAP: Array<{ match: RegExp; color: string }> = [
	{ match: /chrome/, color: "red" },
	{ match: /firefox/, color: "orange" },
	{ match: /safari/, color: "blue" },
	{ match: /edge/, color: "teal" },
	{ match: /opera/, color: "pink" },
	{ match: /internet explorer|ie/, color: "gray" },
	{ match: /mobile/, color: "cyan" },
	{ match: /desktop/, color: "indigo" },
	{ match: /tablet/, color: "lime" },
];

const getMappedColor = (
	label: string,
	fallbackColors: string[],
	fallbackIndex: number,
): string => {
	const normalized = label.toLowerCase();
	const mapped = COLOR_MAP.find((item) => item.match.test(normalized))?.color;
	return mapped || fallbackColors[fallbackIndex % fallbackColors.length];
};

/**
 * AnalyticsPieChart Component
 *
 * Shared pie chart used for device/browser breakdowns.
 */
export function AnalyticsPieChart({
	data,
	loading,
	title,
	height = 300,
	emptyMessage = "No data available",
}: Readonly<AnalyticsPieChartProps>) {
	const theme = useMantineTheme();
	if (loading || !data || data.length === 0) {
		return (
			<AnalyticsEmptyState
				title={title}
				message={emptyMessage}
				height={height}
				loading={loading}
			/>
		);
	}

	const fallbackColors = [
		theme.colors.blue[6],
		theme.colors.violet[6],
		theme.colors.green[6],
		theme.colors.orange[6],
		theme.colors.red[6],
		theme.colors.yellow[6],
	];

	const chartData = data.map((item, index) => ({
		name: item.device || item.browser || "Unknown",
		value: item.count,
		color: getMappedColor(
			item.device || item.browser || "Unknown",
			fallbackColors,
			index,
		),
	}));

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="md">
				{title && <Title order={4}>{title}</Title>}
				<PieChart
					h={height}
					data={chartData}
					withLabels
					withLabelsLine
					labelsPosition="inside"
					labelsType="value"
					withTooltip
					tooltipDataSource="segment"
					valueFormatter={(value) => `${value} clicks`}
					size={height}
					style={{ margin: "0 auto" }}
				/>
			</Stack>
		</Paper>
	);
}
