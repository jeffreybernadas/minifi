import { ActionIcon, Group, Menu, Text } from "@mantine/core";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { type Column, TagBadge } from "@/components/ui";
import type { Tag } from "@/types";

const formatDate = (date: string) => {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export interface TagColumnsOptions {
	onEdit: (tag: Tag) => void;
	onDelete: (tag: Tag) => void;
}

export const getTagColumns = ({
	onEdit,
	onDelete,
}: TagColumnsOptions): Column<Tag>[] => [
	{
		key: "name",
		header: "Tag",
		render: (tag) => <TagBadge tag={tag} />,
	},
	{
		key: "created",
		header: "Created",
		render: (tag) => <Text size="sm">{formatDate(tag.createdAt)}</Text>,
	},
	{
		key: "actions",
		header: "Actions",
		width: 100,
		render: (tag) => (
			<Group gap={4} justify="flex-end">
				<Menu position="bottom-end" withArrow>
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray">
							<IconDotsVertical size={16} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconPencil size={14} />}
							onClick={() => onEdit(tag)}
						>
							Edit
						</Menu.Item>
						<Menu.Divider />
						<Menu.Item
							leftSection={<IconTrash size={14} />}
							color="red"
							onClick={() => onDelete(tag)}
						>
							Delete
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		),
	},
];
