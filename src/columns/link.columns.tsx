import {
	ActionIcon,
	Anchor,
	Group,
	Menu,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import {
	IconArchive,
	IconArchiveOff,
	IconChartBar,
	IconDotsVertical,
	IconExternalLink,
	IconLock,
	IconPencil,
	IconQrcode,
	IconRefresh,
	IconTrash,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import {
	type Column,
	CopyButton,
	LinkStatusBadge,
	ScanStatusBadge,
} from "@/components/ui";
import type { Link as LinkType } from "@/types";

const formatDate = (date: string) => {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export interface LinkColumnsOptions {
	onNavigate: (path: string) => void;
	onArchive: (link: LinkType) => void;
	onDelete: (link: LinkType) => void;
}

export const getLinkColumns = ({
	onNavigate,
	onArchive,
	onDelete,
}: LinkColumnsOptions): Column<LinkType>[] => [
	{
		key: "link",
		header: "Link",
		width: 500,
		render: (link) => (
			<Stack gap={4}>
				<Group gap="xs">
					<Anchor
						component={Link}
						to={`/dashboard/links/${link.id}`}
						fw={500}
						size="sm"
					>
						{link.title || link.shortCode}
					</Anchor>
					{link.hasPassword && (
						<Tooltip label="Password protected">
							<IconLock size={14} color="gray" />
						</Tooltip>
					)}
				</Group>
				<Group gap="xs">
					<Text size="xs" c="blue" ff="monospace">
						{link.shortUrl}
					</Text>
					<CopyButton value={link.shortUrl ?? ""} size="xs" variant="subtle">
						Copy
					</CopyButton>
					<ActionIcon
						component="a"
						href={link.shortUrl}
						target="_blank"
						size="xs"
						variant="subtle"
						color="gray"
					>
						<IconExternalLink size={12} />
					</ActionIcon>
				</Group>
				<Text size="xs" c="dimmed" lineClamp={1}>
					{link.originalUrl}
				</Text>
			</Stack>
		),
	},
	{
		key: "status",
		header: "Status",
		render: (link) => <LinkStatusBadge status={link.status} />,
	},
	{
		key: "clicks",
		header: "Clicks",
		render: (link) => (
			<Group gap={4}>
				<Text size="sm" fw={500}>
					{link.clickCount.toLocaleString()}
				</Text>
				<Text size="xs" c="dimmed">
					({link.uniqueClickCount} unique)
				</Text>
			</Group>
		),
	},
	{
		key: "security",
		header: "Security",
		render: (link) => <ScanStatusBadge status={link.scanStatus} />,
	},
	{
		key: "created",
		header: "Created",
		render: (link) => <Text size="sm">{formatDate(link.createdAt)}</Text>,
	},
	{
		key: "actions",
		header: "Actions",
		width: 100,
		render: (link) => (
			<Group gap={4}>
				<Tooltip label="View Analytics">
					<ActionIcon
						variant="subtle"
						color="blue"
						onClick={() => onNavigate(`/dashboard/analytics/${link.id}`)}
					>
						<IconChartBar size={16} />
					</ActionIcon>
				</Tooltip>

				<Menu position="bottom-end" withArrow>
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray">
							<IconDotsVertical size={16} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconPencil size={14} />}
							onClick={() => onNavigate(`/dashboard/links/${link.id}`)}
						>
							Edit
						</Menu.Item>
						<Menu.Item
							leftSection={<IconQrcode size={14} />}
							onClick={() => onNavigate(`/dashboard/links/${link.id}`)}
						>
							QR Code
						</Menu.Item>
						<Menu.Item leftSection={<IconRefresh size={14} />}>
							Rescan
						</Menu.Item>
						<Menu.Divider />
						<Menu.Item
							leftSection={
								link.isArchived ? (
									<IconArchiveOff size={14} />
								) : (
									<IconArchive size={14} />
								)
							}
							onClick={() => onArchive(link)}
						>
							{link.isArchived ? "Unarchive" : "Archive"}
						</Menu.Item>
						<Menu.Item
							leftSection={<IconTrash size={14} />}
							color="red"
							onClick={() => onDelete(link)}
						>
							Delete
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		),
	},
];
