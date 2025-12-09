import {
	Badge,
	Button,
	Card,
	Group,
	List,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
} from "@mantine/core";
import { IconCheck, IconCrown } from "@tabler/icons-react";

/**
 * Pricing tier constants
 */
export const PRICING = {
	free: {
		name: "FREE",
		price: 0,
		features: [
			"Up to 25 active links",
			"90-day link retention",
			"Link security scanning with OpenAI",
			"Password protection",
			"QR code generation",
			"One-time links",
			"Basic analytics",
			"Link scheduling",
			"Link tags",
			"Email notifications",
		],
	},
	pro: {
		name: "PRO",
		price: 9,
		features: [
			"Everything in FREE",
			"Unlimited links",
			"2-year link retention",
			"Advanced analytics",
			"Custom aliases",
			"Priority support with live chat",
		],
	},
} as const;

export type SubscriptionTier = "FREE" | "PRO";

export interface PricingCardsProps {
	/**
	 * Current user's tier. If undefined, no "Current Plan" badge is shown (guest view).
	 */
	currentTier?: SubscriptionTier;
	/**
	 * Called when user clicks upgrade button (for FREE users in dashboard)
	 */
	onUpgrade?: () => void;
	/**
	 * Called when user clicks sign up button (for guests on landing page)
	 */
	onSignUp?: () => void;
	/**
	 * Loading state for upgrade button
	 */
	isUpgrading?: boolean;
	/**
	 * Show action buttons (upgrade/sign up). Defaults to true.
	 */
	showActions?: boolean;
}

/**
 * Reusable pricing comparison cards for FREE vs PRO tiers.
 * Used in both SettingsPage (authenticated) and LandingPage (guests).
 */
export function PricingCards({
	currentTier,
	onUpgrade,
	onSignUp,
	isUpgrading = false,
	showActions = true,
}: PricingCardsProps) {
	const isFree = currentTier === "FREE";
	const isPro = currentTier === "PRO";
	const isGuest = currentTier === undefined;

	return (
		<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
			{/* FREE Plan */}
			<Card
				withBorder
				p="xl"
				bg={isFree ? "var(--mantine-color-blue-light)" : undefined}
			>
				<Stack gap="md" h="100%" justify="space-between">
					<Stack gap="md">
						<Group justify="space-between" align="flex-start">
							<Text fw={600} size="lg">
								{PRICING.free.name}
							</Text>
							<Text fw={700} size="xl">
								${PRICING.free.price}
							</Text>
						</Group>

						<List
							spacing="xs"
							size="sm"
							icon={
								<ThemeIcon size={20} radius="xl" color="gray">
									<IconCheck size={12} />
								</ThemeIcon>
							}
						>
							{PRICING.free.features.map((feature) => (
								<List.Item key={feature}>{feature}</List.Item>
							))}
						</List>
					</Stack>

					<Stack gap="sm">
						{isFree && (
							<Badge color="blue" variant="light" size="lg">
								Current Plan
							</Badge>
						)}

						{showActions && isGuest && (
							<Button variant="outline" size="md" onClick={onSignUp}>
								Get Started Free
							</Button>
						)}
					</Stack>
				</Stack>
			</Card>

			{/* PRO Plan */}
			<Card
				withBorder
				p="xl"
				bg={isPro ? "var(--mantine-color-violet-light)" : undefined}
				style={
					!isPro
						? {
								borderColor: "var(--mantine-color-violet-4)",
								borderWidth: 2,
							}
						: undefined
				}
			>
				<Stack gap="md" h="100%" justify="space-between">
					<Stack gap="md">
						<Group justify="space-between" align="flex-start">
							<Group gap={6}>
								<IconCrown size={20} color="var(--mantine-color-violet-6)" />
								<Text fw={600} size="lg">
									{PRICING.pro.name}
								</Text>
							</Group>
							<Group gap={4} align="baseline">
								<Text fw={700} size="xl">
									${PRICING.pro.price}
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
								<ThemeIcon size={20} radius="xl" color="violet">
									<IconCheck size={12} />
								</ThemeIcon>
							}
						>
							{PRICING.pro.features.map((feature) => (
								<List.Item key={feature}>{feature}</List.Item>
							))}
						</List>
					</Stack>

					<Stack gap="sm">
						{isPro && (
							<Badge color="violet" variant="light" size="lg">
								Current Plan
							</Badge>
						)}

						{showActions && (isGuest || isFree) && (
							<Button
								color="violet"
								size="md"
								leftSection={<IconCrown size={16} />}
								onClick={isGuest ? onSignUp : onUpgrade}
								loading={isUpgrading}
							>
								{isGuest ? "Get PRO" : "Upgrade to PRO"}
							</Button>
						)}
					</Stack>
				</Stack>
			</Card>
		</SimpleGrid>
	);
}
