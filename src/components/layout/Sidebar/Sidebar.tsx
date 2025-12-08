import {
	IconGauge,
	IconPresentationAnalytics,
	IconTags,
	IconLayoutDashboard,
} from "@tabler/icons-react";
import { Code, Group, ScrollArea } from "@mantine/core";
import { UserButton, LinksGroup, Logo } from "@/components/ui";
import { useAppSelector } from "@/app/hooks";
import classes from "./Sidebar.module.css";
import packageJson from "../../../../package.json";

const userNavigation = [
	{ label: "Dashboard", icon: IconGauge },
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
	{ label: "Tags", icon: IconTags },
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
	const { user } = useAppSelector((state) => state.auth);

	const isAdmin =
		user?.roles.some((role) => role === "admin" || role === "superadmin") ??
		false;

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
