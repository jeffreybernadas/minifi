import {
	Button,
	Group,
	Paper,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
	IconArchive,
	IconLink,
	IconPlus,
	IconSearch,
} from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	useArchiveLinkMutation,
	useDeleteLinkMutation,
	useGetLinksQuery,
	useRescanLinkMutation,
	useUnarchiveLinkMutation,
} from "@/app/api/links.api";
import { CreateLinkModal, EditLinkModal } from "@/components/links";
import { DataTable, StatsCard } from "@/components/ui";
import { getLinkColumns } from "@/pages/dashboard/columns";
import type { LinkStatus, Link as LinkType } from "@/types";
import { getErrorMessage } from "@/types";
import { getStatsCards, STATUS_OPTIONS } from "./constants";

export default function DashboardPage() {
	const navigate = useNavigate();

	// Modal state
	const [
		createModalOpened,
		{ open: openCreateModal, close: closeCreateModal },
	] = useDisclosure(false);
	const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
		useDisclosure(false);
	const [editingLink, setEditingLink] = useState<LinkType | null>(null);

	// Filter state
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebouncedValue(search, 300);
	const [status, setStatus] = useState<string>("");
	const [isArchived, setIsArchived] = useState(false);
	const [page, setPage] = useState(1);
	const limit = 10;

	// Queries - only include filters when they have values
	const { data, isLoading, isFetching } = useGetLinksQuery({
		page,
		limit,
		...(debouncedSearch && { search: debouncedSearch }),
		...(status && { status: status as LinkStatus }),
		...(isArchived && { isArchived: true }),
	});

	// Mutations
	const [archiveLink] = useArchiveLinkMutation();
	const [unarchiveLink] = useUnarchiveLinkMutation();
	const [deleteLink] = useDeleteLinkMutation();
	const [rescanLink] = useRescanLinkMutation();

	// Stats calculations
	const links = data?.data ?? [];
	const meta = data?.meta;
	const totalLinks = meta?.itemCount ?? 0;
	const activeLinks = links.filter((l) => l.status === "ACTIVE").length;
	const totalClicks = links.reduce((sum, l) => sum + l.clickCount, 0);

	// Handlers
	const handleArchive = useCallback(
		async (link: LinkType) => {
			try {
				if (link.isArchived) {
					await unarchiveLink(link.id).unwrap();
					notifications.show({
						title: "Link restored",
						message: "Link has been unarchived",
						color: "green",
					});
				} else {
					await archiveLink(link.id).unwrap();
					notifications.show({
						title: "Link archived",
						message: "Link has been archived",
						color: "green",
					});
				}
			} catch (err) {
				notifications.show({
					title: "Error",
					message: getErrorMessage(err),
					color: "red",
				});
			}
		},
		[archiveLink, unarchiveLink],
	);

	const handleDelete = useCallback(
		(link: LinkType) => {
			modals.openConfirmModal({
				title: "Delete Link",
				children: (
					<Text size="sm">
						Are you sure you want to permanently delete this link? This action
						cannot be undone and all analytics data will be lost.
					</Text>
				),
				labels: { confirm: "Delete", cancel: "Cancel" },
				confirmProps: { color: "red" },
				onConfirm: () => {
					void (async () => {
						try {
							await deleteLink(link.id).unwrap();
							notifications.show({
								title: "Link deleted",
								message: "Link has been permanently deleted",
								color: "green",
							});
						} catch (err) {
							notifications.show({
								title: "Error",
								message: getErrorMessage(err),
								color: "red",
							});
						}
					})();
				},
			});
		},
		[deleteLink],
	);

	const handleRescan = useCallback(
		async (link: LinkType) => {
			try {
				await rescanLink(link.id).unwrap();
				notifications.show({
					title: "Scan requested",
					message: "URL will be rescanned shortly",
					color: "blue",
				});
			} catch (err) {
				notifications.show({
					title: "Error",
					message: getErrorMessage(err),
					color: "red",
				});
			}
		},
		[rescanLink],
	);

	const handleEdit = useCallback(
		(link: LinkType) => {
			setEditingLink(link);
			openEditModal();
		},
		[openEditModal],
	);

	const handleCloseEditModal = useCallback(() => {
		closeEditModal();
		setEditingLink(null);
	}, [closeEditModal]);

	// Column definitions (extracted to separate file)
	const columns = useMemo(
		() =>
			getLinkColumns({
				onNavigate: (path) => {
					navigate(path);
				},
				onEdit: handleEdit,
				onRescan: (link) => {
					void handleRescan(link);
				},
				onArchive: (link) => {
					void handleArchive(link);
				},
				onDelete: handleDelete,
			}),
		[navigate, handleEdit, handleRescan, handleArchive, handleDelete],
	);

	// Stats cards configuration
	const statsCards = useMemo(
		() =>
			getStatsCards({
				totalLinks,
				activeLinks,
				totalClicks,
				pageCount: links.length,
			}),
		[totalLinks, activeLinks, totalClicks, links.length],
	);

	return (
		<Stack gap="lg">
			{/* Header */}
			<Group justify="space-between" align="center">
				<Title order={1}>Links</Title>
				<Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
					Create Link
				</Button>
			</Group>

			{/* Stats Cards */}
			<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
				{statsCards.map((card) => (
					<StatsCard
						key={card.key}
						title={card.title}
						value={card.value}
						icon={card.icon}
						iconColor={card.iconColor}
						description={card.description}
						loading={isLoading}
					/>
				))}
			</SimpleGrid>

			{/* Filters */}
			<Paper withBorder p="md" radius="md">
				<Group gap="md">
					<TextInput
						placeholder="Search links..."
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						style={{ flex: 1, maxWidth: 300 }}
					/>
					<Select
						placeholder="Status"
						data={STATUS_OPTIONS}
						value={status}
						onChange={(val) => {
							setStatus(val ?? "");
							setPage(1);
						}}
						clearable
						w={150}
					/>
					<Button
						variant={isArchived ? "filled" : "outline"}
						color={isArchived ? "orange" : "blue"}
						leftSection={<IconArchive size={16} />}
						onClick={() => {
							setIsArchived(!isArchived);
							setPage(1);
						}}
					>
						{isArchived ? "Archived" : "Show Archived"}
					</Button>
				</Group>
			</Paper>

			{/* Links Table */}
			<DataTable
				data={links}
				columns={columns}
				rowKey={(link) => link.id}
				loading={isLoading || isFetching}
				page={page}
				pageCount={meta?.pageCount ?? 1}
				onPageChange={setPage}
				emptyState={{
					icon: isArchived ? IconArchive : IconLink,
					title: isArchived ? "No archived links" : "No links yet",
					description: isArchived
						? "Links you archive will appear here"
						: "Create your first short link to get started",
					actionLabel: isArchived ? undefined : "Create Link",
					onAction: isArchived ? undefined : openCreateModal,
				}}
			/>

			{/* Create Link Modal */}
			<CreateLinkModal opened={createModalOpened} onClose={closeCreateModal} />

			{/* Edit Link Modal */}
			<EditLinkModal
				link={editingLink}
				opened={editModalOpened}
				onClose={handleCloseEditModal}
			/>
		</Stack>
	);
}
