import {
	IconChartBar,
	IconClick,
	IconLink,
	type TablerIcon,
} from "@tabler/icons-react";
import type { StatsCardProps } from "@/components/ui";

export const STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "ACTIVE", label: "Active" },
	{ value: "SCHEDULED", label: "Scheduled" },
	{ value: "DISABLED", label: "Disabled" },
	{ value: "BLOCKED", label: "Blocked" },
];

export interface StatsData {
	totalLinks: number;
	activeLinks: number;
	totalClicks: number;
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

export const getStatsCards = (data: StatsData): StatsCardConfig[] => [
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
