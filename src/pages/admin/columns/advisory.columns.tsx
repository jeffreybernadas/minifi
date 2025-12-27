import { ActionIcon, Badge, Group, Menu, Stack, Text } from "@mantine/core";
import {
	IconArchive,
	IconDotsVertical,
	IconEdit,
	IconEye,
	IconRocket,
	IconTrash,
} from "@tabler/icons-react";
import type { Column } from "@/components/ui";
import type { Advisory, AdvisoryListItem } from "@/types";
import { formatDate } from "@/utils/date.util";
import { STATUS_COLORS, TYPE_COLORS } from "../constants/advisory.constants";

export interface AdvisoryColumnsOptions {
	onPreview: (advisory: Advisory) => void;
	onEdit: (advisory: Advisory) => void;
	onPublish: (advisory: Advisory) => void;
	onArchive: (advisory: Advisory) => void;
	onDelete: (advisory: Advisory) => void;
}

/**
 * Get column definitions for admin advisories table
 */
export const getAdvisoryColumns = ({
	onPreview,
	onEdit,
	onPublish,
	onArchive,
	onDelete,
}: AdvisoryColumnsOptions): Column<AdvisoryListItem>[] => [
	{
		key: "title",
		header: "Title",
		width: 300,
		render: (advisory) => (
			<Stack gap={2}>
				<Text size="sm" fw={500} lineClamp={1}>
					{advisory.title}
				</Text>
				<Text size="xs" c="dimmed">
					{advisory.dismissalCount} dismissals
				</Text>
			</Stack>
		),
	},
	{
		key: "type",
		header: "Type",
		width: 120,
		render: (advisory) => (
			<Badge color={TYPE_COLORS[advisory.type]} variant="light">
				{advisory.type}
			</Badge>
		),
	},
	{
		key: "status",
		header: "Status",
		width: 120,
		render: (advisory) => (
			<Badge color={STATUS_COLORS[advisory.status]} variant="light">
				{advisory.status}
			</Badge>
		),
	},
	{
		key: "dates",
		header: "Dates",
		render: (advisory) => (
			<Stack gap={2}>
				{advisory.publishedAt && (
					<Text size="xs">Published: {formatDate(advisory.publishedAt)}</Text>
				)}
				{advisory.expiresAt && (
					<Text size="xs" c="dimmed">
						Expires: {formatDate(advisory.expiresAt)}
					</Text>
				)}
				{!advisory.publishedAt && !advisory.expiresAt && (
					<Text size="xs" c="dimmed">
						Created: {formatDate(advisory.createdAt)}
					</Text>
				)}
			</Stack>
		),
	},
	{
		key: "actions",
		header: "Actions",
		width: 100,
		render: (advisory) => (
			<Group gap={4}>
				<ActionIcon
					variant="subtle"
					color="gray"
					onClick={() => onPreview(advisory)}
				>
					<IconEye size={16} />
				</ActionIcon>
				<Menu position="bottom-end" withArrow>
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray">
							<IconDotsVertical size={16} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconEdit size={14} />}
							onClick={() => onEdit(advisory)}
						>
							Edit
						</Menu.Item>
						{advisory.status === "DRAFT" && (
							<Menu.Item
								leftSection={<IconRocket size={14} />}
								color="green"
								onClick={() => onPublish(advisory)}
							>
								Publish
							</Menu.Item>
						)}
						{advisory.status === "PUBLISHED" && (
							<Menu.Item
								leftSection={<IconArchive size={14} />}
								onClick={() => onArchive(advisory)}
							>
								Archive
							</Menu.Item>
						)}
						<Menu.Divider />
						<Menu.Item
							leftSection={<IconTrash size={14} />}
							color="red"
							onClick={() => onDelete(advisory)}
						>
							Delete
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		),
	},
];
