import {
	Center,
	Grid,
	Loader,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useState } from "react";
import { useGetGlobalAnalyticsQuery } from "@/app/api/links.api";
import { ReferrerBarChart } from "@/components/analytics";
import { ProFeatureGuard } from "@/components/common";
import { AnalyticsPieChart } from "@/components/ui";
import { useAuth } from "@/hooks";
import type { TopDevice } from "@/types";

/**
 * AnalyticsAudiencePage
 *
 * Audience analytics showing device, browser, OS breakdowns and traffic sources
 * Route: /dashboard/analytics/audience
 */
export default function AnalyticsAudiencePage() {
	const { isPro } = useAuth();
	const [dateRange, setDateRange] = useState<[string | null, string | null]>([
		null,
		null,
	]);
	const [startDate, endDate] = dateRange;

	// Fetch global analytics
	const {
		data: analytics,
		isLoading,
		isFetching,
	} = useGetGlobalAnalyticsQuery(
		{ startDate: startDate!, endDate: endDate! },
		{ skip: Boolean(startDate) !== Boolean(endDate) },
	);

	if (isLoading) {
		return (
			<Center h={400}>
				<Loader size="xl" />
			</Center>
		);
	}

	if (!analytics) {
		return (
			<Paper withBorder p="xl" radius="md">
				<Center>
					<Text c="dimmed">No analytics data available</Text>
				</Center>
			</Paper>
		);
	}

	const { topDevices, topBrowsers, topOs, topReferrers } = analytics;

	// Convert TopDeviceData to TopDevice format for AnalyticsPieChart
	const devicesForChart: TopDevice[] = topDevices.map((d) => ({
		device: d.device,
		count: d.clicks,
	}));
	const browsersForChart: TopDevice[] = topBrowsers.map((b) => ({
		device: b.browser,
		count: b.clicks,
	}));
	const osForChart: TopDevice[] = topOs.map((o) => ({
		device: o.os,
		count: o.clicks,
	}));

	return (
		<Stack gap="lg">
			<Grid gutter="md" w="100%">
				<Grid.Col span={{ base: 12, sm: 6 }}>
					<Title order={1}>Audience Analytics</Title>
					<Text c="dimmed" size="sm" mt={4}>
						Understand your audience with device, browser, and traffic source
						breakdowns
					</Text>
				</Grid.Col>
				<Grid.Col
					span={{ base: 12, sm: 6 }}
					display="flex"
					style={{ justifyContent: "flex-end" }}
				>
					<Tooltip
						label="Upgrade to PRO to filter by custom date range"
						disabled={isPro}
						withArrow
					>
						<DatePickerInput
							type="range"
							placeholder="Filter by date"
							value={dateRange}
							onChange={setDateRange}
							clearable
							maxDate={new Date()}
							disabled={!isPro}
							size="sm"
							w="50%"
							styles={{
								input: {
									fontSize: "0.875rem",
								},
							}}
						/>
					</Tooltip>
				</Grid.Col>
			</Grid>

			{/* Device Breakdown - Available to ALL users */}
			<AnalyticsPieChart
				data={devicesForChart}
				title="Device Breakdown"
				height={350}
				emptyMessage="No device data available"
				loading={isLoading || isFetching}
			/>

			{/* Browser & OS Breakdowns - PRO Only */}
			<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
				<ProFeatureGuard
					isPro={isPro}
					featureName="Browser Analytics"
					upgradeMessage="See which browsers your visitors use to access your links."
				>
					<AnalyticsPieChart
						data={browsersForChart}
						title="Browser Breakdown"
						height={300}
						emptyMessage="No browser data available"
						loading={isLoading || isFetching}
					/>
				</ProFeatureGuard>

				<ProFeatureGuard
					isPro={isPro}
					featureName="Operating System Analytics"
					upgradeMessage="Discover which operating systems your audience uses."
				>
					<AnalyticsPieChart
						data={osForChart}
						title="OS Breakdown"
						height={300}
						emptyMessage="No OS data available"
						loading={isLoading || isFetching}
					/>
				</ProFeatureGuard>
			</SimpleGrid>

			{/* Traffic Sources - PRO Only */}
			<ProFeatureGuard
				isPro={isPro}
				featureName="Traffic Sources"
				upgradeMessage="Discover where your traffic is coming from with detailed referrer tracking across all your links."
			>
				<ReferrerBarChart
					data={topReferrers.map((r) => ({
						referrer: r.referrer,
						count: r.clicks,
					}))}
					title="Top Traffic Sources"
					limit={10}
					height={400}
					loading={isLoading || isFetching}
				/>
			</ProFeatureGuard>
		</Stack>
	);
}
