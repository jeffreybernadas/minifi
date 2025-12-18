import { Code, Group, ScrollArea } from "@mantine/core";
import {
	IconGauge,
	IconLayoutDashboard,
	IconPresentationAnalytics,
	IconTags,
} from "@tabler/icons-react";
import { LinksGroup, Logo, UserButton } from "@/components/ui";
import { useAuth } from "@/hooks";
import packageJson from "../../../../package.json";
import classes from "./Sidebar.module.css";

const userNavigation = [
	{ label: "Dashboard", icon: IconGauge, link: "/dashboard" },
	{
		label: "Analytics",
		icon: IconPresentationAnalytics,
		links: [
			{ label: "Overview", link: "/dashboard/analytics" },
			{ label: "Click Analytics", link: "/dashboard/analytics/clicks" },
			{ label: "Geographic Data", link: "/dashboard/analytics/geo" },
			{ label: "Device Analytics", link: "/dashboard/analytics/devices" },
		],
	},
	{ label: "Tags", icon: IconTags, link: "/dashboard/tags" },
];

const adminNavigation = [
	{
		label: "Admin",
		icon: IconLayoutDashboard,
		links: [
			{ label: "Dashboard", link: "/admin" },
			{ label: "Users", link: "/admin/users" },
			{ label: "Links", link: "/admin/links" },
		],
	},
];

export function Sidebar() {
	const { isAdmin } = useAuth();

	// Combine user navigation with admin navigation if user is admin
	const navigationData = isAdmin
		? [...userNavigation, ...adminNavigation]
		: userNavigation;

	const links = navigationData.map((item) => (
		<LinksGroup {...item} key={item.label} />
	));

	return (
		<nav className={classes.navbar}>
			<div className={classes.header}>
				<Group justify="space-between" w="100%">
					<Logo />
					<Code fw={700}>v{packageJson.version}</Code>
				</Group>
			</div>

			<ScrollArea className={classes.links}>
				<div className={classes.linksInner}>{links}</div>
			</ScrollArea>

			<div className={classes.footer}>
				<UserButton />
			</div>
		</nav>
	);
}
