import { zodResolver } from "@hookform/resolvers/zod";
import {
	Alert,
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
	IconAlertTriangle,
	IconCalendar,
	IconCrown,
	IconLink,
	IconLock,
	IconSettings,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useUpdateLinkMutation } from "@/app/api/links.api";
import { TagPicker } from "@/components/tags";
import { useAuth } from "@/hooks";
import { type EditLinkFormValues, editLinkSchema } from "@/schemas/link.schema";
import type { Link } from "@/types";
import { getErrorMessage } from "@/types";

export interface EditLinkModalProps {
	link: Link | null;
	opened: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function EditLinkModal({
	link,
	opened,
	onClose,
	onSuccess,
}: EditLinkModalProps) {
	const { isPro } = useAuth();
	const [updateLink, { isLoading }] = useUpdateLinkMutation();

	const {
		register,
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors, dirtyFields },
	} = useForm<EditLinkFormValues>({
		resolver: zodResolver(editLinkSchema),
		defaultValues: {
			title: "",
			description: "",
			customAlias: "",
			password: "",
			removePassword: false,
			scheduledAt: null,
			expiresAt: null,
			clickLimit: null,
			isOneTime: false,
			notes: "",
			tagIds: [],
		},
	});

	const removePassword = watch("removePassword");
	const customAlias = watch("customAlias");
	const isAliasChanging =
		customAlias !== undefined &&
		customAlias !== "" &&
		customAlias !== (link?.customAlias ?? "");

	useEffect(() => {
		if (link && opened) {
			reset({
				title: link.title ?? "",
				description: link.description ?? "",
				customAlias: link.customAlias ?? "",
				password: "",
				removePassword: false,
				scheduledAt: link.scheduledAt ? new Date(link.scheduledAt) : null,
				expiresAt: link.expiresAt ? new Date(link.expiresAt) : null,
				clickLimit: link.clickLimit ?? null,
				isOneTime: link.isOneTime ?? false,
				notes: link.notes ?? "",
				tagIds: link.tags?.map((tag) => tag.id) ?? [],
			});
		}
	}, [link, opened, reset]);

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = handleSubmit(async (values) => {
		if (!link) return;

		try {
			const payload: Record<string, unknown> = {};

			if (dirtyFields.title) payload.title = values.title || null;
			if (dirtyFields.description)
				payload.description = values.description || null;
			if (dirtyFields.customAlias && isPro)
				payload.customAlias = values.customAlias || null;
			if (dirtyFields.notes) payload.notes = values.notes || null;
			if (dirtyFields.clickLimit)
				payload.clickLimit = values.clickLimit ?? null;
			if (dirtyFields.isOneTime) payload.isOneTime = values.isOneTime;

			if (values.removePassword) {
				payload.password = null;
			} else if (dirtyFields.password && values.password) {
				payload.password = values.password;
			}

			if (dirtyFields.scheduledAt) {
				payload.scheduledAt = values.scheduledAt?.toISOString() ?? null;
			}
			if (dirtyFields.expiresAt) {
				payload.expiresAt = values.expiresAt?.toISOString() ?? null;
			}

			if (dirtyFields.tagIds) {
				payload.tagIds = values.tagIds;
			}

			if (Object.keys(payload).length === 0) {
				notifications.show({
					title: "No changes",
					message: "No fields were modified",
					color: "yellow",
				});
				return;
			}

			await updateLink({ id: link.id, data: payload }).unwrap();

			notifications.show({
				title: "Link updated",
				message: "Your changes have been saved",
				color: "green",
			});

			handleClose();
			onSuccess?.();
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	});

	if (!link) return null;

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title="Edit Link"
			size="lg"
			radius="md"
		>
			<form onSubmit={onSubmit}>
				<Stack gap="md" mb="md">
					<TextInput
						label="Destination URL"
						value={link.originalUrl}
						disabled
						styles={{ input: { cursor: "not-allowed" } }}
					/>
					<TextInput
						label="Short Code"
						value={link.shortCode}
						disabled
						styles={{ input: { cursor: "not-allowed" } }}
					/>
				</Stack>

				{isAliasChanging && link.qrCodeUrl && (
					<Alert icon={<IconAlertTriangle size={16} />} color="yellow" mb="md">
						Changing the custom alias will invalidate the existing QR code. You
						will need to generate a new one.
					</Alert>
				)}

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

					<Tabs.Panel value="basic">
						<Stack gap="md">
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
											: "Upgrade to PRO to change custom aliases"
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

					<Tabs.Panel value="security">
						<Stack gap="md">
							{link.hasPassword && (
								<Checkbox
									label="Remove password protection"
									description="Uncheck to keep or update the password"
									checked={removePassword}
									onChange={(e) => {
										setValue("removePassword", e.currentTarget.checked);
										if (e.currentTarget.checked) {
											setValue("password", "");
										}
									}}
								/>
							)}

							{!removePassword && (
								<PasswordInput
									label={
										link.hasPassword ? "New Password" : "Password Protection"
									}
									placeholder={
										link.hasPassword
											? "Enter new password (leave blank to keep current)"
											: "Enter password (optional)"
									}
									description={
										link.hasPassword
											? "Leave blank to keep the current password"
											: "Require a password to access this link"
									}
									error={errors.password?.message}
									{...register("password")}
								/>
							)}

							<Text size="sm" c="dimmed">
								Password-protected links will show a password form before
								redirecting.
							</Text>
						</Stack>
					</Tabs.Panel>

					<Tabs.Panel value="schedule">
						<Stack gap="md">
							<Controller
								name="scheduledAt"
								control={control}
								render={({ field, fieldState }) => (
									<DateTimePicker
										label="Start Date"
										placeholder="Link becomes active at..."
										description="Leave empty to activate immediately"
										clearable
										value={field.value}
										onChange={(val) =>
											field.onChange(val ? new Date(val) : null)
										}
										minDate={new Date()}
										error={fieldState.error?.message}
									/>
								)}
							/>

							<Controller
								name="expiresAt"
								control={control}
								render={({ field, fieldState }) => (
									<DateTimePicker
										label="Expiration Date"
										placeholder="Link expires at..."
										description="Leave empty for no expiration"
										clearable
										value={field.value}
										onChange={(val) =>
											field.onChange(val ? new Date(val) : null)
										}
										minDate={new Date()}
										error={fieldState.error?.message}
									/>
								)}
							/>
						</Stack>
					</Tabs.Panel>

					<Tabs.Panel value="advanced">
						<Stack gap="md">
							<Controller
								name="clickLimit"
								control={control}
								render={({ field, fieldState }) => (
									<NumberInput
										label="Click Limit"
										placeholder="Unlimited"
										description="Link will be disabled after this many clicks"
										min={1}
										value={field.value ?? ""}
										onChange={(val) =>
											field.onChange(val === "" ? null : Number(val))
										}
										error={fieldState.error?.message}
									/>
								)}
							/>

							<Controller
								name="isOneTime"
								control={control}
								render={({ field, fieldState }) => (
									<Checkbox
										label="One-time link"
										description="Link will be deleted after first use"
										checked={field.value}
										onChange={(e) => field.onChange(e.currentTarget.checked)}
										error={fieldState.error?.message}
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

							<Controller
								name="tagIds"
								control={control}
								render={({ field, fieldState }) => (
									<TagPicker
										value={field.value || []}
										onChange={field.onChange}
										label="Tags"
										description="Organize your links with tags"
										error={fieldState.error?.message}
									/>
								)}
							/>
						</Stack>
					</Tabs.Panel>
				</Tabs>

				<Group justify="flex-end" mt="xl">
					<Button variant="light" onClick={handleClose}>
						Cancel
					</Button>
					<Button type="submit" loading={isLoading}>
						Save Changes
					</Button>
				</Group>
			</form>
		</Modal>
	);
}
