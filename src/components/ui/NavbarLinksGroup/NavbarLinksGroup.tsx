import { Box, Collapse, Group, ThemeIcon, UnstyledButton } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import classes from "./NavbarLinksGroup.module.css";

interface LinksGroupProps {
	icon: React.FC<any>;
	label: string;
	link?: string;
	initiallyOpened?: boolean;
	links?: { label: string; link: string }[];
}

export function LinksGroup({
	icon: Icon,
	label,
	link,
	initiallyOpened,
	links,
}: LinksGroupProps) {
	const location = useLocation();
	const hasLinks = Array.isArray(links) && links.length > 0;
	const [opened, setOpened] = useState(initiallyOpened || false);

	const items = (hasLinks ? links : []).map((item) => (
		<Link
			className={classes.link}
			data-active={location.pathname === item.link || undefined}
			to={item.link}
			key={item.label}
		>
			{item.label}
		</Link>
	));

	// Single link item (no nested links)
	if (link && !hasLinks) {
		return (
			<UnstyledButton
				component={Link}
				to={link}
				className={classes.control}
				data-active={location.pathname === link || undefined}
			>
				<Group justify="space-between" gap={0}>
					<Box style={{ display: "flex", alignItems: "center" }}>
						<ThemeIcon variant="light" size={30}>
							<Icon size={18} />
						</ThemeIcon>
						<Box ml="md">{label}</Box>
					</Box>
				</Group>
			</UnstyledButton>
		);
	}

	// Collapsible group with nested links
	return (
		<>
			<UnstyledButton
				onClick={() => setOpened((o) => !o)}
				className={classes.control}
			>
				<Group justify="space-between" gap={0}>
					<Box style={{ display: "flex", alignItems: "center" }}>
						<ThemeIcon variant="light" size={30}>
							<Icon size={18} />
						</ThemeIcon>
						<Box ml="md">{label}</Box>
					</Box>
					{hasLinks && (
						<IconChevronRight
							className={classes.chevron}
							stroke={1.5}
							size={16}
							style={{ transform: opened ? "rotate(-90deg)" : "none" }}
						/>
					)}
				</Group>
			</UnstyledButton>
			{hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
		</>
	);
}
