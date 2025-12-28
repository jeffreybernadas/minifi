import {
	Group,
	Paper,
	Progress,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconClick,
	IconCrown,
	IconLink,
	IconLinkOff,
	IconShieldCheck,
	IconShieldX,
	IconUsers,
	IconUserX,
} from "@tabler/icons-react";
import {
	useGetAdminAnalyticsQuery,
	useGetAdminStatsQuery,
	useGetSecurityOverviewQuery,
} from "@/app/api/admin.api";
import {
	MultiSeriesLineChart,
	TopCountriesTable,
} from "@/components/analytics";
import { AnalyticsPieChart, DataTable, StatsCard } from "@/components/ui";
import { getScanStatusColor } from "@/constants/status.constant";
import type { DailyStat, SecurityStat } from "@/types";
import { alertColumns } from "./columns";

/**
 * Merge daily trend data into a single dataset for MultiSeriesLineChart
 */
function mergeTrendData(
	dailyUsers: DailyStat[],
	dailyLinks: DailyStat[],
	dailyClicks: DailyStat[],
): Array<{ date: string; users: number; links: number; clicks: number }> {
	const dateMap = new Map<
		string,
		{ users: number; links: number; clicks: number }
	>();

	// Collect all unique dates
	[...dailyUsers, ...dailyLinks, ...dailyClicks].forEach(({ date }) => {
		if (!dateMap.has(date)) {
			dateMap.set(date, { users: 0, links: 0, clicks: 0 });
		}
	});

	// Populate data
	dailyUsers.forEach(({ date, count }) => {
		const entry = dateMap.get(date);
		if (entry) entry.users = count;
	});

	dailyLinks.forEach(({ date, count }) => {
		const entry = dateMap.get(date);
		if (entry) entry.links = count;
	});

	dailyClicks.forEach(({ date, count }) => {
		const entry = dateMap.get(date);
		if (entry) entry.clicks = count;
	});

	return Array.from(dateMap.entries())
		.map(([date, data]) => ({ date, ...data }))
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export default function AdminDashboardPage() {
	// Queries - keep loading states separate for progressive loading
	const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();
	const { data: security, isLoading: securityLoading } =
		useGetSecurityOverviewQuery();
	const { data: analytics, isLoading: analyticsLoading } =
		useGetAdminAnalyticsQuery();

	// Calculate security progress bars
	const totalSecurityLinks =
		security?.byStatus.reduce((sum, s) => sum + s.count, 0) ?? 0;

	return (
		<Stack gap="lg">
			{/* Header */}
			<Title order={1}>Admin Dashboard</Title>

			{/* Row 1: Primary Stats with Growth */}
			<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
				<StatsCard
					title="Total Users"
					value={stats?.totalUsers.toLocaleString() ?? 0}
					icon={IconUsers}
					iconColor="blue"
					growth={stats?.userGrowth.percentage}
					loading={statsLoading}
				/>
				<StatsCard
					title="Total Links"
					value={stats?.totalLinks.toLocaleString() ?? 0}
					icon={IconLink}
					iconColor="violet"
					growth={stats?.linkGrowth.percentage}
					loading={statsLoading}
				/>
				<StatsCard
					title="Total Clicks"
					value={stats?.totalClicks.toLocaleString() ?? 0}
					icon={IconClick}
					iconColor="green"
					growth={stats?.clickGrowth.percentage}
					loading={statsLoading}
				/>
				<StatsCard
					title="PRO Users"
					value={stats?.totalProUsers.toLocaleString() ?? 0}
					icon={IconCrown}
					iconColor="yellow"
					description={
						stats && stats.totalUsers > 0
							? `${((stats.totalProUsers / stats.totalUsers) * 100).toFixed(1)}% of users`
							: undefined
					}
					loading={statsLoading}
				/>
			</SimpleGrid>

			{/* Row 2: Operational Metrics */}
			<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
				<StatsCard
					title="Active Links"
					value={stats?.activeLinks.toLocaleString() ?? 0}
					icon={IconLink}
					iconColor="green"
					loading={statsLoading}
				/>
				<StatsCard
					title="Blocked Users"
					value={stats?.blockedUsers.toLocaleString() ?? 0}
					icon={IconUserX}
					iconColor="red"
					loading={statsLoading}
				/>
				<StatsCard
					title="Blocked Links"
					value={stats?.blockedLinks.toLocaleString() ?? 0}
					icon={IconLinkOff}
					iconColor="red"
					loading={statsLoading}
				/>
				<StatsCard
					title="Pending Scans"
					value={security?.pendingScanCount.toLocaleString() ?? 0}
					icon={IconAlertTriangle}
					iconColor="yellow"
					loading={securityLoading}
				/>
			</SimpleGrid>

			{/* Platform Trends */}
			<MultiSeriesLineChart
				data={
					analytics
						? mergeTrendData(
								analytics.dailyUsers,
								analytics.dailyLinks,
								analytics.dailyClicks,
							)
						: []
				}
				series={[
					{ name: "users", label: "New Users", color: "blue.6" },
					{ name: "links", label: "Links Created", color: "violet.6" },
					{ name: "clicks", label: "Total Clicks", color: "green.6" },
				]}
				title="Platform Growth"
				subtitle="Daily data for the last 30 days"
				height={350}
				loading={analyticsLoading}
			/>

			{/* Analytics Snapshot */}
			<Paper withBorder p="lg" radius="md">
				<div>
					<Title order={3}>Analytics Snapshot</Title>
					<Text size="sm" c="dimmed" mt={4}>
						Top items from the last 30 days
					</Text>
				</div>
				<SimpleGrid cols={{ base: 1, md: 3 }} mt="md">
					{/* Top Countries */}
					<TopCountriesTable
						data={
							analytics?.topCountries.slice(0, 5).map((item) => ({
								country: item.name,
								count: item.count,
							})) ?? []
						}
						title="Top Countries"
						limit={5}
						loading={analyticsLoading}
					/>

					{/* Device Breakdown */}
					<AnalyticsPieChart
						data={
							analytics?.topDevices.slice(0, 3).map((item) => ({
								device: item.name,
								count: item.count,
							})) ?? []
						}
						title="Devices"
						height={300}
						loading={analyticsLoading}
					/>

					{/* Browser Breakdown */}
					<AnalyticsPieChart
						data={
							analytics?.topBrowsers.slice(0, 3).map((item) => ({
								browser: item.name,
								count: item.count,
							})) ?? []
						}
						title="Browsers"
						height={300}
						loading={analyticsLoading}
					/>
				</SimpleGrid>
			</Paper>

			{/* Security Overview */}
			<Paper withBorder p="lg" radius="md">
				<Group justify="space-between" mb="md">
					<Group gap="xs">
						<IconShieldCheck size={24} />
						<Title order={3}>Security Overview</Title>
					</Group>
					<Group gap="lg">
						<Group gap="xs">
							<IconShieldX size={18} color="var(--mantine-color-red-6)" />
							<Text size="sm" fw={500} c="red">
								{security?.maliciousCount ?? 0} Malicious
							</Text>
						</Group>
						<Group gap="xs">
							<IconAlertTriangle
								size={18}
								color="var(--mantine-color-yellow-6)"
							/>
							<Text size="sm" fw={500} c="yellow">
								{security?.suspiciousCount ?? 0} Suspicious
							</Text>
						</Group>
					</Group>
				</Group>

				{/* Scan Status Progress Bars */}
				<Stack gap="sm" mb="lg">
					{security?.byStatus.map((stat: SecurityStat) => (
						<Group key={stat.status} gap="md" wrap="nowrap">
							<Text size="sm" w={120} fw={500} style={{ flexShrink: 0 }}>
								{stat.status}
							</Text>
							<Progress
								value={
									totalSecurityLinks > 0
										? (stat.count / totalSecurityLinks) * 100
										: 0
								}
								color={getScanStatusColor(stat.status)}
								style={{ flex: 1 }}
								size="lg"
							/>
							<Text
								size="sm"
								w={60}
								ta="right"
								c="dimmed"
								style={{ flexShrink: 0 }}
							>
								{stat.count}
							</Text>
						</Group>
					))}
				</Stack>
			</Paper>

			{/* Recent Security Alerts */}
			<Stack gap="sm">
				<Title order={3}>Recent Security Alerts</Title>
				<DataTable
					data={security?.recentAlerts?.slice(0, 10) ?? []}
					columns={alertColumns}
					rowKey={(alert) => alert.linkId}
					loading={securityLoading}
					page={1}
					pageCount={1}
					onPageChange={() => {}}
					emptyState={{
						icon: IconShieldCheck,
						title: "No security alerts",
						description: "All links are currently safe",
					}}
					minWidth={600}
				/>
			</Stack>
		</Stack>
	);
}
