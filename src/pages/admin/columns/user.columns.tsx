import {
	ActionIcon,
	Avatar,
	Badge,
	Group,
	Menu,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import {
	IconBan,
	IconCrown,
	IconDotsVertical,
	IconEye,
	IconLockOpen,
	IconMail,
	IconMailOff,
	IconTrash,
} from "@tabler/icons-react";
import type { Column } from "@/components/ui";
import type { AdminUser } from "@/types";
import { formatDate } from "@/utils/date.util";
import { getDisplayName, getUserInitials } from "@/utils/user.util";

export interface UserColumnsOptions {
	onViewDetails: (user: AdminUser) => void;
	onChangeTier: (user: AdminUser) => void;
	onBlock: (user: AdminUser) => void;
	onUnblock: (user: AdminUser) => void;
	onDelete: (user: AdminUser) => void;
}

/**
 * Get column definitions for admin users table
 */
export const getUserColumns = ({
	onViewDetails,
	onChangeTier,
	onBlock,
	onUnblock,
	onDelete,
}: UserColumnsOptions): Column<AdminUser>[] => [
	{
		key: "user",
		header: "User",
		width: 300,
		render: (user) => (
			<Group gap="sm">
				<Avatar size="sm" radius="xl" color="blue">
					{getUserInitials(user)}
				</Avatar>
				<Stack gap={2}>
					<Group gap="xs">
						<Text size="sm" fw={500}>
							{getDisplayName(user)}
						</Text>
						{user.userType === "ADMIN" && (
							<Badge size="xs" color="violet">
								Admin
							</Badge>
						)}
					</Group>
					<Text size="xs" c="dimmed">
						{user.email}
					</Text>
				</Stack>
			</Group>
		),
	},
	{
		key: "emailVerified",
		header: "Email",
		width: 120,
		render: (user) => (
			<Tooltip
				label={user.emailVerified ? "Email verified" : "Email not verified"}
			>
				<Badge
					size="sm"
					color={user.emailVerified ? "green" : "gray"}
					variant="light"
					leftSection={
						user.emailVerified ? (
							<IconMail size={12} />
						) : (
							<IconMailOff size={12} />
						)
					}
				>
					{user.emailVerified ? "Verified" : "Unverified"}
				</Badge>
			</Tooltip>
		),
	},
	{
		key: "status",
		header: "Status",
		width: 120,
		render: (user) => (
			<Group gap="xs">
				{user.isBlocked ? (
					<Tooltip label={user.blockedReason || "Blocked"}>
						<Badge color="red" variant="light">
							Blocked
						</Badge>
					</Tooltip>
				) : (
					<Badge color="green" variant="light">
						Active
					</Badge>
				)}
			</Group>
		),
	},
	{
		key: "stats",
		header: "Stats",
		render: (user) => (
			<Stack gap={2}>
				<Text size="sm">
					{user.linksCount} links ({user.activeLinksCount} active)
				</Text>
				<Text size="xs" c="dimmed">
					{user.totalClicks.toLocaleString()} total clicks
				</Text>
			</Stack>
		),
	},
	{
		key: "joined",
		header: "Joined",
		width: 120,
		render: (user) => <Text size="sm">{formatDate(user.createdAt)}</Text>,
	},
	{
		key: "actions",
		header: "Actions",
		width: 100,
		render: (user) => (
			<Group gap={4}>
				<Tooltip label="View Details">
					<ActionIcon
						variant="subtle"
						color="gray"
						onClick={() => onViewDetails(user)}
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
							leftSection={<IconEye size={14} />}
							onClick={() => onViewDetails(user)}
						>
							View Details
						</Menu.Item>
						<Menu.Item
							leftSection={<IconCrown size={14} />}
							onClick={() => onChangeTier(user)}
						>
							Change Tier
						</Menu.Item>
						{user.isBlocked ? (
							<Menu.Item
								leftSection={<IconLockOpen size={14} />}
								onClick={() => onUnblock(user)}
							>
								Unblock
							</Menu.Item>
						) : (
							<Menu.Item
								leftSection={<IconBan size={14} />}
								color="orange"
								onClick={() => onBlock(user)}
							>
								Block
							</Menu.Item>
						)}
						<Menu.Divider />
						<Menu.Item
							leftSection={<IconTrash size={14} />}
							color="red"
							onClick={() => onDelete(user)}
						>
							Delete
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		),
	},
];
