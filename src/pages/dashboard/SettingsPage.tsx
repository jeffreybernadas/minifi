import {
	Badge,
	Box,
	Button,
	Card,
	Divider,
	Group,
	List,
	LoadingOverlay,
	Paper,
	Progress,
	Stack,
	Switch,
	Tabs,
	Text,
	ThemeIcon,
	Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
	IconBell,
	IconCheck,
	IconCreditCard,
	IconCrown,
	IconLink,
	IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import {
	useGetSubscriptionQuery,
	useCreateCheckoutMutation,
	useCreatePortalMutation,
	useCancelSubscriptionMutation,
} from "@/app/api/subscription.api";
import {
	useGetUserProfileQuery,
	useUpdateUserPreferencesMutation,
} from "@/app/api/user.api";
import { getErrorMessage } from "@/types/api.types";

// Constants
const FREE_LINK_LIMIT = 25;
const FREE_RETENTION_DAYS = 90;
const PRO_RETENTION_DAYS = 730;

// Features comparison
const FEATURES = {
	free: [
		"Up to 25 active links",
		"90-day link retention",
		"Link security scanning with OpenAI",
		"Password protection",
		"QR code generation",
		"One-time links",
		"Basic analytics",
		"Link scheduling",
		"Link tags",
		"Link email notifications",
	],
	pro: [
		"Everything in FREE",
		"Unlimited links",
		"2-year link retention",
		"Advanced analytics",
		"Custom aliases",
		"Priority support with direct Chat",
	],
};

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState<string | null>("subscription");

	return (
		<Stack gap="lg">
			<Title order={1}>Settings</Title>

			<Tabs value={activeTab} onChange={setActiveTab}>
				<Tabs.List>
					<Tabs.Tab
						value="subscription"
						leftSection={<IconCreditCard size={16} />}
					>
						Subscription & Billing
					</Tabs.Tab>
					<Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>
						Notifications
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="subscription" pt="md">
					<SubscriptionTab />
				</Tabs.Panel>

				<Tabs.Panel value="notifications" pt="md">
					<NotificationsTab />
				</Tabs.Panel>
			</Tabs>
		</Stack>
	);
}

function SubscriptionTab() {
	const { data: subscription, isLoading, error } = useGetSubscriptionQuery();
	const [createCheckout, { isLoading: isCreatingCheckout }] =
		useCreateCheckoutMutation();
	const [createPortal, { isLoading: isCreatingPortal }] =
		useCreatePortalMutation();
	const [cancelSubscription, { isLoading: isCancelling }] =
		useCancelSubscriptionMutation();

	const isPro = subscription?.tier === "PRO";
	const isCancelled = subscription?.cancelAtPeriodEnd === true;

	const handleUpgrade = async () => {
		try {
			const result = await createCheckout().unwrap();
			window.location.href = result.url;
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	};

	const handleManageBilling = async () => {
		try {
			const result = await createPortal().unwrap();
			window.location.href = result.url;
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	};

	const handleCancel = async () => {
		try {
			await cancelSubscription().unwrap();
			notifications.show({
				title: "Subscription Cancelled",
				message: "Your subscription will end at the current billing period.",
				color: "yellow",
			});
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	};

	const openCancelModal = () => {
		modals.openConfirmModal({
			title: "Cancel Subscription",
			children: (
				<Text size="sm">
					Are you sure you want to cancel your PRO subscription? You will keep
					PRO access until the end of your current billing period.
				</Text>
			),
			labels: { confirm: "Cancel Subscription", cancel: "Keep PRO" },
			confirmProps: { color: "red" },
			onConfirm: handleCancel,
		});
	};

	if (error) {
		return (
			<Paper p="xl" withBorder>
				<Text c="red">
					Failed to load subscription: {getErrorMessage(error)}
				</Text>
			</Paper>
		);
	}

	return (
		<Stack gap="lg">
			<Paper shadow="sm" p="xl" withBorder pos="relative">
				<LoadingOverlay visible={isLoading} />

				{/* Current Plan */}
				<Stack gap="md">
					<Group justify="space-between" align="flex-start">
						<Box>
							<Text size="sm" c="dimmed" mb={4}>
								Current Plan
							</Text>
							<Group gap="xs">
								<Badge
									size="xl"
									color={isPro ? "violet" : "gray"}
									variant="filled"
									leftSection={isPro ? <IconCrown size={14} /> : undefined}
								>
									{subscription?.tier || "FREE"}
								</Badge>
								{isCancelled && (
									<Badge size="sm" color="orange" variant="light">
										Cancels at period end
									</Badge>
								)}
							</Group>
						</Box>

						{isPro && subscription?.stripeCurrentPeriodEnd && (
							<Box ta="right">
								<Text size="sm" c="dimmed">
									{isCancelled ? "Access until" : "Next billing date"}
								</Text>
								<Text fw={500}>
									{new Date(
										subscription.stripeCurrentPeriodEnd,
									).toLocaleDateString()}
								</Text>
							</Box>
						)}
					</Group>

					<Divider />

					{/* Usage Stats (FREE users only) */}
					{!isPro && (
						<Box>
							<Text size="sm" c="dimmed" mb="xs">
								Usage
							</Text>
							<Group gap="xl">
								<Box style={{ flex: 1 }}>
									<Group justify="space-between" mb={4}>
										<Text size="sm">Active Links</Text>
										<Text size="sm" fw={500}>
											0 / {FREE_LINK_LIMIT}
										</Text>
									</Group>
									<Progress value={0} size="sm" color="blue" />
								</Box>
								<Box>
									<Text size="sm" c="dimmed">
										Retention
									</Text>
									<Text fw={500}>{FREE_RETENTION_DAYS} days</Text>
								</Box>
							</Group>
						</Box>
					)}

					{/* PRO stats */}
					{isPro && (
						<Group gap="xl" grow>
							<Box>
								<Text size="sm" c="dimmed" mb={4}>
									Active Links
								</Text>
								<Group gap={4}>
									<IconLink size={16} />
									<Text fw={500}>Unlimited</Text>
								</Group>
							</Box>
							<Box>
								<Text size="sm" c="dimmed" mb={4}>
									Retention
								</Text>
								<Text fw={500}>{PRO_RETENTION_DAYS} days (2 years)</Text>
							</Box>
						</Group>
					)}
				</Stack>
			</Paper>

			{/* Features Comparison */}
			<Paper shadow="sm" p="xl" withBorder>
				<Text fw={500} mb="md">
					Plan Features
				</Text>

				<Group align="flex-start" grow>
					{/* FREE Plan */}
					<Card
						withBorder
						p="lg"
						bg={!isPro ? "var(--mantine-color-blue-light)" : undefined}
					>
						<Stack gap="sm">
							<Group justify="space-between">
								<Text fw={600}>FREE</Text>
								<Text fw={700} size="xl">
									$0
								</Text>
							</Group>
							<List
								spacing="xs"
								size="sm"
								icon={
									<ThemeIcon size={18} radius="xl" color="gray">
										<IconCheck size={12} />
									</ThemeIcon>
								}
							>
								{FEATURES.free.map((feature) => (
									<List.Item key={feature}>{feature}</List.Item>
								))}
							</List>
							{!isPro && (
								<Badge color="blue" variant="light" mt="xs">
									Current Plan
								</Badge>
							)}
						</Stack>
					</Card>

					{/* PRO Plan */}
					<Card
						withBorder
						p="lg"
						bg={isPro ? "var(--mantine-color-violet-light)" : undefined}
					>
						<Stack gap="sm">
							<Group justify="space-between">
								<Group gap={4}>
									<IconCrown size={16} color="var(--mantine-color-violet-6)" />
									<Text fw={600}>PRO</Text>
								</Group>
								<Group gap={4} align="baseline">
									<Text fw={700} size="xl">
										$9
									</Text>
									<Text size="sm" c="dimmed">
										/month
									</Text>
								</Group>
							</Group>
							<List
								spacing="xs"
								size="sm"
								icon={
									<ThemeIcon size={18} radius="xl" color="violet">
										<IconCheck size={12} />
									</ThemeIcon>
								}
							>
								{FEATURES.pro.map((feature) => (
									<List.Item key={feature}>{feature}</List.Item>
								))}
							</List>
							{isPro && (
								<Badge color="violet" variant="light" mt="xs">
									Current Plan
								</Badge>
							)}
						</Stack>
					</Card>
				</Group>
			</Paper>

			{/* Actions */}
			<Paper shadow="sm" p="xl" withBorder>
				<Group justify="space-between">
					{!isPro ? (
						<>
							<Box>
								<Text fw={500}>Upgrade to PRO</Text>
								<Text size="sm" c="dimmed">
									Unlock unlimited links and advanced features
								</Text>
							</Box>
							<Button
								color="violet"
								leftSection={<IconCrown size={16} />}
								onClick={handleUpgrade}
								loading={isCreatingCheckout}
							>
								Upgrade Now
							</Button>
						</>
					) : (
						<>
							<Box>
								<Text fw={500}>Manage Subscription</Text>
								<Text size="sm" c="dimmed">
									Update payment method, view invoices, or cancel
								</Text>
							</Box>
							<Group>
								<Button
									variant="light"
									onClick={handleManageBilling}
									loading={isCreatingPortal}
								>
									Manage Billing
								</Button>
								{!isCancelled && (
									<Button
										variant="subtle"
										color="red"
										onClick={openCancelModal}
										loading={isCancelling}
									>
										Cancel
									</Button>
								)}
							</Group>
						</>
					)}
				</Group>
			</Paper>
		</Stack>
	);
}

function NotificationsTab() {
	const { data: profile, isLoading } = useGetUserProfileQuery();
	const [updatePreferences, { isLoading: isUpdating }] =
		useUpdateUserPreferencesMutation();

	const [emailEnabled, setEmailEnabled] = useState<boolean | null>(null);

	// Use local state if changed, otherwise use profile data
	const currentValue =
		emailEnabled ?? profile?.emailNotificationsEnabled ?? true;

	const handleToggle = async (checked: boolean) => {
		setEmailEnabled(checked);

		try {
			await updatePreferences({ emailNotificationsEnabled: checked }).unwrap();
			notifications.show({
				title: "Saved",
				message: checked
					? "Email notifications enabled"
					: "Email notifications disabled",
				color: "green",
			});
		} catch (err) {
			// Revert on error
			setEmailEnabled(null);
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	};

	return (
		<Stack gap="lg">
			<Paper shadow="sm" p="xl" withBorder pos="relative">
				<LoadingOverlay visible={isLoading} />

				<Stack gap="lg">
					<Box>
						<Text fw={500} size="lg" mb="xs">
							Email Notifications
						</Text>
						<Text size="sm" c="dimmed">
							Control whether you receive email notifications from Minifi.
						</Text>
					</Box>

					<Divider />

					<Group justify="space-between" align="flex-start">
						<Box>
							<Text fw={500}>Enable Email Notifications</Text>
							<Text size="sm" c="dimmed" maw={400}>
								When enabled, you will receive emails about:
							</Text>
							<List size="sm" mt="xs" c="dimmed">
								<List.Item>Link expiration reminders</List.Item>
								<List.Item>
									Security alerts (malicious links detected)
								</List.Item>
								<List.Item>Account & billing updates</List.Item>
								<List.Item>Product announcements</List.Item>
							</List>
						</Box>
						<Switch
							size="lg"
							checked={currentValue}
							onChange={(event) => handleToggle(event.currentTarget.checked)}
							disabled={isUpdating}
							thumbIcon={
								currentValue ? (
									<IconCheck
										size={12}
										stroke={3}
										color="var(--mantine-color-teal-6)"
									/>
								) : (
									<IconX
										size={12}
										stroke={3}
										color="var(--mantine-color-red-6)"
									/>
								)
							}
						/>
					</Group>
				</Stack>
			</Paper>

			<Text size="sm" c="dimmed" ta="center">
				More granular notification preferences coming soon.
			</Text>
		</Stack>
	);
}
