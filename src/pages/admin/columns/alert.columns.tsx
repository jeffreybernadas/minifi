import { Anchor, Badge, Text, Tooltip } from "@mantine/core";
import { Link } from "react-router-dom";
import type { Column } from "@/components/ui";
import { getScanStatusColor } from "@/constants/status.constant";
import type { RecentAlert } from "@/types";
import { formatScanScore } from "@/utils/scan-score.util";
import { truncateUrl } from "@/utils/string.util";
import { formatTime } from "@/utils/time.util";

/**
 * Column definitions for Recent Security Alerts table
 */
export const alertColumns: Column<RecentAlert>[] = [
	{
		key: "shortCode",
		header: "Short Code",
		width: 120,
		render: (alert) => (
			<Anchor
				component={Link}
				to={`/admin/links/${alert.linkId}`}
				size="sm"
				fw={500}
			>
				{alert.shortCode}
			</Anchor>
		),
	},
	{
		key: "originalUrl",
		header: "Original URL",
		render: (alert) => (
			<Tooltip label={alert.originalUrl}>
				<Text size="sm" c="dimmed">
					{truncateUrl(alert.originalUrl)}
				</Text>
			</Tooltip>
		),
	},
	{
		key: "status",
		header: "Status",
		width: 130,
		render: (alert) => (
			<Badge color={getScanStatusColor(alert.scanStatus)}>
				{alert.scanStatus}
			</Badge>
		),
	},
	{
		key: "score",
		header: "Score",
		width: 80,
		render: (alert) => (
			<Text size="sm">{formatScanScore(alert.scanScore)}</Text>
		),
	},
	{
		key: "scannedAt",
		header: "Scanned At",
		width: 120,
		render: (alert) => (
			<Tooltip
				label={
					alert.scannedAt
						? new Date(alert.scannedAt).toLocaleString()
						: "Not scanned"
				}
			>
				<Text size="sm" c="dimmed">
					{alert.scannedAt ? formatTime(alert.scannedAt) : "—"}
				</Text>
			</Tooltip>
		),
	},
];
