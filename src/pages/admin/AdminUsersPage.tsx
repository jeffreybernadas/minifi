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
import {
	IconBan,
	IconCrown,
	IconLink,
	IconMail,
	IconSearch,
	IconUsers,
} from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import {
	useBlockUserMutation,
	useChangeTierMutation,
	useDeleteUserMutation,
	useGetAdminStatsQuery,
	useGetAdminUsersQuery,
	useUnblockUserMutation,
} from "@/app/api/admin.api";
import { DataTable, StatsCard } from "@/components/ui";
import type {
	AdminUser,
	AdminUserDetail,
	SubscriptionTier,
	UserType,
} from "@/types";
import { getErrorMessage } from "@/types";
import { getUserColumns } from "./columns/user.columns";
import { UserDetailDrawer } from "./components/UserDetailDrawer";

const USER_TYPE_OPTIONS = [
	{ value: "", label: "All Types" },
	{ value: "FREE", label: "Free" },
	{ value: "PRO", label: "Pro" },
];

const EMAIL_VERIFIED_OPTIONS = [
	{ value: "", label: "All" },
	{ value: "true", label: "Verified" },
	{ value: "false", label: "Unverified" },
];

const TIER_OPTIONS = [
	{ value: "FREE", label: "Free" },
	{ value: "PRO", label: "Pro" },
];

export default function AdminUsersPage() {
	// Filter state
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebouncedValue(search, 300);
	const [userType, setUserType] = useState<string>("");
	const [emailVerified, setEmailVerified] = useState<string>("");
	const [showBlocked, setShowBlocked] = useState(false);
	const [page, setPage] = useState(1);
	const limit = 10;

	// Drawer state
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	// Modal state
	const [blockModalOpened, { open: openBlockModal, close: closeBlockModal }] =
		useDisclosure(false);
	const [tierModalOpened, { open: openTierModal, close: closeTierModal }] =
		useDisclosure(false);
	const [selectedUser, setSelectedUser] = useState<
		AdminUser | AdminUserDetail | null
	>(null);
	const [blockReason, setBlockReason] = useState("");
	const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("FREE");

	// Stats query
	const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();

	// Users query
	const { data, isLoading, isFetching } = useGetAdminUsersQuery({
		page,
		limit,
		...(debouncedSearch && { search: debouncedSearch }),
		...(userType && { userType: userType as UserType }),
		...(emailVerified && { emailVerified: emailVerified === "true" }),
		...(showBlocked && { isBlocked: true }),
	});

	// Mutations
	const [changeTier] = useChangeTierMutation();
	const [blockUser] = useBlockUserMutation();
	const [unblockUser] = useUnblockUserMutation();
	const [deleteUser] = useDeleteUserMutation();

	const users = data?.data ?? [];
	const meta = data?.meta;

	// Handlers
	const handleViewDetails = useCallback((user: AdminUser) => {
		setSelectedUserId(user.id);
	}, []);

	const handleCloseDrawer = useCallback(() => {
		setSelectedUserId(null);
	}, []);

	const handleChangeTier = useCallback(
		async (user: AdminUser | AdminUserDetail, tier: SubscriptionTier) => {
			try {
				await changeTier({ id: user.id, data: { tier } }).unwrap();
				notifications.show({
					title: "Tier updated",
					message: `User is now on ${tier} tier`,
					color: "green",
				});
				closeTierModal();
			} catch (err) {
				notifications.show({
					title: "Error",
					message: getErrorMessage(err),
					color: "red",
				});
			}
		},
		[changeTier, closeTierModal],
	);

	const handleBlock = useCallback(
		async (user: AdminUser | AdminUserDetail, reason: string) => {
			try {
				await blockUser({ id: user.id, data: { reason } }).unwrap();
				notifications.show({
					title: "User blocked",
					message: "User has been blocked",
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
		[blockUser, closeBlockModal],
	);

	const handleUnblock = useCallback(
		async (user: AdminUser | AdminUserDetail) => {
			try {
				await unblockUser(user.id).unwrap();
				notifications.show({
					title: "User unblocked",
					message: "User has been unblocked",
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
		[unblockUser],
	);

	const handleDelete = useCallback(
		(user: AdminUser | AdminUserDetail) => {
			modals.openConfirmModal({
				title: "Delete User",
				children: (
					<Text size="sm">
						Are you sure you want to permanently delete{" "}
						<strong>{user.email}</strong>? This will delete all their links,
						analytics, and data. This action cannot be undone.
					</Text>
				),
				labels: { confirm: "Delete", cancel: "Cancel" },
				confirmProps: { color: "red" },
				onConfirm: async () => {
					try {
						await deleteUser(user.id).unwrap();
						notifications.show({
							title: "User deleted",
							message: "User has been permanently deleted",
							color: "green",
						});
						// Close drawer if open
						if (selectedUserId === user.id) {
							setSelectedUserId(null);
						}
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
		[deleteUser, selectedUserId],
	);

	const openChangeTierModal = useCallback(
		(user: AdminUser | AdminUserDetail) => {
			setSelectedUser(user);
			// Pre-select current tier if available (from AdminUserDetail)
			if ("subscriptionTier" in user && user.subscriptionTier) {
				setSelectedTier(user.subscriptionTier);
			} else {
				setSelectedTier("FREE");
			}
			openTierModal();
		},
		[openTierModal],
	);

	const openBlockUserModal = useCallback(
		(user: AdminUser | AdminUserDetail) => {
			setSelectedUser(user);
			setBlockReason("");
			openBlockModal();
		},
		[openBlockModal],
	);

	// Column definitions using factory function
	const columns = useMemo(
		() =>
			getUserColumns({
				onViewDetails: handleViewDetails,
				onChangeTier: openChangeTierModal,
				onBlock: openBlockUserModal,
				onUnblock: handleUnblock,
				onDelete: handleDelete,
			}),
		[
			handleViewDetails,
			openChangeTierModal,
			openBlockUserModal,
			handleUnblock,
			handleDelete,
		],
	);

	// Empty state configuration based on filters
	const emptyState = useMemo(() => {
		if (showBlocked) {
			return {
				icon: IconBan,
				title: "No blocked users",
				description: "No users have been blocked",
			};
		}
		if (emailVerified === "false") {
			return {
				icon: IconMail,
				title: "No unverified users",
				description: "All users have verified their email",
			};
		}
		if (debouncedSearch) {
			return {
				icon: IconSearch,
				title: "No users found",
				description: `No results for "${debouncedSearch}"`,
			};
		}
		return {
			icon: IconUsers,
			title: "No users yet",
			description: "Users will appear here after they sign up",
		};
	}, [showBlocked, emailVerified, debouncedSearch]);

	return (
		<Stack gap="lg">
			{/* Header */}
			<Title order={1}>User Management</Title>

			{/* Stats Cards */}
			<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
				<StatsCard
					title="Total Users"
					value={stats?.totalUsers.toLocaleString() ?? 0}
					icon={IconUsers}
					iconColor="blue"
					loading={statsLoading}
					growth={stats?.userGrowth.percentage}
				/>
				<StatsCard
					title="PRO Users"
					value={stats?.totalProUsers.toLocaleString() ?? 0}
					icon={IconCrown}
					iconColor="yellow"
					loading={statsLoading}
				/>
				<StatsCard
					title="Blocked Users"
					value={stats?.blockedUsers.toLocaleString() ?? 0}
					icon={IconBan}
					iconColor="red"
					loading={statsLoading}
				/>
				<StatsCard
					title="Active Links"
					value={stats?.activeLinks.toLocaleString() ?? 0}
					icon={IconLink}
					iconColor="green"
					loading={statsLoading}
				/>
			</SimpleGrid>

			{/* Filters */}
			<Paper withBorder p="md" radius="md">
				<Group gap="md" wrap="wrap">
					<TextInput
						placeholder="Search users..."
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						style={{ flex: 1, minWidth: 200, maxWidth: 300 }}
					/>
					<Select
						placeholder="User Type"
						data={USER_TYPE_OPTIONS}
						value={userType}
						onChange={(val) => {
							setUserType(val ?? "");
							setPage(1);
						}}
						clearable
						w={140}
					/>
					<Select
						placeholder="Email Status"
						data={EMAIL_VERIFIED_OPTIONS}
						value={emailVerified}
						onChange={(val) => {
							setEmailVerified(val ?? "");
							setPage(1);
						}}
						clearable
						w={140}
					/>
					<Button
						variant={showBlocked ? "filled" : "outline"}
						color={showBlocked ? "red" : "blue"}
						leftSection={<IconBan size={16} />}
						onClick={() => {
							setShowBlocked(!showBlocked);
							setPage(1);
						}}
					>
						{showBlocked ? "Blocked" : "Show Blocked"}
					</Button>
				</Group>
			</Paper>

			{/* Users Table */}
			<DataTable
				data={users}
				columns={columns}
				rowKey={(user) => user.id}
				loading={isLoading || isFetching}
				page={page}
				pageCount={meta?.pageCount ?? 1}
				onPageChange={setPage}
				emptyState={emptyState}
			/>

			{/* User Detail Drawer */}
			<UserDetailDrawer
				userId={selectedUserId}
				onClose={handleCloseDrawer}
				onChangeTier={openChangeTierModal}
				onBlock={openBlockUserModal}
				onUnblock={handleUnblock}
				onDelete={handleDelete}
			/>

			{/* Change Tier Modal */}
			<Modal
				opened={tierModalOpened}
				onClose={closeTierModal}
				title="Change Subscription Tier"
			>
				<Stack gap="md">
					<Text size="sm">
						Change tier for <strong>{selectedUser?.email}</strong>
					</Text>
					<Select
						label="Tier"
						data={TIER_OPTIONS}
						value={selectedTier}
						onChange={(val) =>
							setSelectedTier((val as SubscriptionTier) || "FREE")
						}
					/>
					<Group justify="flex-end">
						<Button variant="outline" onClick={closeTierModal}>
							Cancel
						</Button>
						<Button
							onClick={() =>
								selectedUser &&
								void handleChangeTier(selectedUser, selectedTier)
							}
						>
							Update Tier
						</Button>
					</Group>
				</Stack>
			</Modal>

			{/* Block User Modal */}
			<Modal
				opened={blockModalOpened}
				onClose={closeBlockModal}
				title="Block User"
			>
				<Stack gap="md">
					<Text size="sm">
						Block <strong>{selectedUser?.email}</strong>?
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
								selectedUser && void handleBlock(selectedUser, blockReason)
							}
						>
							Block User
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Stack>
	);
}
