import {
	IconBan,
	IconLink,
	IconShieldQuestion,
	type TablerIcon,
} from "@tabler/icons-react";
import type { StatsCardProps } from "@/components/ui";

// ============================================================================
// Filter Options
// ============================================================================

export const ADMIN_LINK_STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "ACTIVE", label: "Active" },
	{ value: "SCHEDULED", label: "Scheduled" },
	{ value: "DISABLED", label: "Disabled" },
	{ value: "BLOCKED", label: "Blocked" },
];

export const SCAN_STATUS_OPTIONS = [
	{ value: "", label: "All Scan Status" },
	{ value: "PENDING", label: "Pending" },
	{ value: "SAFE", label: "Safe" },
	{ value: "SUSPICIOUS", label: "Suspicious" },
	{ value: "MALICIOUS", label: "Malicious" },
	{ value: "ADULT_CONTENT", label: "Adult Content" },
];

export const GUEST_OPTIONS = [
	{ value: "", label: "All Links" },
	{ value: "true", label: "Guest Only" },
	{ value: "false", label: "Registered Only" },
];

// ============================================================================
// Stats Cards Configuration
// ============================================================================

export interface AdminLinkStats {
	totalLinks: number;
	blockedLinks: number;
	pendingScans: number;
	pageCount: number;
}

export interface StatsCardConfig {
	key: string;
	title: string;
	value: number | string;
	icon: TablerIcon;
	iconColor: StatsCardProps["iconColor"];
	description?: string;
}

export const getAdminLinkStatsCards = (
	data: AdminLinkStats,
): StatsCardConfig[] => [
	{
		key: "total",
		title: "Total Links",
		value: data.totalLinks.toLocaleString(),
		icon: IconLink,
		iconColor: "blue",
		description: "across all pages",
	},
	{
		key: "blocked",
		title: "Blocked",
		value: data.blockedLinks.toLocaleString(),
		icon: IconBan,
		iconColor: "red",
		description: "on this page",
	},
	{
		key: "pending",
		title: "Pending Scan",
		value: data.pendingScans.toLocaleString(),
		icon: IconShieldQuestion,
		iconColor: "orange",
		description: "on this page",
	},
	{
		key: "page",
		title: "Showing",
		value: data.pageCount,
		icon: IconLink,
		iconColor: "gray",
		description: `of ${data.totalLinks} links`,
	},
];
