/**
 * Stats card configuration and utilities
 */
import {
	IconBan,
	IconChartBar,
	IconClick,
	IconLink,
	IconShieldQuestion,
	type TablerIcon,
} from "@tabler/icons-react";
import type { StatsCardProps } from "@/components/ui";

// ============================================================================
// Types
// ============================================================================

export interface StatsCardConfig {
	key: string;
	title: string;
	value: number | string;
	icon: TablerIcon;
	iconColor: StatsCardProps["iconColor"];
	description?: string;
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface DashboardStatsData {
	totalLinks: number;
	activeLinks: number;
	totalClicks: number;
	pageCount: number;
}

export const getDashboardStatsCards = (
	data: DashboardStatsData,
): StatsCardConfig[] => [
	{
		key: "total",
		title: "Total Links",
		value: data.totalLinks,
		icon: IconLink,
		iconColor: "blue",
		description: "across all pages",
	},
	{
		key: "active",
		title: "Active Links",
		value: data.activeLinks,
		icon: IconChartBar,
		iconColor: "green",
		description: "on this page",
	},
	{
		key: "clicks",
		title: "Total Clicks",
		value: data.totalClicks.toLocaleString(),
		icon: IconClick,
		iconColor: "violet",
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

// ============================================================================
// Admin Links Stats
// ============================================================================

export interface AdminLinkStatsData {
	totalLinks: number;
	blockedLinks: number;
	pendingScans: number;
	pageCount: number;
}

export const getAdminLinkStatsCards = (
	data: AdminLinkStatsData,
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
