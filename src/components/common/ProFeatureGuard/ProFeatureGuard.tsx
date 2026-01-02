import { Button, Center, Paper, Stack, Text, Title } from "@mantine/core";
import { IconCrown, IconLock } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export interface ProFeatureGuardProps {
	/**
	 * Whether the user has PRO access
	 */
	isPro: boolean;

	/**
	 * Children to render if user has PRO access
	 */
	children: React.ReactNode;

	/**
	 * Feature name to display in upgrade prompt
	 * @default "This Feature"
	 */
	featureName?: string;

	/**
	 * Custom upgrade message
	 * @default "Upgrade to PRO to unlock this feature."
	 */
	upgradeMessage?: string;

	/**
	 * Whether to render as a bordered paper component
	 * @default true
	 */
	withBorder?: boolean;
}

/**
 * ProFeatureGuard Component
 *
 * Conditionally renders children based on PRO subscription status.
 * Shows upgrade prompt for FREE users.
 *
 * @example
 * ```tsx
 * <ProFeatureGuard isPro={isPro} featureName="Device Analytics">
 *   <AnalyticsPieChart data={devices} />
 * </ProFeatureGuard>
 * ```
 */
export function ProFeatureGuard({
	isPro,
	children,
	featureName = "This Feature",
	upgradeMessage,
	withBorder = true,
}: Readonly<ProFeatureGuardProps>) {
	const navigate = useNavigate();

	// If user has PRO access, render children
	if (isPro) {
		return <>{children}</>;
	}

	// Default upgrade message
	const defaultMessage = `Upgrade to PRO to unlock ${featureName.toLowerCase()} with detailed insights, advanced filtering, and export capabilities.`;

	// Show upgrade prompt for FREE users
	const content = (
		<Center py="xl">
			<Stack align="center" gap="md" maw={450}>
				<IconLock size={48} color="var(--mantine-color-gray-5)" />
				<Title order={4}>{featureName}</Title>
				<Text size="sm" c="dimmed" ta="center">
					{upgradeMessage ?? defaultMessage}
				</Text>
				<Button
					variant="light"
					color="violet"
					leftSection={<IconCrown size={16} />}
					onClick={() => navigate("/dashboard/settings")}
				>
					Upgrade to PRO
				</Button>
			</Stack>
		</Center>
	);

	// Wrap in Paper if withBorder is true
	if (withBorder) {
		return (
			<Paper withBorder p="xl" radius="md">
				{content}
			</Paper>
		);
	}

	return content;
}
