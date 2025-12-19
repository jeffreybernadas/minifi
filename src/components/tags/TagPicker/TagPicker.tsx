import { MultiSelect, Button, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useGetTagsQuery } from "@/app/api/tags.api";
import { CreateTagModal } from "../CreateTagModal/CreateTagModal";
import { TagBadge } from "@/components/ui";
import type { Tag } from "@/types";

export interface TagPickerProps {
	/** Selected tag IDs */
	value: string[];
	/** Change handler for selected tag IDs */
	onChange: (value: string[]) => void;
	/** Label for the input */
	label?: string;
	/** Placeholder text */
	placeholder?: string;
	/** Error message */
	error?: string;
	/** Whether the input is disabled */
	disabled?: boolean;
	/** Description text */
	description?: string;
}

/**
 * Tag picker component with MultiSelect and create tag functionality
 * Uses Mantine MultiSelect with custom tag rendering
 */
export function TagPicker({
	value,
	onChange,
	label = "Tags",
	placeholder = "Select tags",
	error,
	disabled,
	description,
}: Readonly<TagPickerProps>) {
	const { data: tags = [], isLoading } = useGetTagsQuery();
	const [tempTags, setTempTags] = useState<Tag[]>([]);
	const [
		createModalOpened,
		{ open: openCreateModal, close: closeCreateModal },
	] = useDisclosure(false);

	// Combine API tags with locally created tags (optimistic update)
	const allTags = useMemo(() => {
		const tagMap = new Map(tags.map((t) => [t.id, t]));
		tempTags.forEach((t) => {
			tagMap.set(t.id, t);
		});
		return Array.from(tagMap.values());
	}, [tags, tempTags]);

	// Convert tags to MultiSelect data format
	const selectData = allTags.map((tag) => ({
		value: tag.id,
		label: tag.name,
		tag, // Store tag object for rendering
	}));

	// Find selected tags for rendering
	const selectedTags = allTags.filter((tag) => value.includes(tag.id));

	return (
		<>
			<Stack gap="xs">
				<MultiSelect
					label={label}
					placeholder={placeholder}
					description={description}
					error={error}
					disabled={disabled || isLoading}
					data={selectData}
					value={value}
					onChange={onChange}
					searchable
					clearable
					hidePickedOptions
					maxDropdownHeight={200}
					renderOption={({ option }) => {
						const tagData = (option as unknown as { tag: Tag }).tag;
						return (
							<Group gap="xs">
								<TagBadge tag={tagData} size="sm" />
							</Group>
						);
					}}
				/>

				{/* Display selected tags as badges */}
				{selectedTags.length > 0 && (
					<Group gap="xs">
						{selectedTags.map((tag) => (
							<TagBadge
								key={tag.id}
								tag={tag}
								size="sm"
								onRemove={() => {
									onChange(value.filter((id) => id !== tag.id));
								}}
							/>
						))}
					</Group>
				)}

				{/* Create new tag button */}
				<Button
					variant="light"
					size="xs"
					leftSection={<IconPlus size={14} />}
					onClick={openCreateModal}
					disabled={disabled}
					style={{ alignSelf: "flex-start" }}
				>
					Create New Tag
				</Button>
			</Stack>

			{/* Create Tag Modal */}
			<CreateTagModal
				opened={createModalOpened}
				onClose={closeCreateModal}
				onSuccess={(newTag) => {
					setTempTags((prev) => [...prev, newTag]);
					onChange([...value, newTag.id]);
				}}
			/>
		</>
	);
}
