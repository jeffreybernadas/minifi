import { Anchor, Badge, Text, Tooltip } from "@mantine/core";
import { Link } from "react-router-dom";
import type { Column } from "@/components/ui";
import type { RecentAlert } from "@/types";
import { formatScanScore } from "@/utils/scan-score.util";
import { formatTime } from "@/utils/time.util";

/**
 * Get badge color for scan status
 */
export const getScanStatusColor = (status: string): string => {
	switch (status) {
		case "SAFE":
			return "green";
		case "PENDING":
			return "blue";
		case "SUSPICIOUS":
			return "yellow";
		case "MALICIOUS":
			return "red";
		case "ADULT_CONTENT":
			return "orange";
		default:
			return "gray";
	}
};

/**
 * Format URL for display (truncate)
 */
const truncateUrl = (url: string, maxLength = 50): string => {
	return url.length > maxLength ? `${url.slice(0, maxLength)}...` : url;
};

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
