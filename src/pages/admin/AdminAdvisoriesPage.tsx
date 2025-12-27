import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Group,
	Modal,
	Paper,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	useArchiveAdvisoryMutation,
	useCreateAdvisoryMutation,
	useDeleteAdvisoryMutation,
	useGetAdvisoriesQuery,
	usePublishAdvisoryMutation,
	useUpdateAdvisoryMutation,
} from "@/app/api/advisory.api";
import { AdvisoryPreviewModal } from "@/components/advisory/AdvisoryModal/AdvisoryModal";
import { DataTable, RichTextEditor } from "@/components/ui";
import {
	type AdvisoryFormData,
	advisorySchema,
} from "@/schemas/advisory.schema";
import type { Advisory, AdvisoryStatus, AdvisoryType } from "@/types";
import { getErrorMessage } from "@/types";
import { getAdvisoryColumns } from "./columns/advisory.columns";
import {
	FORM_TYPE_OPTIONS,
	STATUS_OPTIONS,
	TYPE_OPTIONS,
} from "./constants/advisory.constants";

const DEFAULT_FORM_VALUES: AdvisoryFormData = {
	title: "",
	content: "",
	type: "INFO",
	expiresAt: null,
};

export default function AdminAdvisoriesPage() {
	// Filter state
	const [status, setStatus] = useState<string>("");
	const [type, setType] = useState<string>("");
	const [page, setPage] = useState(1);
	const limit = 10;

	// Modal state
	const [modalOpened, { open: openModal, close: closeModal }] =
		useDisclosure(false);
	const [editingAdvisory, setEditingAdvisory] = useState<Advisory | null>(null);

	// Preview modal
	const [previewOpened, { open: openPreview, close: closePreview }] =
		useDisclosure(false);
	const [previewAdvisory, setPreviewAdvisory] = useState<Advisory | null>(null);

	// Form with Zod validation
	const {
		register,
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<AdvisoryFormData>({
		resolver: zodResolver(advisorySchema),
		defaultValues: DEFAULT_FORM_VALUES,
	});

	// Query
	const { data, isLoading, isFetching } = useGetAdvisoriesQuery({
		page,
		limit,
		...(status && { status: status as AdvisoryStatus }),
		...(type && { type: type as AdvisoryType }),
	});

	// Mutations
	const [createAdvisory, { isLoading: isCreating }] =
		useCreateAdvisoryMutation();
	const [updateAdvisory, { isLoading: isUpdating }] =
		useUpdateAdvisoryMutation();
	const [publishAdvisory] = usePublishAdvisoryMutation();
	const [archiveAdvisory] = useArchiveAdvisoryMutation();
	const [deleteAdvisory] = useDeleteAdvisoryMutation();

	const handleCloseModal = useCallback(() => {
		reset(DEFAULT_FORM_VALUES);
		setEditingAdvisory(null);
		closeModal();
	}, [reset, closeModal]);

	const handleOpenCreate = useCallback(() => {
		setEditingAdvisory(null);
		reset(DEFAULT_FORM_VALUES);
		openModal();
	}, [openModal, reset]);

	const handleOpenEdit = useCallback(
		(advisory: Advisory) => {
			setEditingAdvisory(advisory);
			reset({
				title: advisory.title,
				content: advisory.content,
				type: advisory.type,
				expiresAt: advisory.expiresAt ? new Date(advisory.expiresAt) : null,
			});
			openModal();
		},
		[openModal, reset],
	);

	const handleOpenPreview = useCallback(
		(advisory: Advisory) => {
			setPreviewAdvisory(advisory);
			openPreview();
		},
		[openPreview],
	);

	const onSubmit = handleSubmit(async (values) => {
		try {
			if (editingAdvisory) {
				await updateAdvisory({
					id: editingAdvisory.id,
					data: {
						title: values.title,
						content: values.content,
						type: values.type,
						expiresAt: values.expiresAt?.toISOString() ?? null,
					},
				}).unwrap();
				notifications.show({
					title: "Success",
					message: "Advisory updated successfully",
					color: "green",
				});
			} else {
				await createAdvisory({
					title: values.title,
					content: values.content,
					type: values.type,
					expiresAt: values.expiresAt?.toISOString(),
				}).unwrap();
				notifications.show({
					title: "Success",
					message: "Advisory created successfully",
					color: "green",
				});
			}
			handleCloseModal();
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	});

	const handlePublish = useCallback(
		async (advisory: Advisory) => {
			try {
				await publishAdvisory(advisory.id).unwrap();
				notifications.show({
					title: "Success",
					message: "Advisory published successfully",
					color: "green",
				});
			} catch (err) {
				notifications.show({
					title: "Error",
					message: getErrorMessage(err),
					color: "red",
				});
			}
		},
		[publishAdvisory],
	);

	const handleArchive = useCallback(
		async (advisory: Advisory) => {
			try {
				await archiveAdvisory(advisory.id).unwrap();
				notifications.show({
					title: "Success",
					message: "Advisory archived successfully",
					color: "green",
				});
			} catch (err) {
				notifications.show({
					title: "Error",
					message: getErrorMessage(err),
					color: "red",
				});
			}
		},
		[archiveAdvisory],
	);

	const handleDelete = useCallback(
		(advisory: Advisory) => {
			modals.openConfirmModal({
				title: "Delete Advisory",
				centered: true,
				children: (
					<Text size="sm">
						Are you sure you want to delete "{advisory.title}"? This action
						cannot be undone.
					</Text>
				),
				labels: { confirm: "Delete", cancel: "Cancel" },
				confirmProps: { color: "red" },
				onConfirm: async () => {
					try {
						await deleteAdvisory(advisory.id).unwrap();
						notifications.show({
							title: "Success",
							message: "Advisory deleted successfully",
							color: "green",
						});
					} catch (err) {
						notifications.show({
							title: "Error",
							message: getErrorMessage(err),
							color: "red",
						});
					}
				},
			});
		},
		[deleteAdvisory],
	);

	// Reset form when modal closes
	useEffect(() => {
		if (!modalOpened) {
			reset(DEFAULT_FORM_VALUES);
			setEditingAdvisory(null);
		}
	}, [modalOpened, reset]);

	const columns = useMemo(
		() =>
			getAdvisoryColumns({
				onPreview: handleOpenPreview,
				onEdit: handleOpenEdit,
				onPublish: handlePublish,
				onArchive: handleArchive,
				onDelete: handleDelete,
			}),
		[
			handleOpenPreview,
			handleOpenEdit,
			handlePublish,
			handleArchive,
			handleDelete,
		],
	);

	const isSubmitting = isCreating || isUpdating;

	return (
		<Stack gap="lg">
			<Group justify="space-between" align="center">
				<Title order={1}>Advisories</Title>
				<Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
					Create Advisory
				</Button>
			</Group>

			{/* Filters */}
			<Paper withBorder p="md">
				<Group>
					<Select
						placeholder="Status"
						data={STATUS_OPTIONS}
						value={status}
						onChange={(value) => {
							setStatus(value ?? "");
							setPage(1);
						}}
						clearable
						w={150}
					/>
					<Select
						placeholder="Type"
						data={TYPE_OPTIONS}
						value={type}
						onChange={(value) => {
							setType(value ?? "");
							setPage(1);
						}}
						clearable
						w={150}
					/>
				</Group>
			</Paper>

			{/* Data Table */}
			<DataTable
				data={data?.data ?? []}
				columns={columns}
				rowKey={(advisory) => advisory.id}
				loading={isLoading || isFetching}
				page={page}
				pageCount={data?.meta?.pageCount ?? 1}
				onPageChange={setPage}
				emptyState={{
					title: "No advisories found",
					description: "Create your first advisory to get started.",
					actionLabel: "Create Advisory",
					onAction: handleOpenCreate,
				}}
			/>

			{/* Create/Edit Modal */}
			<Modal
				opened={modalOpened}
				onClose={handleCloseModal}
				title={editingAdvisory ? "Edit Advisory" : "Create Advisory"}
				size="xl"
			>
				<form
					onSubmit={(e) => {
						e.stopPropagation();
						void onSubmit(e);
					}}
				>
					<Stack gap="md">
						<TextInput
							label="Title"
							placeholder="Enter advisory title"
							required
							maxLength={200}
							error={errors.title?.message}
							disabled={isSubmitting}
							{...register("title")}
						/>

						<Controller
							name="type"
							control={control}
							render={({ field, fieldState }) => (
								<Select
									label="Type"
									data={FORM_TYPE_OPTIONS}
									value={field.value}
									onChange={field.onChange}
									error={fieldState.error?.message}
									disabled={isSubmitting}
								/>
							)}
						/>

						<Controller
							name="content"
							control={control}
							render={({ field, fieldState }) => (
								<RichTextEditor
									label="Content"
									value={field.value}
									onChange={field.onChange}
									minHeight={250}
									error={fieldState.error?.message}
								/>
							)}
						/>

						<Controller
							name="expiresAt"
							control={control}
							render={({ field, fieldState }) => (
								<DateTimePicker
									label="Expires At"
									placeholder="Optional expiration date"
									value={field.value}
									onChange={field.onChange}
									error={fieldState.error?.message}
									clearable
									minDate={new Date()}
									disabled={isSubmitting}
								/>
							)}
						/>

						<Group justify="flex-end" mt="md">
							<Button
								variant="default"
								onClick={handleCloseModal}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" loading={isSubmitting}>
								{editingAdvisory ? "Save Changes" : "Create"}
							</Button>
						</Group>
					</Stack>
				</form>
			</Modal>

			{/* Preview Modal - uses shared AdvisoryModal component */}
			<AdvisoryPreviewModal
				advisory={previewAdvisory}
				opened={previewOpened}
				onClose={closePreview}
			/>
		</Stack>
	);
}
