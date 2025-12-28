import {
	Box,
	Button,
	Divider,
	Modal,
	ScrollArea,
	Stack,
	Text,
	ThemeIcon,
	Title,
	Typography,
} from "@mantine/core";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import {
	useDismissAdvisoryMutation,
	useGetActiveAdvisoriesQuery,
} from "@/app/api/advisory.api";
import { useAppSelector } from "@/app/hooks";
import { ADVISORY_TYPE_CONFIG } from "@/constants/advisory.constant";
import type { Advisory } from "@/types";
import { formatDate } from "@/utils/date.util";

interface AdvisoryModalUIProps {
	advisory: Advisory;
	onAction: () => void;
	actionLabel: string;
	actionLoading?: boolean;
	counter?: { current: number; total: number };
}

/**
 * Reusable modal UI for displaying advisory - used by both user and admin preview
 */
function AdvisoryModalUI({
	advisory,
	onAction,
	actionLabel,
	actionLoading = false,
	counter,
}: AdvisoryModalUIProps) {
	const config = ADVISORY_TYPE_CONFIG[advisory.type];
	const Icon = config.icon;

	return (
		<>
			{/* Colored header */}
			<Box
				bg={`var(--mantine-color-${config.color}-6)`}
				c="white"
				p="md"
				style={{
					borderRadius: "var(--mantine-radius-md) var(--mantine-radius-md) 0 0",
				}}
			>
				<Stack gap="xs" align="center">
					<ThemeIcon size={48} radius="xl" color={config.color} variant="white">
						<Icon size={28} />
					</ThemeIcon>
					<Text size="sm" fw={600} tt="uppercase">
						{config.label}
					</Text>
					{counter && (
						<Text size="xs" opacity={0.8}>
							{counter.current} of {counter.total}
						</Text>
					)}
				</Stack>
			</Box>

			{/* Content */}
			<Stack gap="sm" p="lg">
				<Title order={4} ta="center">
					{advisory.title}
				</Title>

				<ScrollArea.Autosize mah={200} offsetScrollbars>
					<Typography>
						<div
							dangerouslySetInnerHTML={{
								__html: DOMPurify.sanitize(advisory.content),
							}}
						/>
					</Typography>
				</ScrollArea.Autosize>

				{advisory.expiresAt && (
					<Text size="xs" c="dimmed" ta="center">
						Expires on {formatDate(advisory.expiresAt)}
					</Text>
				)}

				<Divider my="xs" />

				<Button
					onClick={onAction}
					loading={actionLoading}
					color={config.color}
					fullWidth
					size="md"
				>
					{actionLabel}
				</Button>
			</Stack>
		</>
	);
}

/**
 * Preview modal for admin - shows exact same UI users see, but just closes without dismissal
 */
interface AdvisoryPreviewModalProps {
	advisory: Advisory | null;
	opened: boolean;
	onClose: () => void;
}

export function AdvisoryPreviewModal({
	advisory,
	opened,
	onClose,
}: AdvisoryPreviewModalProps) {
	if (!advisory) return null;

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			withCloseButton={false}
			size="md"
			centered
			radius="md"
			padding={0}
			styles={{
				body: { padding: 0 },
			}}
		>
			<AdvisoryModalUI
				advisory={advisory}
				onAction={onClose}
				actionLabel="Dismiss"
			/>
		</Modal>
	);
}

/**
 * Main advisory modal shown to users with dismissal functionality
 */
export function AdvisoryModal() {
	const { isInitialized, isAuthenticated, user } = useAppSelector(
		(state) => state.auth,
	);
	const [currentIndex, setCurrentIndex] = useState(0);

	// Check if user is admin
	const isAdmin =
		user?.roles.includes("admin") || user?.roles.includes("superadmin");

	// Only fetch when auth is initialized, user is authenticated, and NOT an admin
	const { data: advisories = [], isLoading } = useGetActiveAdvisoriesQuery(
		undefined,
		{
			skip: !isInitialized || !isAuthenticated || isAdmin,
		},
	);

	const [dismissAdvisory, { isLoading: isDismissing }] =
		useDismissAdvisoryMutation();

	// Reset index when advisories array changes (e.g., new advisories published, dismissed)
	useEffect(() => {
		setCurrentIndex(0);
	}, []);

	// Ensure index is valid when advisories change
	useEffect(() => {
		if (advisories.length > 0 && currentIndex >= advisories.length) {
			setCurrentIndex(0);
		}
	}, [advisories, currentIndex]);

	const currentAdvisory = advisories[currentIndex];
	const hasMore = currentIndex < advisories.length - 1;

	const handleDismiss = async () => {
		if (!currentAdvisory) return;

		try {
			await dismissAdvisory(currentAdvisory.id).unwrap();

			// Move to next advisory or close
			if (hasMore) {
				setCurrentIndex((prev) => prev + 1);
			}
			// Modal will auto-close when no advisories left
		} catch {
			// Error handling - still advance to prevent being stuck
			if (hasMore) {
				setCurrentIndex((prev) => prev + 1);
			}
		}
	};

	// Don't render for admins, or if not initialized/authenticated/loading/no advisories
	if (
		!isInitialized ||
		!isAuthenticated ||
		isAdmin ||
		isLoading ||
		!currentAdvisory
	) {
		return null;
	}

	return (
		<Modal
			opened={!!currentAdvisory}
			onClose={handleDismiss}
			withCloseButton={false}
			size="md"
			centered
			closeOnClickOutside={false}
			closeOnEscape={false}
			radius="md"
			padding={0}
			styles={{
				body: { padding: 0 },
			}}
		>
			<AdvisoryModalUI
				advisory={currentAdvisory}
				onAction={handleDismiss}
				actionLabel={hasMore ? "Next" : "Dismiss"}
				actionLoading={isDismissing}
				counter={
					advisories.length > 1
						? { current: currentIndex + 1, total: advisories.length }
						: undefined
				}
			/>
		</Modal>
	);
}
