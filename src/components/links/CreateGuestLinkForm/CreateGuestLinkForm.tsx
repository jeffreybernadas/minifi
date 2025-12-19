import { zodResolver } from "@hookform/resolvers/zod";
import {
	ActionIcon,
	Alert,
	Anchor,
	Box,
	Button,
	Group,
	Paper,
	Stack,
	Text,
	TextInput,
	Transition,
} from "@mantine/core";
import {
	IconArrowRight,
	IconCheck,
	IconExternalLink,
	IconInfoCircle,
	IconRefresh,
} from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateGuestLinkMutation } from "@/app/api/links.api";
import { CopyButton } from "@/components/ui";
import { keycloak } from "@/features/auth";
import {
	type GuestLinkFormValues,
	guestLinkSchema,
} from "@/schemas/link.schema";
import { getErrorMessage } from "@/types";

/**
 * Guest link creation form for landing page.
 * Shows inline success state with copy button and option to create another.
 */
export function CreateGuestLinkForm() {
	const [createGuestLink, { isLoading, error }] = useCreateGuestLinkMutation();
	const [shortUrl, setShortUrl] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<GuestLinkFormValues>({
		resolver: zodResolver(guestLinkSchema),
		defaultValues: { originalUrl: "" },
	});

	const onSubmit = handleSubmit(async (values) => {
		try {
			const link = await createGuestLink(values).unwrap();
			setShortUrl(link.shortUrl ?? null);
		} catch (_) {
			setShortUrl(null);
		}
	});

	const handleReset = () => {
		setShortUrl(null);
		reset({ originalUrl: "" });
	};

	// Success state - show the shortened URL
	if (shortUrl) {
		return (
			<Paper withBorder radius="lg" p="xl" shadow="sm">
				<Stack gap="md">
					<Group gap="xs">
						<Box
							style={{
								width: 32,
								height: 32,
								borderRadius: "50%",
								backgroundColor: "var(--mantine-color-teal-light)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<IconCheck size={18} color="var(--mantine-color-teal-6)" />
						</Box>
						<Text fw={600}>Link shortened!</Text>
					</Group>

					<Paper
						withBorder
						p="md"
						radius="md"
						bg="var(--mantine-color-dark-light)"
					>
						<Group justify="space-between" align="center" wrap="nowrap">
							<Box style={{ overflow: "hidden" }}>
								<Text size="xs" c="dimmed" mb={2}>
									Your short link
								</Text>
								<Group gap="xs" wrap="nowrap">
									<Text
										fw={600}
										size="lg"
										style={{
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									>
										{shortUrl}
									</Text>
									<ActionIcon
										component="a"
										href={shortUrl}
										target="_blank"
										rel="noopener noreferrer"
										variant="subtle"
										color="blue"
										size="sm"
									>
										<IconExternalLink size={16} />
									</ActionIcon>
								</Group>
							</Box>
							<CopyButton value={shortUrl} size="md">
								Copy
							</CopyButton>
						</Group>
					</Paper>

					<Group justify="space-between" align="center">
						<Text size="sm" c="dimmed">
							Link expires in 3 days.{" "}
							<Anchor onClick={() => keycloak.login()} fw={500}>
								Sign up
							</Anchor>{" "}
							for longer retention.
						</Text>
						<Button
							variant="light"
							size="sm"
							leftSection={<IconRefresh size={16} />}
							onClick={handleReset}
						>
							Shorten another
						</Button>
					</Group>
				</Stack>
			</Paper>
		);
	}

	// Form state - input for URL
	return (
		<Paper
			withBorder
			radius="lg"
			p="xl"
			shadow="sm"
			component="form"
			onSubmit={onSubmit}
		>
			<Stack gap="md">
				<TextInput
					placeholder="Paste your long URL here..."
					size="lg"
					autoFocus
					error={errors.originalUrl?.message}
					rightSection={
						<Button
							type="submit"
							size="sm"
							loading={isLoading}
							mr={4}
							rightSection={<IconArrowRight size={16} />}
						>
							Shorten
						</Button>
					}
					rightSectionWidth={130}
					styles={{
						input: {
							paddingRight: 140,
						},
					}}
					{...register("originalUrl")}
				/>

				<Transition mounted={!!error} transition="fade" duration={200}>
					{(styles) => (
						<Alert
							style={styles}
							color="red"
							icon={<IconInfoCircle size={16} />}
							title="Could not create link"
						>
							{getErrorMessage(error)}
						</Alert>
					)}
				</Transition>

				<Text size="sm" c="dimmed" ta="center">
					No account needed. 5 links/day, expires in 3 days.{" "}
					<Anchor onClick={() => keycloak.login()} fw={500}>
						Sign in
					</Anchor>{" "}
					for unlimited features.
				</Text>
			</Stack>
		</Paper>
	);
}
