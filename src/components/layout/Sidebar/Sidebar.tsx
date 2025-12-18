import { ActionIcon, Code, Group, ScrollArea } from "@mantine/core";
import {
	IconGauge,
	IconLayoutDashboard,
	IconPresentationAnalytics,
	IconTags,
	IconX,
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

interface SidebarProps {
	onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
	const { isAdmin } = useAuth();

	// Combine user navigation with admin navigation if user is admin
	const navigationData = isAdmin
		? [...userNavigation, ...adminNavigation]
		: userNavigation;

	const links = navigationData.map((item) => (
		<LinksGroup {...item} key={item.label} onNavigate={onCloseMobile} />
	));

	return (
		<nav className={classes.navbar}>
			<div className={classes.header}>
				<Group justify="space-between" w="100%">
					<Logo />
					<Group gap="xs">
						<Code fw={700}>v{packageJson.version}</Code>
						{onCloseMobile && (
							<ActionIcon
								variant="subtle"
								color="gray"
								size="lg"
								onClick={onCloseMobile}
								hiddenFrom="sm"
								aria-label="Close navigation"
							>
								<IconX size={16} />
							</ActionIcon>
						)}
					</Group>
				</Group>
			</div>

			<ScrollArea className={classes.links}>
				<div className={classes.linksInner}>{links}</div>
			</ScrollArea>

			<div className={classes.footer}>
				<UserButton onNavigate={onCloseMobile} />
			</div>
		</nav>
	);
}
