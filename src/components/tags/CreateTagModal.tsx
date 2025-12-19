import { zodResolver } from "@hookform/resolvers/zod";
import {
	Modal,
	TextInput,
	ColorInput,
	Button,
	Stack,
	Group,
	Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Controller, useForm } from "react-hook-form";
import { useCreateTagMutation } from "@/app/api/tags.api";
import { tagSchema, type TagFormData } from "@/schemas/tag.schema";
import { TagBadge } from "@/components/ui";
import { getErrorMessage } from "@/types";
import type { Tag } from "@/types";

export interface CreateTagModalProps {
	/** Whether the modal is open */
	opened: boolean;
	/** Close handler */
	onClose: () => void;
	/** Optional callback after successful creation */
	onSuccess?: (tag: Tag) => void;
}

/**
 * Modal for creating a new tag
 * Uses React Hook Form with Mantine ColorInput for color selection
 */
export function CreateTagModal({
	opened,
	onClose,
	onSuccess,
}: Readonly<CreateTagModalProps>) {
	const [createTag, { isLoading }] = useCreateTagMutation();

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

	const handleClose = () => {
		reset();
		onClose();
	};

	const onSubmit = handleSubmit(async (values) => {
		try {
			const result = await createTag(values).unwrap();
			notifications.show({
				title: "Tag Created",
				message: `Tag "${result.name}" has been created successfully.`,
				color: "green",
			});
			handleClose();
			onSuccess?.(result);
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
		id: "preview",
		userId: "preview",
		name: watchedName || "Preview",
		backgroundColor: watchedBgColor || "#3B82F6",
		textColor: watchedTextColor || "#FFFFFF",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title="Create New Tag"
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
							Create Tag
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
