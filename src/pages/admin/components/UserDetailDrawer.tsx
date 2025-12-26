import {
	Alert,
	Avatar,
	Badge,
	Button,
	Divider,
	Drawer,
	Group,
	Loader,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import {
	IconBan,
	IconBell,
	IconBellOff,
	IconCalendar,
	IconCreditCard,
	IconCrown,
	IconLink,
	IconLockOpen,
	IconMail,
	IconMapPin,
	IconMouse,
	IconPhone,
	IconTrash,
} from "@tabler/icons-react";
import { useGetAdminUserQuery } from "@/app/api/admin.api";
import { CopyButton } from "@/components/ui";
import type { AdminUserDetail } from "@/types";
import { getErrorMessage } from "@/types";

interface UserDetailDrawerProps {
	userId: string | null;
	onClose: () => void;
	onChangeTier: (user: AdminUserDetail) => void;
	onBlock: (user: AdminUserDetail) => void;
	onUnblock: (user: AdminUserDetail) => void;
	onDelete: (user: AdminUserDetail) => void;
	disableActions?: boolean;
}

/**
 * Format date for display
 */
const formatDate = (date: string) => {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

/**
 * Format full date with time
 */
const formatDateTime = (date: string) => {
	return new Date(date).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
};

/**
 * Get user initials
 */
const getUserInitials = (user: AdminUserDetail): string => {
	if (user.firstName && user.lastName) {
		return `${user.firstName.charAt(0)}${user.lastName.charAt(
			0,
		)}`.toUpperCase();
	}
	if (user.firstName) {
		return user.firstName.charAt(0).toUpperCase();
	}
	return user.email.charAt(0).toUpperCase();
};

/**
 * Get display name
 */
const getDisplayName = (user: AdminUserDetail): string => {
	if (user.firstName || user.lastName) {
		return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
	}
	return user.email;
};

/**
 * Info row component
 */
function InfoRow({
	icon: Icon,
	label,
	value,
	copyable = false,
	muted = false,
}: {
	icon: React.ElementType;
	label: string;
	value: string | React.ReactNode;
	copyable?: boolean;
	muted?: boolean;
}) {
	return (
		<Group gap="sm" wrap="nowrap">
			<ThemeIcon size="sm" variant="light" color="gray">
				<Icon size={14} />
			</ThemeIcon>
			<Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
				<Text size="xs" c="dimmed">
					{label}
				</Text>
				<Group gap="xs">
					{typeof value === "string" ? (
						<Text size="sm" c={muted ? "dimmed" : undefined} truncate>
							{value}
						</Text>
					) : (
						value
					)}
					{copyable && typeof value === "string" && (
						<CopyButton value={value} size="xs" variant="subtle" />
					)}
				</Group>
			</Stack>
		</Group>
	);
}

/**
 * Stat box component
 */
function StatBox({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: string | number;
	icon: React.ElementType;
}) {
	return (
		<Stack gap={4} align="center" p="xs">
			<ThemeIcon size="md" variant="light" color="blue">
				<Icon size={16} />
			</ThemeIcon>
			<Text size="lg" fw={700}>
				{typeof value === "number" ? value.toLocaleString() : value}
			</Text>
			<Text size="xs" c="dimmed" ta="center">
				{label}
			</Text>
		</Stack>
	);
}

export function UserDetailDrawer({
	userId,
	onClose,
	onChangeTier,
	onBlock,
	onUnblock,
	onDelete,
	disableActions,
}: UserDetailDrawerProps) {
	const {
		data: user,
		isLoading,
		isFetching,
		error,
	} = useGetAdminUserQuery(userId ?? "", {
		skip: !userId,
	});

	// Show loader for initial load OR when fetching a different user
	const showLoader = isLoading || isFetching;

	return (
		<Drawer
			opened={!!userId}
			onClose={onClose}
			title="User Details"
			position="right"
			size="md"
		>
			{showLoader && (
				<Stack align="center" justify="center" py="xl">
					<Loader />
					<Text size="sm" c="dimmed">
						Loading user details...
					</Text>
				</Stack>
			)}

			{!showLoader && error && (
				<Alert color="red" title="Error loading user">
					{getErrorMessage(error)}
				</Alert>
			)}

			{!showLoader && user && (
				<Stack gap="lg">
					{/* Header Section */}
					<Stack align="center" gap="sm">
						<Avatar size={80} radius={80} color="blue">
							{user.avatarUrl ? (
								<img
									src={user.avatarUrl}
									alt={getDisplayName(user)}
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
							) : (
								getUserInitials(user)
							)}
						</Avatar>
						<Stack gap={4} align="center">
							<Title order={4}>{getDisplayName(user)}</Title>
							<Group gap="xs">
								{user.userType === "ADMIN" && (
									<Badge size="sm" color="violet">
										Admin
									</Badge>
								)}
								{user.isBlocked ? (
									<Badge size="sm" color="red">
										Blocked
									</Badge>
								) : (
									<Badge size="sm" color="green">
										Active
									</Badge>
								)}
							</Group>
						</Stack>
					</Stack>

					<Divider />

					{/* Contact Information */}
					<Stack gap="xs">
						<Text size="sm" fw={600} c="dimmed" tt="uppercase">
							Contact
						</Text>
						<InfoRow
							icon={IconMail}
							label="Email"
							value={
								<Group gap="xs">
									<Text size="sm">{user.email}</Text>
									{user.emailVerified ? (
										<Badge size="xs" color="green" variant="light">
											Verified
										</Badge>
									) : (
										<Badge size="xs" color="gray" variant="light">
											Unverified
										</Badge>
									)}
								</Group>
							}
							copyable
						/>
						{user.phoneNumber ? (
							<InfoRow
								icon={IconPhone}
								label="Phone"
								value={user.phoneNumber}
								copyable
							/>
						) : (
							<InfoRow
								icon={IconPhone}
								label="Phone"
								value="Not provided"
								muted
							/>
						)}
						{user.address ? (
							<InfoRow icon={IconMapPin} label="Address" value={user.address} />
						) : (
							<InfoRow
								icon={IconMapPin}
								label="Address"
								value="Not provided"
								muted
							/>
						)}
					</Stack>

					<Divider />

					{/* Subscription Section */}
					<Stack gap="xs">
						<Text size="sm" fw={600} c="dimmed" tt="uppercase">
							Subscription
						</Text>
						<InfoRow
							icon={IconCrown}
							label="Tier"
							value={
								<Badge
									color={user.subscriptionTier === "PRO" ? "yellow" : "gray"}
									variant="light"
								>
									{user.subscriptionTier ?? "FREE"}
								</Badge>
							}
						/>
						{user.subscriptionStatus && (
							<InfoRow
								icon={IconCreditCard}
								label="Status"
								value={
									<Badge
										color={
											user.subscriptionStatus === "ACTIVE" ? "green" : "gray"
										}
										variant="light"
									>
										{user.subscriptionStatus}
									</Badge>
								}
							/>
						)}
						{user.stripeCustomerId && (
							<InfoRow
								icon={IconCreditCard}
								label="Stripe Customer"
								value={user.stripeCustomerId}
								copyable
							/>
						)}
					</Stack>

					<Divider />

					{/* Stats Section */}
					<Stack gap="xs">
						<Text size="sm" fw={600} c="dimmed" tt="uppercase">
							Statistics
						</Text>
						<SimpleGrid cols={3}>
							<StatBox
								label="Total Links"
								value={user.linksCount}
								icon={IconLink}
							/>
							<StatBox
								label="Active"
								value={user.activeLinksCount}
								icon={IconLink}
							/>
							<StatBox
								label="Clicks"
								value={user.totalClicks}
								icon={IconMouse}
							/>
						</SimpleGrid>
					</Stack>

					<Divider />

					{/* Account Section */}
					<Stack gap="xs">
						<Text size="sm" fw={600} c="dimmed" tt="uppercase">
							Account
						</Text>
						<InfoRow
							icon={IconCalendar}
							label="Member Since"
							value={formatDate(user.createdAt)}
						/>
						<InfoRow
							icon={IconCalendar}
							label="Last Updated"
							value={formatDateTime(user.updatedAt)}
						/>
						<InfoRow
							icon={user.emailNotificationsEnabled ? IconBell : IconBellOff}
							label="Email Notifications"
							value={
								<Badge
									color={user.emailNotificationsEnabled ? "green" : "gray"}
									variant="light"
								>
									{user.emailNotificationsEnabled ? "Enabled" : "Disabled"}
								</Badge>
							}
						/>
						{user.isBlocked && user.blockedAt && (
							<InfoRow
								icon={IconBan}
								label="Blocked At"
								value={formatDateTime(user.blockedAt)}
							/>
						)}
						{user.isBlocked && user.blockedReason && (
							<InfoRow
								icon={IconBan}
								label="Block Reason"
								value={user.blockedReason}
							/>
						)}
					</Stack>

					<Divider />

					{/* Actions Section */}
					{!disableActions && (
						<Stack gap="xs">
							<Text size="sm" fw={600} c="dimmed" tt="uppercase">
								Actions
							</Text>
							<Group grow>
								<Button
									variant="light"
									leftSection={<IconCrown size={16} />}
									onClick={() => onChangeTier(user)}
								>
									Change Tier
								</Button>
								{user.isBlocked ? (
									<Button
										variant="light"
										color="green"
										leftSection={<IconLockOpen size={16} />}
										onClick={() => onUnblock(user)}
									>
										Unblock
									</Button>
								) : (
									<Button
										variant="light"
										color="orange"
										leftSection={<IconBan size={16} />}
										onClick={() => onBlock(user)}
									>
										Block
									</Button>
								)}
							</Group>
							<Button
								variant="light"
								color="red"
								leftSection={<IconTrash size={16} />}
								onClick={() => onDelete(user)}
								fullWidth
							>
								Delete User
							</Button>
						</Stack>
					)}
				</Stack>
			)}
		</Drawer>
	);
}
