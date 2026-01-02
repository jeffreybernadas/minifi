import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	ColorInput,
	Group,
	Modal,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useUpdateTagMutation } from "@/app/api/tags.api";
import { TagBadge } from "@/components/ui";
import { type TagFormData, tagSchema } from "@/schemas/tag.schema";
import type { Tag } from "@/types";
import { getErrorMessage } from "@/types";

export interface EditTagModalProps {
	/** Tag to edit */
	tag: Tag | null;
	/** Whether the modal is open */
	opened: boolean;
	/** Close handler */
	onClose: () => void;
	/** Optional callback after successful update */
	onSuccess?: () => void;
}

/**
 * Modal for editing an existing tag
 * Uses React Hook Form with Mantine ColorInput for color selection
 */
export function EditTagModal({
	tag,
	opened,
	onClose,
	onSuccess,
}: Readonly<EditTagModalProps>) {
	const [updateTag, { isLoading }] = useUpdateTagMutation();

	const {
		register,
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<TagFormData>({
		resolver: zodResolver(tagSchema),
		defaultValues: {
			name: "",
			backgroundColor: "#3B82F6",
			textColor: "#FFFFFF",
		},
	});

	// Reset form when tag changes
	useEffect(() => {
		if (tag && opened) {
			reset({
				name: tag.name,
				backgroundColor: tag.backgroundColor,
				textColor: tag.textColor,
			});
		}
	}, [tag, opened, reset]);

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = handleSubmit(async (values) => {
		if (!tag) return;

		try {
			await updateTag({ id: tag.id, data: values }).unwrap();
			notifications.show({
				title: "Tag Updated",
				message: `Tag "${values.name}" has been updated successfully.`,
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

	// Mantine theme color presets for quick selection
	const colorPresets = [
		"#3B82F6", // Blue
		"#10B981", // Green
		"#F59E0B", // Amber
		"#EF4444", // Red
		"#8B5CF6", // Purple
		"#EC4899", // Pink
		"#06B6D4", // Cyan
		"#84CC16", // Lime
		"#F97316", // Orange
		"#6366F1", // Indigo
	];

	// Watch form values for live preview
	const watchedName = watch("name");
	const watchedBgColor = watch("backgroundColor");
	const watchedTextColor = watch("textColor");

	// Preview tag with current form values
	const previewTag: Tag = {
		id: tag?.id ?? "preview",
		userId: tag?.userId ?? "preview",
		name: watchedName || "Preview",
		backgroundColor: watchedBgColor || "#3B82F6",
		textColor: watchedTextColor || "#FFFFFF",
		createdAt: tag?.createdAt ?? new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	if (!tag) return null;

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title="Edit Tag"
			size="md"
			radius="md"
		>
			<form onSubmit={onSubmit}>
				<Stack gap="md">
					<TextInput
						label="Tag Name"
						placeholder="e.g., Work, Personal, Important"
						required
						error={errors.name?.message}
						{...register("name")}
						disabled={isLoading}
					/>

					<Controller
						name="backgroundColor"
						control={control}
						render={({ field, fieldState }) => (
							<ColorInput
								label="Background Color"
								placeholder="Pick a color"
								description="Defaults to blue if not selected"
								swatches={colorPresets}
								value={field.value}
								onChange={field.onChange}
								error={fieldState.error?.message}
								disabled={isLoading}
							/>
						)}
					/>

					<Controller
						name="textColor"
						control={control}
						render={({ field, fieldState }) => (
							<ColorInput
								label="Text Color"
								placeholder="Pick a color"
								description="Defaults to white if not selected"
								swatches={["#FFFFFF", "#000000", "#F3F4F6", "#1F2937"]}
								value={field.value}
								onChange={field.onChange}
								error={fieldState.error?.message}
								disabled={isLoading}
							/>
						)}
					/>

					{/* Tag Preview */}
					<div>
						<Text size="sm" fw={500} mb="xs">
							Preview
						</Text>
						<TagBadge tag={previewTag} size="md" />
					</div>

					<Group justify="flex-end" mt="md">
						<Button variant="light" onClick={handleClose} disabled={isLoading}>
							Cancel
						</Button>
						<Button type="submit" loading={isLoading}>
							Update Tag
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
