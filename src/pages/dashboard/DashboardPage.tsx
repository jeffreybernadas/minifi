import {
	ActionIcon,
	Anchor,
	Button,
	Group,
	LoadingOverlay,
	Menu,
	Pagination,
	Paper,
	Select,
	SimpleGrid,
	Stack,
	Table,
	Text,
	TextInput,
	Title,
	Tooltip,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
	IconArchive,
	IconArchiveOff,
	IconChartBar,
	IconClick,
	IconDotsVertical,
	IconExternalLink,
	IconLink,
	IconLock,
	IconPencil,
	IconPlus,
	IconQrcode,
	IconRefresh,
	IconSearch,
	IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	useArchiveLinkMutation,
	useDeleteLinkMutation,
	useGetLinksQuery,
	useUnarchiveLinkMutation,
} from "@/app/api/links.api";
import { CreateLinkModal } from "@/components/links";
import {
	CopyButton,
	EmptyState,
	LinkStatusBadge,
	ScanStatusBadge,
	StatsCard,
} from "@/components/ui";
import type { Link as LinkType, LinkStatus } from "@/types";
import { getErrorMessage } from "@/types";

// Status filter options
const STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "ACTIVE", label: "Active" },
	{ value: "SCHEDULED", label: "Scheduled" },
	{ value: "DISABLED", label: "Disabled" },
];

export default function DashboardPage() {
	const navigate = useNavigate();

	// Modal state
	const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
		useDisclosure(false);

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

	// Stats calculations
	const links = data?.data ?? [];
	const meta = data?.meta;
	const totalLinks = meta?.itemCount ?? 0;
	const activeLinks = links.filter((l) => l.status === "ACTIVE").length;
	const totalClicks = links.reduce((sum, l) => sum + l.clickCount, 0);

	// Handlers
	const handleArchive = async (link: LinkType) => {
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
	};

	const handleDelete = (link: LinkType) => {
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
	};

	// Format date
	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

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
				<StatsCard
					title="Total Links"
					value={totalLinks}
					icon={IconLink}
					iconColor="blue"
					loading={isLoading}
				/>
				<StatsCard
					title="Active Links"
					value={activeLinks}
					icon={IconChartBar}
					iconColor="green"
					loading={isLoading}
				/>
				<StatsCard
					title="Total Clicks"
					value={totalClicks.toLocaleString()}
					icon={IconClick}
					iconColor="violet"
					loading={isLoading}
				/>
				<StatsCard
					title="This Page"
					value={links.length}
					icon={IconLink}
					iconColor="gray"
					description={`of ${totalLinks} total`}
					loading={isLoading}
				/>
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
						variant={isArchived ? "filled" : "light"}
						color={isArchived ? "orange" : "gray"}
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
			<Paper withBorder radius="md" pos="relative" mih={200}>
				<LoadingOverlay visible={isLoading || isFetching} zIndex={10} />

				{isLoading ? null : links.length === 0 ? (
					<EmptyState
						icon={isArchived ? IconArchive : IconLink}
						title={isArchived ? "No archived links" : "No links yet"}
						description={
							isArchived
								? "Links you archive will appear here"
								: "Create your first short link to get started"
						}
						actionLabel={isArchived ? undefined : "Create Link"}
						onAction={isArchived ? undefined : openCreateModal}
					/>
				) : (
					<>
						<Table.ScrollContainer minWidth={800}>
							<Table striped highlightOnHover>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Link</Table.Th>
										<Table.Th>Status</Table.Th>
										<Table.Th>Clicks</Table.Th>
										<Table.Th>Security</Table.Th>
										<Table.Th>Created</Table.Th>
										<Table.Th w={100}>Actions</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{links.map((link) => (
										<Table.Tr key={link.id}>
											{/* Link Info */}
											<Table.Td>
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
														<CopyButton
															value={link.shortUrl!}
															size="xs"
															variant="subtle"
														>
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
											</Table.Td>

											{/* Status */}
											<Table.Td>
												<LinkStatusBadge status={link.status} />
											</Table.Td>

											{/* Clicks */}
											<Table.Td>
												<Group gap={4}>
													<Text size="sm" fw={500}>
														{link.clickCount.toLocaleString()}
													</Text>
													<Text size="xs" c="dimmed">
														({link.uniqueClickCount} unique)
													</Text>
												</Group>
											</Table.Td>

											{/* Security */}
											<Table.Td>
												<ScanStatusBadge status={link.scanStatus} />
											</Table.Td>

											{/* Created */}
											<Table.Td>
												<Text size="sm">{formatDate(link.createdAt)}</Text>
											</Table.Td>

											{/* Actions */}
											<Table.Td>
												<Group gap={4}>
													<Tooltip label="View Analytics">
														<ActionIcon
															variant="subtle"
															color="blue"
															onClick={() =>
																navigate(`/dashboard/analytics/${link.id}`)
															}
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
																onClick={() =>
																	navigate(`/dashboard/links/${link.id}`)
																}
															>
																Edit
															</Menu.Item>
															<Menu.Item
																leftSection={<IconQrcode size={14} />}
																onClick={() =>
																	navigate(`/dashboard/links/${link.id}`)
																}
															>
																QR Code
															</Menu.Item>
															<Menu.Item
																leftSection={<IconRefresh size={14} />}
															>
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
																onClick={() => handleArchive(link)}
															>
																{link.isArchived ? "Unarchive" : "Archive"}
															</Menu.Item>
															<Menu.Item
																leftSection={<IconTrash size={14} />}
																color="red"
																onClick={() => handleDelete(link)}
															>
																Delete
															</Menu.Item>
														</Menu.Dropdown>
													</Menu>
												</Group>
											</Table.Td>
										</Table.Tr>
									))}
								</Table.Tbody>
							</Table>
						</Table.ScrollContainer>

						{/* Pagination */}
						{meta && meta.pageCount > 1 && (
							<Group justify="center" p="md">
								<Pagination
									total={meta.pageCount}
									value={page}
									onChange={setPage}
								/>
							</Group>
						)}
					</>
				)}
			</Paper>

			{/* Create Link Modal */}
			<CreateLinkModal opened={createModalOpened} onClose={closeCreateModal} />
		</Stack>
	);
}
