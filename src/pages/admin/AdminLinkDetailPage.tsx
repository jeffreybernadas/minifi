import {
	ActionIcon,
	Alert,
	Anchor,
	Badge,
	Button,
	Grid,
	Group,
	Loader,
	Modal,
	Paper,
	Stack,
	Text,
	Textarea,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
	IconArrowLeft,
	IconBan,
	IconExternalLink,
	IconLockOpen,
	IconPencil,
	IconRefresh,
	IconTrash,
	IconUser,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	useBlockLinkMutation,
	useDeleteAdminLinkMutation,
	useGetAdminLinkQuery,
	useRescanAdminLinkMutation,
	useUnblockLinkMutation,
} from "@/app/api/admin.api";
import {
	EditLinkModal,
	LinkInfoGrid,
	LinkQrCard,
	LinkScanDetails,
	LinkStatsGrid,
} from "@/components/links";
import { CopyButton, LinkStatusBadge, ScanStatusBadge } from "@/components/ui";
import { VITE_APP_URL } from "@/constants/env.constant";
import type { AdminLinkDetail, Link } from "@/types";
import { getErrorMessage } from "@/types";

// ============================================================================
// Owner Info Card (Admin-only component)
// ============================================================================

interface OwnerInfoCardProps {
	link: AdminLinkDetail;
}

function OwnerInfoCard({ link }: Readonly<OwnerInfoCardProps>) {
	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="md">
				<Group gap="xs">
					<IconUser size={20} />
					<Text fw={600}>Owner Information</Text>
				</Group>

				{link.isGuest ? (
					<Stack gap="xs">
						<Group gap="xs">
							<Text size="sm" c="dimmed" w={100}>
								Type:
							</Text>
							<Badge color="gray">Guest</Badge>
						</Group>
						{link.guestIpAddress && (
							<Group gap="xs">
								<Text size="sm" c="dimmed" w={100}>
									IP Address:
								</Text>
								<Text size="sm" ff="monospace">
									{link.guestIpAddress}
								</Text>
							</Group>
						)}
						{link.guestUserAgent && (
							<Group gap="xs" wrap="nowrap">
								<Text size="sm" c="dimmed" w={100} style={{ flexShrink: 0 }}>
									User Agent:
								</Text>
								<Text size="sm" lineClamp={2} style={{ flex: 1 }}>
									{link.guestUserAgent}
								</Text>
							</Group>
						)}
					</Stack>
				) : (
					<Stack gap="xs">
						<Group gap="xs">
							<Text size="sm" c="dimmed" w={100}>
								Type:
							</Text>
							<Badge color="blue">Registered User</Badge>
						</Group>
						<Group gap="xs">
							<Text size="sm" c="dimmed" w={100}>
								Email:
							</Text>
							<Text size="sm">{link.userEmail ?? "Unknown"}</Text>
						</Group>
						{link.userId && (
							<Group gap="xs" wrap="nowrap">
								<Text size="sm" c="dimmed" w={100} style={{ flexShrink: 0 }}>
									User ID:
								</Text>
								<Text
									size="sm"
									ff="monospace"
									lineClamp={1}
									style={{ flex: 1 }}
								>
									{link.userId}
								</Text>
							</Group>
						)}
					</Stack>
				)}
			</Stack>
		</Paper>
	);
}

// ============================================================================
// Main Admin Link Detail Page
// ============================================================================

export default function AdminLinkDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	// Modal states
	const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
		useDisclosure(false);
	const [blockModalOpened, { open: openBlockModal, close: closeBlockModal }] =
		useDisclosure(false);
	const [blockReason, setBlockReason] = useState("");

	// Query
	const {
		data: link,
		isLoading,
		error,
		refetch,
	} = useGetAdminLinkQuery(id ?? "", { skip: !id });

	// Mutations
	const [blockLink, { isLoading: isBlocking }] = useBlockLinkMutation();
	const [unblockLink, { isLoading: isUnblocking }] = useUnblockLinkMutation();
	const [rescanLink, { isLoading: isRescanning }] =
		useRescanAdminLinkMutation();
	const [deleteLink, { isLoading: isDeleting }] = useDeleteAdminLinkMutation();

	// Handlers
	const handleBlock = async () => {
		if (!link || !blockReason.trim()) return;

		try {
			await blockLink({ id: link.id, data: { reason: blockReason } }).unwrap();
			notifications.show({
				title: "Link blocked",
				message: "Link has been blocked",
				color: "orange",
			});
			closeBlockModal();
			setBlockReason("");
			void refetch();
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	};

	const handleUnblock = async () => {
		if (!link) return;

		try {
			await unblockLink(link.id).unwrap();
			notifications.show({
				title: "Link unblocked",
				message: "Link has been unblocked",
				color: "green",
			});
			void refetch();
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	};

	const handleRescan = async () => {
		if (!link) return;

		try {
			await rescanLink(link.id).unwrap();
			notifications.show({
				title: "Rescan queued",
				message: "Link will be rescanned shortly",
				color: "blue",
			});
			void refetch();
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	};

	const handleDelete = () => {
		if (!link) return;

		modals.openConfirmModal({
			title: "Delete Link",
			children: (
				<Alert color="red">
					This action cannot be undone and removes all analytics data.
				</Alert>
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
					navigate("/admin/links");
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

	// Loading state
	if (isLoading) {
		return (
			<Group justify="center" py="xl">
				<Loader />
			</Group>
		);
	}

	// Error state
	if (error) {
		return (
			<Alert color="red">Failed to load link: {getErrorMessage(error)}</Alert>
		);
	}

	// Not found
	if (!link) {
		return <Alert color="yellow">Link not found.</Alert>;
	}

	const shortUrl = `${VITE_APP_URL}/r/${link.customAlias ?? link.shortCode}`;
	const isBlocked = link.status === "BLOCKED";

	return (
		<Stack gap="lg">
			{/* Header Row */}
			<Group justify="space-between" align="center">
				<Title order={1}>Link Details</Title>
				<Button
					variant="subtle"
					leftSection={<IconArrowLeft size={16} />}
					onClick={() => navigate("/admin/links")}
				>
					Back
				</Button>
			</Group>

			{/* Link Header (inline - different buttons from user's page) */}
			<Paper withBorder p="lg" radius="md">
				<Stack gap="md">
					<Group align="flex-start" justify="space-between" wrap="nowrap">
						<Stack gap="md" style={{ flex: 1 }}>
							<Group align="center" gap="sm">
								<Text size="xl" fw={800} lineClamp={1}>
									{link.title || link.originalUrl}
								</Text>
								<LinkStatusBadge status={link.status} />
								<ScanStatusBadge status={link.scanStatus} />
								{link.isGuest && (
									<Badge color="gray" size="sm">
										Guest
									</Badge>
								)}
							</Group>

							<Stack gap="xs">
								<Stack gap={2}>
									<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
										Short URL
									</Text>
									<Group gap="xs" align="center">
										<Text
											size="md"
											c="blue"
											fw={600}
											style={{ fontFamily: "monospace" }}
										>
											{shortUrl}
										</Text>
										<CopyButton value={shortUrl} size="xs" variant="subtle" />
										<ActionIcon
											variant="subtle"
											color="blue"
											component="a"
											href={shortUrl}
											target="_blank"
											rel="noreferrer"
											size="sm"
										>
											<IconExternalLink size={16} />
										</ActionIcon>
									</Group>
								</Stack>

								<Stack gap={2}>
									<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
										Destination
									</Text>
									<Group gap="xs" align="center">
										<Anchor
											href={link.originalUrl}
											target="_blank"
											rel="noreferrer"
											size="sm"
											lineClamp={1}
											style={{ wordBreak: "break-all" }}
										>
											{link.originalUrl}
										</Anchor>
									</Group>
								</Stack>

								{link.description && (
									<Stack gap={2}>
										<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
											Description
										</Text>
										<Text size="sm" c="dimmed" lineClamp={2}>
											{link.description}
										</Text>
									</Stack>
								)}
							</Stack>
						</Stack>

						{/* Admin action buttons */}
						<Group gap="xs" align="flex-start">
							<Button
								variant="light"
								size="sm"
								leftSection={<IconPencil size={16} />}
								onClick={openEditModal}
							>
								Edit
							</Button>

							<Button
								variant="light"
								size="sm"
								color="violet"
								leftSection={<IconRefresh size={16} />}
								onClick={handleRescan}
								loading={isRescanning}
							>
								Rescan
							</Button>

							{isBlocked ? (
								<Button
									variant="outline"
									size="sm"
									color="green"
									leftSection={<IconLockOpen size={16} />}
									onClick={handleUnblock}
									loading={isUnblocking}
								>
									Unblock
								</Button>
							) : (
								<Button
									variant="outline"
									size="sm"
									color="orange"
									leftSection={<IconBan size={16} />}
									onClick={openBlockModal}
								>
									Block
								</Button>
							)}

							<Button
								variant="subtle"
								color="red"
								size="sm"
								leftSection={<IconTrash size={16} />}
								onClick={handleDelete}
								loading={isDeleting}
							>
								Delete
							</Button>
						</Group>
					</Group>
				</Stack>
			</Paper>

			{/* Stats */}
			<LinkStatsGrid link={link as unknown as Link} />

			{/* Main Content Grid */}
			<Grid gutter="lg">
				{/* Main Content */}
				<Grid.Col span={{ base: 12, lg: 8 }}>
					<Stack gap="md">
						<OwnerInfoCard link={link} />
						<LinkScanDetails link={link as unknown as Link} />
						<LinkInfoGrid link={link as unknown as Link} />
					</Stack>
				</Grid.Col>

				{/* Sidebar - QR Code */}
				<Grid.Col span={{ base: 12, lg: 4 }}>
					<LinkQrCard link={link as unknown as Link} />
				</Grid.Col>
			</Grid>

			{/* Edit Modal */}
			<EditLinkModal
				link={link}
				opened={editModalOpened}
				onClose={closeEditModal}
				onSuccess={() => void refetch()}
				isAdmin
			/>

			{/* Block Modal */}
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
							loading={isBlocking}
							onClick={handleBlock}
						>
							Block Link
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Stack>
	);
}
