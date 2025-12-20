import {
	Badge,
	Grid,
	Tooltip,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import {
	IconCalendar,
	IconChartLine,
	IconLink,
	IconPointer,
	IconUsers,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useGetGlobalAnalyticsQuery } from "@/app/api/links.api";
import {
	AnalyticsEmptyState,
	ClicksTimelineChart,
	ReferrerBarChart,
	TopLinksTable,
} from "@/components/analytics";
import { ProFeatureGuard } from "@/components/common";
import { useAuth } from "@/hooks";
import { DatePickerInput } from "@mantine/dates";
import { StatsCard } from "@/components/ui";

/**
 * AnalyticsOverviewPage
 *
 * Global analytics overview showing aggregated stats across all links
 * Route: /dashboard/analytics/overview
 */
export default function AnalyticsOverviewPage() {
	const { isPro } = useAuth();
	const [dateRange, setDateRange] = useState<[string | null, string | null]>([
		null,
		null,
	]);
	const [startDate, endDate] = dateRange;

	const {
		data: analytics,
		isLoading,
		isFetching,
	} = useGetGlobalAnalyticsQuery(
		{ startDate: startDate!, endDate: endDate! },
		{ skip: Boolean(startDate) !== Boolean(endDate) },
	);

	// Calculate trends
	const clicksGrowth = useMemo(() => {
		if (!analytics || analytics.previousMonthClicks === 0) return null;
		const growth =
			((analytics.totalClicks - analytics.previousMonthClicks) /
				analytics.previousMonthClicks) *
			100;
		return growth;
	}, [analytics]);

	if (isLoading || !analytics) {
		return (
			<AnalyticsEmptyState
				title="Analytics Overview"
				message="No analytics data available"
				height={300}
				loading={isLoading}
			/>
		);
	}

	const {
		totalClicks,
		uniqueVisitors,
		totalActiveLinks,
		linksCreatedThisMonth,
		topLinks,
		topReferrers,
		bestDay,
		clicksByDate,
	} = analytics;

	return (
		<Stack gap="lg">
			<Grid gutter="md" w="100%">
				<Grid.Col span={{ base: 12, sm: 6 }}>
					<Title order={1}>Analytics Overview</Title>
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

			{/* Summary Cards */}
			<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
				{/* Total Clicks */}
				<StatsCard
					title="Total Clicks"
					value={totalClicks.toLocaleString()}
					icon={IconPointer}
					iconColor="blue"
					loading={isLoading || isFetching}
					growth={clicksGrowth!}
				/>

				{/* Unique Visitors */}
				<StatsCard
					title="Unique Visitors"
					value={uniqueVisitors.toLocaleString()}
					icon={IconUsers}
					iconColor="violet"
					loading={isLoading || isFetching}
				/>

				{/* Active Links */}
				<StatsCard
					title="Active Links"
					value={totalActiveLinks.toLocaleString()}
					icon={IconLink}
					iconColor="cyan"
					loading={isLoading || isFetching}
				/>

				{/* Links Created This Month */}
				<StatsCard
					title="Links Created"
					value={linksCreatedThisMonth.toLocaleString()}
					icon={IconCalendar}
					iconColor="teal"
					loading={isLoading || isFetching}
				/>
			</SimpleGrid>

			{/* Best Day Highlight */}
			{bestDay && (
				<Paper withBorder p="lg" radius="md">
					<Group>
						<IconChartLine size={32} color="var(--mantine-color-blue-6)" />
						<div>
							<Text size="sm" c="dimmed" fw={500}>
								Best Performing Day
							</Text>
							<Group gap="xs">
								<Text size="lg" fw={700}>
									{new Date(bestDay.date).toLocaleDateString("en-US", {
										month: "long",
										day: "numeric",
										year: "numeric",
									})}
								</Text>
								<Badge color="blue" variant="light">
									{bestDay.clicks.toLocaleString()} clicks
								</Badge>
							</Group>
						</div>
					</Group>
				</Paper>
			)}

			{/* Clicks Timeline */}
			<ClicksTimelineChart
				data={clicksByDate}
				loading={isLoading || isFetching}
				title="Clicks Over Time (This Month)"
				height={350}
			/>

			{/* Top Links & Referrers */}
			<Grid gutter="md">
				{/* Top Links Table */}
				<Grid.Col span={{ base: 12, md: 6 }}>
					<TopLinksTable
						data={topLinks}
						loading={isLoading || isFetching}
						limit={5}
						title="Top 5 Performing Links"
					/>
				</Grid.Col>

				{/* Top Referrers - PRO Feature */}
				<Grid.Col span={{ base: 12, md: 6 }}>
					<ProFeatureGuard
						isPro={isPro}
						featureName="Top Referrers"
						upgradeMessage="Discover where your traffic is coming from with detailed referrer tracking across all your links."
					>
						<ReferrerBarChart
							data={topReferrers.map((r) => ({
								referrer: r.referrer,
								count: r.clicks,
							}))}
							title="Top 5 Referrers"
							loading={isLoading || isFetching}
							limit={5}
						/>
					</ProFeatureGuard>
				</Grid.Col>
			</Grid>
		</Stack>
	);
}
