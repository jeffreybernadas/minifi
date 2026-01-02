import {
	Button,
	Group,
	Modal,
	Paper,
	Select,
	SimpleGrid,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconArchive, IconLink, IconSearch } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	useBlockLinkMutation,
	useDeleteAdminLinkMutation,
	useGetAdminLinksQuery,
	useRescanAdminLinkMutation,
	useUnblockLinkMutation,
} from "@/app/api/admin.api";
import { EditLinkModal } from "@/components/links";
import { DataTable, StatsCard } from "@/components/ui";
import {
	ADMIN_LINK_STATUS_OPTIONS,
	GUEST_OPTIONS,
	SCAN_STATUS_OPTIONS,
} from "@/constants/filter-options.constant";
import { getAdminLinkStatsCards } from "@/constants/stats.constant";
import type { AdminLink, LinkStatus, ScanStatus } from "@/types";
import { getErrorMessage } from "@/types";
import { getAdminLinkColumns } from "./columns";

export default function AdminLinksPage() {
	const navigate = useNavigate();

	// Filter state
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebouncedValue(search, 300);
	const [status, setStatus] = useState<string>("");
	const [scanStatus, setScanStatus] = useState<string>("");
	const [guestFilter, setGuestFilter] = useState<string>("");
	const [showArchived, setShowArchived] = useState(false);
	const [page, setPage] = useState(1);
	const limit = 10;

	// Edit modal state
	const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
		useDisclosure(false);
	const [editingLink, setEditingLink] = useState<AdminLink | null>(null);

	// Block modal state
	const [blockModalOpened, { open: openBlockModal, close: closeBlockModal }] =
		useDisclosure(false);
	const [selectedLink, setSelectedLink] = useState<AdminLink | null>(null);
	const [blockReason, setBlockReason] = useState("");

	// Query
	const { data, isLoading, isFetching } = useGetAdminLinksQuery({
		page,
		limit,
		order: "desc", // Sort by newest first
		...(debouncedSearch && { search: debouncedSearch }),
		...(status && { status: status as LinkStatus }),
		...(scanStatus && { scanStatus: scanStatus as ScanStatus }),
		...(guestFilter && { isGuest: guestFilter === "true" }),
		...(showArchived && { isArchived: true }),
	});

	// Mutations
	const [blockLink] = useBlockLinkMutation();
	const [unblockLink] = useUnblockLinkMutation();
	const [rescanLink] = useRescanAdminLinkMutation();
	const [deleteLink] = useDeleteAdminLinkMutation();

	const links = data?.data ?? [];
	const meta = data?.meta;

	// Stats calculations
	const totalLinks = meta?.itemCount ?? 0;
	const blockedLinks = links.filter((l) => l.status === "BLOCKED").length;
	const pendingScans = links.filter((l) => l.scanStatus === "PENDING").length;

	const statsCards = useMemo(
		() =>
			getAdminLinkStatsCards({
				totalLinks,
				blockedLinks,
				pendingScans,
				pageCount: links.length,
			}),
		[totalLinks, blockedLinks, pendingScans, links.length],
	);

	// Handlers
	const handleViewDetails = useCallback(
		(link: AdminLink) => {
			navigate(`/admin/links/${link.id}`);
		},
		[navigate],
	);

	const handleEdit = useCallback(
		(link: AdminLink) => {
			setEditingLink(link);
			openEditModal();
		},
		[openEditModal],
	);

	const handleCloseEditModal = useCallback(() => {
		closeEditModal();
		setEditingLink(null);
	}, [closeEditModal]);

	const handleRescan = useCallback(
		async (link: AdminLink) => {
			try {
				await rescanLink(link.id).unwrap();
				notifications.show({
					title: "Rescan queued",
					message: "Link will be rescanned shortly",
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

	const handleBlock = useCallback(
		async (link: AdminLink, reason: string) => {
			try {
				await blockLink({ id: link.id, data: { reason } }).unwrap();
				notifications.show({
					title: "Link blocked",
					message: "Link has been blocked",
					color: "orange",
				});
				closeBlockModal();
				setBlockReason("");
			} catch (err) {
				notifications.show({
					title: "Error",
					message: getErrorMessage(err),
					color: "red",
				});
			}
		},
		[blockLink, closeBlockModal],
	);

	const handleUnblock = useCallback(
		async (link: AdminLink) => {
			try {
				await unblockLink(link.id).unwrap();
				notifications.show({
					title: "Link unblocked",
					message: "Link has been unblocked",
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
		[unblockLink],
	);

	const handleDelete = useCallback(
		(link: AdminLink) => {
			modals.openConfirmModal({
				title: "Delete Link",
				children: (
					<Text size="sm">
						Are you sure you want to permanently delete this link? All analytics
						data will be lost. This action cannot be undone.
					</Text>
				),
				labels: { confirm: "Delete", cancel: "Cancel" },
				confirmProps: { color: "red" },
				onConfirm: async () => {
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
				},
			});
		},
		[deleteLink],
	);

	const openBlockLinkModal = useCallback(
		(link: AdminLink) => {
			setSelectedLink(link);
			setBlockReason("");
			openBlockModal();
		},
		[openBlockModal],
	);

	// Column definitions (extracted to separate file)
	const columns = useMemo(
		() =>
			getAdminLinkColumns({
				onViewDetails: handleViewDetails,
				onEdit: handleEdit,
				onRescan: (link) => {
					void handleRescan(link);
				},
				onBlock: openBlockLinkModal,
				onUnblock: (link) => {
					void handleUnblock(link);
				},
				onDelete: handleDelete,
			}),
		[
			handleViewDetails,
			handleEdit,
			handleRescan,
			openBlockLinkModal,
			handleUnblock,
			handleDelete,
		],
	);

	return (
		<Stack gap="lg">
			{/* Header */}
			<Title order={1}>Link Management</Title>

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
				<Group gap="md" wrap="wrap">
					<TextInput
						placeholder="Search links..."
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						style={{ flex: 1, minWidth: 200, maxWidth: 300 }}
					/>
					<Select
						placeholder="Status"
						data={ADMIN_LINK_STATUS_OPTIONS}
						value={status}
						onChange={(val) => {
							setStatus(val ?? "");
							setPage(1);
						}}
						clearable
						w={150}
					/>
					<Select
						placeholder="Scan Status"
						data={SCAN_STATUS_OPTIONS}
						value={scanStatus}
						onChange={(val) => {
							setScanStatus(val ?? "");
							setPage(1);
						}}
						clearable
						w={160}
					/>
					<Select
						placeholder="Owner Type"
						data={GUEST_OPTIONS}
						value={guestFilter}
						onChange={(val) => {
							setGuestFilter(val ?? "");
							setPage(1);
						}}
						clearable
						w={160}
					/>
					<Button
						variant={showArchived ? "filled" : "outline"}
						color={showArchived ? "orange" : "blue"}
						leftSection={<IconArchive size={16} />}
						onClick={() => {
							setShowArchived(!showArchived);
							setPage(1);
						}}
					>
						{showArchived ? "Archived" : "Show Archived"}
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
					icon: IconLink,
					title: "No links found",
					description: "Links will appear here",
				}}
			/>

			{/* Edit Link Modal */}
			<EditLinkModal
				link={editingLink}
				opened={editModalOpened}
				onClose={handleCloseEditModal}
				isAdmin
			/>

			{/* Block Link Modal */}
			<Modal
				opened={blockModalOpened}
				onClose={closeBlockModal}
				title="Block Link"
			>
				<Stack gap="md">
					<Text size="sm">
						Block this link? It will no longer be accessible.
					</Text>
					<Textarea
						label="Reason"
						placeholder="Enter the reason for blocking..."
						value={blockReason}
						onChange={(e) => setBlockReason(e.target.value)}
						required
					/>
					<Group justify="flex-end">
						<Button variant="outline" onClick={closeBlockModal}>
							Cancel
						</Button>
						<Button
							color="red"
							disabled={!blockReason.trim()}
							onClick={() =>
								selectedLink && void handleBlock(selectedLink, blockReason)
							}
						>
							Block Link
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Stack>
	);
}
