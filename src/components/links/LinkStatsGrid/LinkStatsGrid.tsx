import { SimpleGrid } from "@mantine/core";
import { IconClock, IconPointer, IconUsers } from "@tabler/icons-react";
import { StatsCard } from "@/components/ui";
import type { Link, LinkAnalyticsSummary } from "@/types";

export interface LinkStatsGridProps {
	link: Link;
	summary?: LinkAnalyticsSummary;
}

const formatDateTime = (value?: string | null) =>
	value ? new Date(value).toLocaleString() : "Never";

export function LinkStatsGrid({ link, summary }: Readonly<LinkStatsGridProps>) {
	const totalClicks = summary?.totalClicks ?? link.clickCount;
	const uniqueVisitors = summary?.uniqueVisitors ?? link.uniqueClickCount;
	const lastClicked = formatDateTime(link.lastClickedAt);
	const lastScanned = formatDateTime(link.scannedAt);

	return (
		<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
			<StatsCard
				title="Total Clicks"
				value={totalClicks.toLocaleString()}
				icon={IconPointer}
				iconColor="blue"
			/>
			<StatsCard
				title="Unique Visitors"
				value={uniqueVisitors.toLocaleString()}
				icon={IconUsers}
				iconColor="teal"
			/>
			<StatsCard
				title="Last Click"
				value={lastClicked}
				icon={IconClock}
				iconColor="gray"
			/>
			<StatsCard
				title="Last Scan"
				value={lastScanned}
				icon={IconClock}
				iconColor="violet"
			/>
		</SimpleGrid>
	);
}
