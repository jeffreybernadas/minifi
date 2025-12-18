import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Checkbox,
	Group,
	Modal,
	NumberInput,
	PasswordInput,
	Stack,
	Tabs,
	Text,
	Textarea,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
	IconCalendar,
	IconCrown,
	IconLink,
	IconLock,
	IconSettings,
} from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateLinkMutation } from "@/app/api/links.api";
import { useAuth } from "@/hooks";
import { getErrorMessage } from "@/types";

// Form schema
const createLinkSchema = z.object({
	originalUrl: z.string().url("Please enter a valid URL"),
	title: z.string().max(100, "Title must be 100 characters or less").optional(),
	description: z
		.string()
		.max(500, "Description must be 500 characters or less")
		.optional(),
	customAlias: z
		.string()
		.min(3, "Alias must be at least 3 characters")
		.max(50, "Alias must be 50 characters or less")
		.regex(
			/^[a-zA-Z0-9_-]+$/,
			"Alias can only contain letters, numbers, hyphens and underscores",
		)
		.optional()
		.or(z.literal("")),
	password: z.string().optional().or(z.literal("")),
	scheduledAt: z.date().nullable().optional(),
	expiresAt: z.date().nullable().optional(),
	clickLimit: z.number().min(1).nullable().optional(),
	isOneTime: z.boolean().optional(),
	notes: z
		.string()
		.max(1000, "Notes must be 1000 characters or less")
		.optional(),
});

type CreateLinkFormValues = z.infer<typeof createLinkSchema>;

export interface CreateLinkModalProps {
	opened: boolean;
	onClose: () => void;
}

/**
 * Modal for creating new shortened links
 */
export function CreateLinkModal({ opened, onClose }: CreateLinkModalProps) {
	const { isPro } = useAuth();
	const [createLink, { isLoading }] = useCreateLinkMutation();

	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateLinkFormValues>({
		resolver: zodResolver(createLinkSchema),
		defaultValues: {
			originalUrl: "",
			title: "",
			description: "",
			customAlias: "",
			password: "",
			scheduledAt: null,
			expiresAt: null,
			clickLimit: null,
			isOneTime: false,
			notes: "",
		},
	});

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = handleSubmit(async (values) => {
		try {
			// Clean up empty strings to undefined
			const payload = {
				originalUrl: values.originalUrl,
				title: values.title || undefined,
				description: values.description || undefined,
				customAlias: values.customAlias || undefined,
				password: values.password || undefined,
				scheduledAt: values.scheduledAt?.toISOString(),
				expiresAt: values.expiresAt?.toISOString(),
				clickLimit: values.clickLimit ?? undefined,
				isOneTime: values.isOneTime || undefined,
				notes: values.notes || undefined,
			};

			await createLink(payload).unwrap();

			notifications.show({
				title: "Link created",
				message: "Your short link is ready to use",
				color: "green",
			});

			handleClose();
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	});

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title="Create Short Link"
			size="lg"
			radius="md"
		>
			<form onSubmit={onSubmit}>
				<Tabs defaultValue="basic">
					<Tabs.List mb="md">
						<Tabs.Tab value="basic" leftSection={<IconLink size={16} />}>
							Basic
						</Tabs.Tab>
						<Tabs.Tab value="security" leftSection={<IconLock size={16} />}>
							Security
						</Tabs.Tab>
						<Tabs.Tab value="schedule" leftSection={<IconCalendar size={16} />}>
							Schedule
						</Tabs.Tab>
						<Tabs.Tab value="advanced" leftSection={<IconSettings size={16} />}>
							Advanced
						</Tabs.Tab>
					</Tabs.List>

					{/* Basic Tab */}
					<Tabs.Panel value="basic">
						<Stack gap="md">
							<TextInput
								label="Destination URL"
								placeholder="https://example.com/very-long-url"
								required
								error={errors.originalUrl?.message}
								{...register("originalUrl")}
							/>

							<TextInput
								label="Title"
								placeholder="My awesome link"
								description="Optional title for easy identification"
								error={errors.title?.message}
								{...register("title")}
							/>

							<Textarea
								label="Description"
								placeholder="Brief description of the link"
								description="Optional description"
								rows={2}
								error={errors.description?.message}
								{...register("description")}
							/>

							<Tooltip
								label="Upgrade to PRO to use custom aliases"
								disabled={isPro}
								position="top-start"
								withArrow
							>
								<TextInput
									label={
										<Group gap={4}>
											<span>Custom Alias</span>
											{!isPro && (
												<IconCrown
													size={14}
													color="var(--mantine-color-violet-5)"
												/>
											)}
										</Group>
									}
									placeholder={isPro ? "my-brand" : "PRO feature"}
									description={
										isPro
											? "Create a memorable custom URL"
											: "Upgrade to PRO to create custom aliases"
									}
									disabled={!isPro}
									error={errors.customAlias?.message}
									{...register("customAlias")}
									styles={
										!isPro ? { input: { cursor: "not-allowed" } } : undefined
									}
								/>
							</Tooltip>
						</Stack>
					</Tabs.Panel>

					{/* Security Tab */}
					<Tabs.Panel value="security">
						<Stack gap="md">
							<PasswordInput
								label="Password Protection"
								placeholder="Enter password (optional)"
								description="Require a password to access this link"
								error={errors.password?.message}
								{...register("password")}
							/>

							<Text size="sm" c="dimmed">
								Password-protected links will show a password form before
								redirecting.
							</Text>
						</Stack>
					</Tabs.Panel>

					{/* Schedule Tab */}
					<Tabs.Panel value="schedule">
						<Stack gap="md">
							<Controller
								name="scheduledAt"
								control={control}
								render={({ field }) => (
									<DateTimePicker
										label="Start Date"
										placeholder="Link becomes active at..."
										description="Leave empty to activate immediately"
										clearable
										value={field.value}
										onChange={field.onChange}
										minDate={new Date()}
									/>
								)}
							/>

							<Controller
								name="expiresAt"
								control={control}
								render={({ field }) => (
									<DateTimePicker
										label="Expiration Date"
										placeholder="Link expires at..."
										description="Leave empty for no expiration"
										clearable
										value={field.value}
										onChange={field.onChange}
										minDate={new Date()}
									/>
								)}
							/>
						</Stack>
					</Tabs.Panel>

					{/* Advanced Tab */}
					<Tabs.Panel value="advanced">
						<Stack gap="md">
							<Controller
								name="clickLimit"
								control={control}
								render={({ field }) => (
									<NumberInput
										label="Click Limit"
										placeholder="Unlimited"
										description="Link will be disabled after this many clicks"
										min={1}
										value={field.value ?? ""}
										onChange={(val) =>
											field.onChange(val === "" ? null : Number(val))
										}
									/>
								)}
							/>

							<Controller
								name="isOneTime"
								control={control}
								render={({ field }) => (
									<Checkbox
										label="One-time link"
										description="Link will be deleted after first use"
										checked={field.value}
										onChange={(e) => field.onChange(e.currentTarget.checked)}
									/>
								)}
							/>

							<Textarea
								label="Notes"
								placeholder="Private notes about this link"
								description="Only visible to you"
								rows={3}
								error={errors.notes?.message}
								{...register("notes")}
							/>
						</Stack>
					</Tabs.Panel>
				</Tabs>

				<Group justify="flex-end" mt="xl">
					<Button variant="light" onClick={handleClose}>
						Cancel
					</Button>
					<Button type="submit" loading={isLoading}>
						Create Link
					</Button>
				</Group>
			</form>
		</Modal>
	);
}
