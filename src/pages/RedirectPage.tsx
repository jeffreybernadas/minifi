import { zodResolver } from "@hookform/resolvers/zod";
import {
	Alert,
	Badge,
	Box,
	Button,
	Center,
	Group,
	List,
	Loader,
	Modal,
	Paper,
	PasswordInput,
	Stack,
	Text,
	ThemeIcon,
	Title,
	Tooltip,
} from "@mantine/core";
import {
	IconAlertTriangle,
	IconExternalLink,
	IconLock,
	IconRocket,
	IconShieldX,
	IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

// Height that fits within viewport without scroll
// Accounts for: header (60px), container padding (32px), footer (~60px)
const PAGE_HEIGHT = "calc(100dvh - 160px)";
import {
	useGetRedirectInfoQuery,
	useVerifyPasswordMutation,
	type RedirectWarning,
	type ScanStatus,
} from "@/app/api/redirect.api";
import { getRandomLoadingQuote } from "@/constants/loading-quotes.constant";
import { getErrorMessage } from "@/types";

// Password form schema
const passwordSchema = z.object({
	password: z.string().min(1, "Password is required"),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Security status config
const SECURITY_CONFIG: Record<
	ScanStatus,
	{ color: string; icon: typeof IconAlertTriangle; title: string }
> = {
	PENDING: { color: "gray", icon: IconAlertTriangle, title: "Scan Pending" },
	SAFE: { color: "green", icon: IconRocket, title: "Safe" },
	SUSPICIOUS: {
		color: "yellow",
		icon: IconAlertTriangle,
		title: "Suspicious Link",
	},
	MALICIOUS: { color: "red", icon: IconShieldX, title: "Dangerous Link" },
	ADULT_CONTENT: {
		color: "orange",
		icon: IconAlertTriangle,
		title: "Adult Content",
	},
};

export default function RedirectPage() {
	const { code } = useParams<{ code: string }>();
	const navigate = useNavigate();

	// State
	const [passwordModalOpen, setPasswordModalOpen] = useState(false);
	const [warningModalOpen, setWarningModalOpen] = useState(false);
	const [pendingUrl, setPendingUrl] = useState<string | null>(null);
	const [pendingWarning, setPendingWarning] = useState<RedirectWarning | null>(
		null,
	);

	// Random loading quote
	const loadingQuote = useMemo(() => getRandomLoadingQuote(), []);

	// API calls - disable refetching since this is a one-time redirect
	const {
		data: redirectInfo,
		isLoading,
		error,
		isError,
	} = useGetRedirectInfoQuery(code!, {
		skip: !code,
		refetchOnMountOrArgChange: false,
		refetchOnFocus: false,
		refetchOnReconnect: false,
	});

	const [verifyPassword, { isLoading: isVerifying, error: verifyError }] =
		useVerifyPasswordMutation();

	// Password form
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
	} = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordSchema),
	});

	// Handle redirect flow
	useEffect(() => {
		if (!redirectInfo) return;

		if (redirectInfo.requiresPassword) {
			setPasswordModalOpen(true);
			return;
		}

		// Check for warnings
		if (redirectInfo.warning) {
			setPendingUrl(redirectInfo.originalUrl!);
			setPendingWarning(redirectInfo.warning);
			setWarningModalOpen(true);
			return;
		}

		// Safe to redirect
		if (redirectInfo.originalUrl) {
			window.location.href = redirectInfo.originalUrl;
		}
	}, [redirectInfo]);

	// Handle password submit
	const onPasswordSubmit = handleSubmit(async (values) => {
		if (!code) return;

		try {
			const result = await verifyPassword({
				code,
				password: values.password,
			}).unwrap();

			if (result.success && result.originalUrl) {
				setPasswordModalOpen(false);
				resetForm();

				// Check for warnings after password verification
				if (result.warning) {
					setPendingUrl(result.originalUrl);
					setPendingWarning(result.warning);
					setWarningModalOpen(true);
				} else {
					window.location.href = result.originalUrl;
				}
			}
		} catch (_) {
			// Error handled by verifyError state
		}
	});

	// Handle warning proceed
	const handleProceed = () => {
		if (pendingUrl) {
			window.location.href = pendingUrl;
		}
	};

	// Handle warning cancel - redirect to home
	const handleCancel = () => {
		setWarningModalOpen(false);
		setPendingUrl(null);
		setPendingWarning(null);
		navigate("/", { replace: true });
	};

	// Handle password cancel - redirect to home
	const handlePasswordCancel = () => {
		setPasswordModalOpen(false);
		resetForm();
		navigate("/", { replace: true });
	};

	// Loading state
	if (isLoading) {
		return (
			<Center h={PAGE_HEIGHT}>
				<Stack align="center" gap="lg">
					<Loader size="xl" type="dots" />
					<Stack align="center" gap="xs">
						<Text size="xl">{loadingQuote.emoji}</Text>
						<Text size="lg" fw={500}>
							{loadingQuote.text}
						</Text>
						<Text size="sm" c="dimmed">
							Redirecting you shortly...
						</Text>
					</Stack>
				</Stack>
			</Center>
		);
	}

	// Error state
	if (isError) {
		return (
			<Center h={PAGE_HEIGHT}>
				<Paper withBorder radius="lg" p="xl" maw={450} w="100%">
					<Stack align="center" gap="lg">
						<ThemeIcon size={60} radius="xl" color="red" variant="light">
							<IconX size={30} />
						</ThemeIcon>
						<Stack align="center" gap="xs">
							<Title order={2}>Link Unavailable</Title>
							<Text c="dimmed" ta="center">
								{getErrorMessage(error)}
							</Text>
						</Stack>
						<Button component={Link} to="/" variant="light">
							Go to Homepage
						</Button>
					</Stack>
				</Paper>
			</Center>
		);
	}

	// Redirecting state (after successful fetch, before actual redirect)
	return (
		<>
			<Center h={PAGE_HEIGHT}>
				<Stack align="center" gap="lg">
					<Loader size="xl" type="dots" />
					<Stack align="center" gap="xs">
						<Text size="xl">🚀</Text>
						<Text size="lg" fw={500}>
							Taking you there...
						</Text>
					</Stack>
				</Stack>
			</Center>

			{/* Password Modal */}
			<Modal
				opened={passwordModalOpen}
				onClose={() => {}} // Prevent closing without action
				withCloseButton={false}
				centered
				size="sm"
				radius="lg"
			>
				<Stack gap="lg">
					<Stack align="center" gap="sm">
						<ThemeIcon size={50} radius="xl" color="blue" variant="light">
							<IconLock size={26} />
						</ThemeIcon>
						<Title order={3} ta="center">
							Password Protected
						</Title>
						<Text size="sm" c="dimmed" ta="center">
							This link requires a password to access.
						</Text>
					</Stack>

					<form onSubmit={onPasswordSubmit}>
						<Stack gap="md">
							<PasswordInput
								label="Password"
								placeholder="Enter link password"
								size="md"
								autoFocus
								error={errors.password?.message}
								{...register("password")}
							/>

							{verifyError && (
								<Alert color="red" variant="light">
									{getErrorMessage(verifyError)}
								</Alert>
							)}

							<Group justify="space-between">
								<Button
									variant="subtle"
									color="gray"
									size="md"
									onClick={handlePasswordCancel}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									size="md"
									loading={isVerifying}
									rightSection={<IconExternalLink size={16} />}
								>
									Access Link
								</Button>
							</Group>
						</Stack>
					</form>
				</Stack>
			</Modal>

			{/* Security Warning Modal */}
			<Modal
				opened={warningModalOpen}
				onClose={handleCancel}
				centered
				size="md"
				radius="lg"
				title={
					<Group gap="sm">
						{pendingWarning && (
							<>
								<ThemeIcon
									size={28}
									radius="xl"
									color={SECURITY_CONFIG[pendingWarning.status].color}
									variant="light"
								>
									{(() => {
										const IconComponent =
											SECURITY_CONFIG[pendingWarning.status].icon;
										return <IconComponent size={16} />;
									})()}
								</ThemeIcon>
								<Text fw={600}>
									{SECURITY_CONFIG[pendingWarning.status].title}
								</Text>
							</>
						)}
					</Group>
				}
			>
				{pendingWarning && (
					<Stack gap="lg">
						<Alert
							color={SECURITY_CONFIG[pendingWarning.status].color}
							variant="light"
						>
							<Text size="sm">
								{pendingWarning.status === "MALICIOUS" &&
									"This link has been flagged as potentially dangerous. Proceeding may expose you to malware, phishing, or other threats."}
								{pendingWarning.status === "SUSPICIOUS" &&
									"This link has been flagged as suspicious. Exercise caution before proceeding."}
								{pendingWarning.status === "ADULT_CONTENT" &&
									"This link may contain adult or mature content."}
							</Text>
						</Alert>

						{pendingWarning.threats && pendingWarning.threats.length > 0 && (
							<Box>
								<Text size="sm" fw={500} mb="xs">
									Detected Threats:
								</Text>
								<List size="sm" spacing="xs">
									{pendingWarning.threats.map((threat) => (
										<List.Item key={threat}>
											<Text size="sm" c="red">
												{threat}
											</Text>
										</List.Item>
									))}
								</List>
							</Box>
						)}

						{pendingWarning.reasoning && (
							<Box>
								<Text size="sm" fw={500} mb="xs">
									Analysis:
								</Text>
								<Text size="sm" c="dimmed">
									{pendingWarning.reasoning}
								</Text>
							</Box>
						)}

						{pendingWarning.recommendations && (
							<Box>
								<Text size="sm" fw={500} mb="xs">
									Recommendations:
								</Text>
								<Text size="sm" c="dimmed">
									{pendingWarning.recommendations}
								</Text>
							</Box>
						)}

						{pendingWarning.scanScore !== undefined &&
							pendingWarning.scanScore !== null && (
								<Group gap="xs">
									<Text size="sm" c="dimmed">
										Risk Score:
									</Text>
									<Tooltip
										label="Higher score = higher risk. 0 is safest, 100 is most dangerous."
										position="top"
										withArrow
									>
										<Badge
											color={SECURITY_CONFIG[pendingWarning.status].color}
											variant="light"
											style={{ cursor: "help" }}
										>
											{pendingWarning.scanScore <= 1
												? Math.round(pendingWarning.scanScore * 100)
												: Math.round(pendingWarning.scanScore)}
											/100
										</Badge>
									</Tooltip>
								</Group>
							)}

						<Group justify="space-between" mt="md">
							<Button variant="light" color="gray" onClick={handleCancel}>
								Go Back
							</Button>
							<Button
								color={
									pendingWarning.status === "MALICIOUS" ? "red" : "yellow"
								}
								onClick={handleProceed}
								rightSection={<IconExternalLink size={16} />}
							>
								Proceed Anyway
							</Button>
						</Group>
					</Stack>
				)}
			</Modal>
		</>
	);
}
