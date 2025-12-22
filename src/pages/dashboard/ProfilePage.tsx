import { zodResolver } from "@hookform/resolvers/zod";
import {
	Anchor,
	Avatar,
	Button,
	FileButton,
	Group,
	LoadingOverlay,
	Paper,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconExternalLink, IconUpload } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useUploadFileMutation } from "@/app/api/file.api";
import {
	useGetUserProfileQuery,
	useUpdateUserPreferencesMutation,
} from "@/app/api/user.api";
import { UserBadges } from "@/components/ui";
import {
	VITE_KEYCLOAK_REALM,
	VITE_KEYCLOAK_URL,
} from "@/constants/env.constant";
import { type ProfileFormData, profileSchema } from "@/schemas/profile.schema";
import { getErrorMessage } from "@/types/api.types";
import { useAuth } from "@/hooks";

export default function ProfilePage() {
	const { isAdmin } = useAuth();
	const {
		data: profile,
		isLoading,
		error: fetchError,
	} = useGetUserProfileQuery();
	const [updatePreferences, { isLoading: isUpdating }] =
		useUpdateUserPreferencesMutation();
	const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

	// React Hook Form setup with reactive values
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		values: {
			phoneNumber: profile?.phoneNumber ?? "",
			address: profile?.address ?? "",
		},
	});

	// Avatar preview state
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	// Show notification on fetch error
	useEffect(() => {
		if (fetchError) {
			notifications.show({
				title: "Failed to Load Profile",
				message: getErrorMessage(fetchError),
				color: "red",
				autoClose: false,
			});
		}
	}, [fetchError]);

	// Create preview URL when file selected
	useEffect(() => {
		if (selectedFile) {
			const url = URL.createObjectURL(selectedFile);
			setPreviewUrl(url);
			return () => URL.revokeObjectURL(url);
		}
		setPreviewUrl(null);
	}, [selectedFile]);

	const handleFileSelect = (file: File | null) => {
		if (!file) return;

		// Validate file size (5MB)
		if (file.size > 5 * 1024 * 1024) {
			notifications.show({
				title: "File too large",
				message: "Avatar must be less than 5MB",
				color: "red",
			});
			return;
		}

		// Validate file type
		if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
			notifications.show({
				title: "Invalid file type",
				message: "Avatar must be an image (JPEG, PNG, GIF, or WebP)",
				color: "red",
			});
			return;
		}

		setSelectedFile(file);
	};

	const onSubmit = async (data: ProfileFormData) => {
		try {
			let avatarUrl = profile?.avatarUrl ?? undefined;

			// Step 1: Upload file if selected
			if (selectedFile) {
				const formData = new FormData();
				formData.append("file", selectedFile);

				const uploadResult = await uploadFile(formData).unwrap();
				avatarUrl = uploadResult.path;
			}

			// Step 2: Prepare update payload - only include fields with values
			const updatePayload: {
				phoneNumber?: string;
				address?: string;
				avatarUrl?: string;
			} = {};

			// Only include phoneNumber if it has a value
			if (data.phoneNumber && data.phoneNumber.trim() !== "") {
				updatePayload.phoneNumber = data.phoneNumber.trim();
			}

			// Only include address if it has a value
			if (data.address && data.address.trim() !== "") {
				updatePayload.address = data.address.trim();
			}

			// Only include avatarUrl if it has a value
			if (avatarUrl) {
				updatePayload.avatarUrl = avatarUrl;
			}

			// Update profile with only the fields that have values
			await updatePreferences(updatePayload).unwrap();

			// Clear selected file after successful save
			setSelectedFile(null);

			// Reset form to clear dirty state
			// The form will be re-populated with fresh data when profile refetches
			reset(
				{
					phoneNumber: data.phoneNumber,
					address: data.address,
				},
				{
					keepValues: true, // Keep the values but mark form as pristine
				},
			);

			notifications.show({
				title: "Success",
				message: "Profile updated successfully",
				color: "green",
			});
		} catch (error) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(error),
				color: "red",
			});
		}
	};

	const avatarSrc =
		previewUrl || profile?.avatarUrl || profile?.picture || undefined;
	const isSaving = isUploading || isUpdating;
	const hasChanges = isDirty || selectedFile !== null;

	return (
		<Stack gap="lg">
			<Group justify="space-between" align="center">
				<Title order={1}>Profile</Title>
				<UserBadges isAdmin={isAdmin} userType={profile?.userType} size="lg" />
			</Group>

			<Paper shadow="sm" p="xl" withBorder pos="relative">
				<LoadingOverlay visible={isLoading} />

				<form onSubmit={handleSubmit(onSubmit)}>
					<Stack gap="xl">
						{/* Avatar Section */}
						<Stack gap="md">
							<Text fw={500} size="lg">
								Profile Picture
							</Text>
							<Group>
								<Avatar src={avatarSrc} size={120} radius="md" />
								<Stack gap="xs">
									<FileButton onChange={handleFileSelect} accept="image/*">
										{(props) => (
											<Button
												{...props}
												leftSection={<IconUpload size={16} />}
												variant="light"
											>
												Upload Avatar
											</Button>
										)}
									</FileButton>
									<Text size="xs" c="dimmed">
										Max 5MB • JPEG, PNG, GIF, WebP
									</Text>
									{selectedFile && (
										<Text size="xs" c="blue">
											Selected: {selectedFile.name}
										</Text>
									)}
								</Stack>
							</Group>
						</Stack>

						{/* Keycloak Info (Read-Only) */}
						<Stack gap="md">
							<Text fw={500} size="lg">
								Account Information
							</Text>
							<Group grow>
								<TextInput
									label="Name"
									value={profile?.name || ""}
									readOnly
									disabled
									description="Managed by Keycloak"
								/>
								<TextInput
									label="Username"
									value={profile?.preferred_username || ""}
									readOnly
									disabled
									description="Managed by Keycloak"
								/>
							</Group>
							<TextInput
								label="Email"
								value={profile?.email || ""}
								readOnly
								disabled
								description="Managed by Keycloak"
							/>
							<Group>
								<Anchor
									href={`${VITE_KEYCLOAK_URL}/realms/${VITE_KEYCLOAK_REALM}/account`}
									target="_blank"
									size="sm"
								>
									Change Password <IconExternalLink size={14} />
								</Anchor>
								<Anchor
									href={`${VITE_KEYCLOAK_URL}/realms/${VITE_KEYCLOAK_REALM}/account`}
									target="_blank"
									size="sm"
								>
									Manage Account <IconExternalLink size={14} />
								</Anchor>
							</Group>
						</Stack>

						{/* Editable Fields */}
						<Stack gap="md">
							<Text fw={500} size="lg">
								Contact Information
							</Text>
							<Controller
								name="phoneNumber"
								control={control}
								render={({ field }) => (
									<TextInput
										{...field}
										label="Phone Number"
										placeholder="+639123456789"
										description="E.164 format (e.g., +639123456789)"
										error={errors.phoneNumber?.message}
									/>
								)}
							/>
							<Controller
								name="address"
								control={control}
								render={({ field }) => (
									<Textarea
										{...field}
										label="Address"
										placeholder="123 Main St, City, Country"
										rows={3}
										error={errors.address?.message}
									/>
								)}
							/>
						</Stack>

						{/* Actions */}
						<Group justify="flex-end">
							<Button type="submit" loading={isSaving} disabled={!hasChanges}>
								Save Changes
							</Button>
						</Group>
					</Stack>
				</form>
			</Paper>
		</Stack>
	);
}
