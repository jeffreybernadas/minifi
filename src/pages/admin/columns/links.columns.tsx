import {
	ActionIcon,
	Anchor,
	Badge,
	Group,
	Menu,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import {
	IconBan,
	IconDotsVertical,
	IconExternalLink,
	IconEye,
	IconLockOpen,
	IconPencil,
	IconRefresh,
	IconTrash,
	IconUser,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import type { Column } from "@/components/ui";
import { CopyButton, LinkStatusBadge, ScanStatusBadge } from "@/components/ui";
import type { AdminLink } from "@/types";
import { formatDate } from "@/utils/date.util";
import { buildShortUrl } from "@/utils/link.util";

export interface AdminLinkColumnsOptions {
	onViewDetails: (link: AdminLink) => void;
	onEdit: (link: AdminLink) => void;
	onRescan: (link: AdminLink) => void;
	onBlock: (link: AdminLink) => void;
	onUnblock: (link: AdminLink) => void;
	onDelete: (link: AdminLink) => void;
}

/**
 * Get column definitions for admin links table
 */
export const getAdminLinkColumns = ({
	onViewDetails,
	onEdit,
	onRescan,
	onBlock,
	onUnblock,
	onDelete,
}: AdminLinkColumnsOptions): Column<AdminLink>[] => [
	{
		key: "link",
		header: "Link",
		width: 400,
		render: (link) => {
			const shortUrl = buildShortUrl(link);
			return (
				<Stack gap={4}>
					<Group gap="xs">
						<Anchor
							component={Link}
							to={`/admin/links/${link.id}`}
							fw={500}
							size="sm"
						>
							{link.title || link.customAlias || link.shortCode}
						</Anchor>
						{link.isGuest && (
							<Badge size="xs" color="gray">
								Guest
							</Badge>
						)}
					</Group>
					<Group gap="xs" align="center">
						<Text size="xs" c="blue" ff="monospace">
							{shortUrl}
						</Text>
						<CopyButton value={shortUrl} size="xs" variant="subtle">
							Copy
						</CopyButton>
						<ActionIcon
							component="a"
							href={shortUrl}
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
			);
		},
	},
	{
		key: "owner",
		header: "Owner",
		// width: 150,
		render: (link) => (
			<Group gap="xs">
				<IconUser size={14} color="gray" />
				<Text size="sm" lineClamp={1}>
					{link.isGuest ? "Guest" : (link.userEmail ?? "Unknown")}
				</Text>
			</Group>
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
		width: 120,
		render: (link) => <Text size="sm">{formatDate(link.createdAt)}</Text>,
	},
	{
		key: "actions",
		header: "Actions",
		width: 100,
		render: (link) => (
			<Group gap={4}>
				<Tooltip label="View Details">
					<ActionIcon
						variant="subtle"
						color="gray"
						onClick={() => onViewDetails(link)}
					>
						<IconEye size={16} />
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
							onClick={() => onEdit(link)}
						>
							Edit
						</Menu.Item>
						<Menu.Item
							leftSection={<IconRefresh size={14} />}
							onClick={() => onRescan(link)}
						>
							Rescan
						</Menu.Item>
						{link.status === "BLOCKED" ? (
							<Menu.Item
								leftSection={<IconLockOpen size={14} />}
								onClick={() => onUnblock(link)}
							>
								Unblock
							</Menu.Item>
						) : (
							<Menu.Item
								leftSection={<IconBan size={14} />}
								color="orange"
								onClick={() => onBlock(link)}
							>
								Block
							</Menu.Item>
						)}
						<Menu.Divider />
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
