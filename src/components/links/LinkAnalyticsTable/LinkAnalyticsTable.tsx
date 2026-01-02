import { Text } from "@mantine/core";
import type { TablerIcon } from "@tabler/icons-react";
import { IconActivity } from "@tabler/icons-react";
import { type Column, DataTable } from "@/components/ui";
import type { LinkAnalytics } from "@/types";

const formatDateTime = (value: string) => new Date(value).toLocaleString();

const buildColumns = (): Column<LinkAnalytics>[] => [
	{
		key: "time",
		header: "Time",
		render: (row) => <Text size="sm">{formatDateTime(row.clickedAt)}</Text>,
	},
	{
		key: "location",
		header: "Location",
		render: (row) => (
			<Text size="sm">
				{row.city || row.country
					? `${row.city ?? ""}${row.city && row.country ? ", " : ""}${
							row.country ?? "Unknown"
						}`
					: "Unknown"}
			</Text>
		),
	},
	{
		key: "device",
		header: "Device",
		render: (row) => (
			<Text size="sm">
				{row.device || row.os || row.browser
					? [row.device, row.os, row.browser].filter(Boolean).join(" • ")
					: "Unknown"}
			</Text>
		),
	},
	{
		key: "referrer",
		header: "Referrer",
		render: (row) => <Text size="sm">{row.referrer || "Direct"}</Text>,
	},
	{
		key: "utm",
		header: "UTM",
		render: (row) => (
			<Text size="sm" c="dimmed">
				{row.utmSource || row.utmMedium || row.utmCampaign
					? [
							row.utmSource && `source=${row.utmSource}`,
							row.utmMedium && `medium=${row.utmMedium}`,
							row.utmCampaign && `campaign=${row.utmCampaign}`,
							row.utmTerm && `term=${row.utmTerm}`,
							row.utmContent && `content=${row.utmContent}`,
						]
							.filter(Boolean)
							.join(", ")
					: "—"}
			</Text>
		),
	},
];

export interface LinkAnalyticsTableProps {
	records: LinkAnalytics[];
	page: number;
	pageCount: number;
	onPageChange: (page: number) => void;
	loading?: boolean;
	emptyIcon?: TablerIcon;
}

export function LinkAnalyticsTable({
	records,
	page,
	pageCount,
	onPageChange,
	loading,
	emptyIcon = IconActivity,
}: Readonly<LinkAnalyticsTableProps>) {
	return (
		<DataTable
			data={records}
			columns={buildColumns()}
			rowKey={(item) => item.id}
			page={page}
			pageCount={pageCount}
			onPageChange={onPageChange}
			loading={loading}
			emptyState={{
				icon: emptyIcon,
				title: "No analytics yet",
				description: "Clicks will appear here once this link is visited",
			}}
		/>
	);
}
