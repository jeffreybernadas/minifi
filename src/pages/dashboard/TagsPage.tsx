import {
	Button,
	Group,
	Paper,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconSearch, IconTags } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import { useDeleteTagMutation, useGetTagsQuery } from "@/app/api/tags.api";
import { CreateTagModal, EditTagModal } from "@/components/tags";
import { DataTable } from "@/components/ui";
import type { Tag } from "@/types";
import { getErrorMessage } from "@/types";
import { getTagColumns } from "./columns";

export default function TagsPage() {
	// Modals
	const [createOpened, { open: openCreate, close: closeCreate }] =
		useDisclosure(false);
	const [editOpened, { open: openEdit, close: closeEdit }] =
		useDisclosure(false);
	const [editingTag, setEditingTag] = useState<Tag | null>(null);

	// Search
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const limit = 10;

	// API
	const { data: tags = [], isLoading } = useGetTagsQuery();
	const [deleteTag] = useDeleteTagMutation();

	// Filter
	const filteredTags = useMemo(() => {
		if (!search.trim()) return tags;
		const lowerSearch = search.toLowerCase();
		return tags.filter((tag) => tag.name.toLowerCase().includes(lowerSearch));
	}, [tags, search]);

	// Pagination (Client-side since API returns all tags)
	const paginatedTags = useMemo(() => {
		const start = (page - 1) * limit;
		return filteredTags.slice(start, start + limit);
	}, [filteredTags, page]);

	const pageCount = Math.ceil(filteredTags.length / limit);

	// Handlers
	const handleEdit = useCallback(
		(tag: Tag) => {
			setEditingTag(tag);
			openEdit();
		},
		[openEdit],
	);

	const handleCloseEdit = () => {
		setEditingTag(null);
		closeEdit();
	};

	const handleDelete = useCallback(
		(tag: Tag) => {
			modals.openConfirmModal({
				title: "Delete Tag",
				children: (
					<Text size="sm">
						Are you sure you want to delete the tag "{tag.name}"? This will
						remove it from all linked links.
					</Text>
				),
				labels: { confirm: "Delete", cancel: "Cancel" },
				confirmProps: { color: "red" },
				onConfirm: async () => {
					try {
						await deleteTag(tag.id).unwrap();
						notifications.show({
							title: "Tag Deleted",
							message: "Tag has been removed",
							color: "green",
						});
					} catch (err) {
						notifications.show({
							title: "Error",
							message: getErrorMessage(err),
							color: "red",
						});
					}
				},
			});
		},
		[deleteTag],
	);

	const columns = useMemo(
		() =>
			getTagColumns({
				onEdit: handleEdit,
				onDelete: handleDelete,
			}),
		[handleEdit, handleDelete],
	);

	return (
		<Stack gap="lg">
			<Group justify="space-between" align="center">
				<Title order={1}>Tags</Title>
				<Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
					Create Tag
				</Button>
			</Group>

			<Paper withBorder p="md" radius="md">
				<TextInput
					placeholder="Search tags..."
					leftSection={<IconSearch size={16} />}
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(1);
					}}
				/>
			</Paper>

			<DataTable
				data={paginatedTags}
				columns={columns}
				rowKey={(tag) => tag.id}
				loading={isLoading}
				page={page}
				pageCount={pageCount}
				onPageChange={setPage}
				emptyState={{
					icon: IconTags,
					title: "No tags found",
					description: search
						? "Try adjusting your search"
						: "Create your first tag to organize your links",
					actionLabel: search ? undefined : "Create Tag",
					onAction: search ? undefined : openCreate,
				}}
			/>

			<CreateTagModal opened={createOpened} onClose={closeCreate} />
			<EditTagModal
				tag={editingTag}
				opened={editOpened}
				onClose={handleCloseEdit}
			/>
		</Stack>
	);
}
