import {
	Alert,
	Button,
	Group,
	Loader,
	SimpleGrid,
	Stack,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	useArchiveLinkMutation,
	useDeleteLinkMutation,
	useGenerateQrMutation,
	useGetAnalyticsSummaryQuery,
	useGetLinkAnalyticsQuery,
	useGetLinkQuery,
	useRescanLinkMutation,
	useUnarchiveLinkMutation,
} from "@/app/api/links.api";
import {
	EditLinkModal,
	LinkAnalyticsSummary,
	LinkAnalyticsTable,
	LinkDetailHeader,
	LinkInfoGrid,
	LinkQrCard,
	LinkScanDetails,
	LinkStatsGrid,
} from "@/components/links";
import { useAuth } from "@/hooks";
import type { Link } from "@/types";
import { getErrorMessage } from "@/types";

export default function LinkDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { isPro } = useAuth();
	const [page, setPage] = useState(1);
	const limit = 10;
	const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
		useDisclosure(false);

	const {
		data: link,
		isLoading: isLinkLoading,
		error: linkError,
		refetch: refetchLink,
	} = useGetLinkQuery(id ?? "", { skip: !id });
	const summaryQuery = useGetAnalyticsSummaryQuery(id ?? "", { skip: !id });
	const analyticsQuery = useGetLinkAnalyticsQuery(
		{ id: id ?? "", filters: { page, limit } },
		{ skip: !id },
	);

	const [archiveLink, { isLoading: isArchiving }] = useArchiveLinkMutation();
	const [unarchiveLink, { isLoading: isUnarchiving }] =
		useUnarchiveLinkMutation();
	const [deleteLink, { isLoading: isDeleting }] = useDeleteLinkMutation();
	const [rescanLink, { isLoading: isRescanning }] = useRescanLinkMutation();
	const [generateQr, { isLoading: isQrLoading }] = useGenerateQrMutation();

	const archiveLoading = isArchiving || isUnarchiving;

	const handleArchiveToggle = async (current: Link) => {
		try {
			if (current.isArchived) {
				await unarchiveLink(current.id).unwrap();
				notifications.show({
					title: "Link restored",
					message: "Link is active again",
					color: "green",
				});
			} else {
				await archiveLink(current.id).unwrap();
				notifications.show({
					title: "Link archived",
					message: "Link moved to archived tab",
					color: "orange",
				});
			}
			void refetchLink();
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	};

	const handleDelete = (current: Link) => {
		modals.openConfirmModal({
			title: "Delete link",
			children: (
				<Alert color="red">
					This action cannot be undone and removes analytics.
				</Alert>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: async () => {
				try {
					await deleteLink(current.id).unwrap();
					notifications.show({
						title: "Deleted",
						message: "Link has been deleted",
						color: "green",
					});
					navigate("/dashboard");
				} catch (err) {
					notifications.show({
						title: "Error",
						message: getErrorMessage(err),
						color: "red",
					});
				}
			},
		});
	};

	const handleRescan = async (current: Link) => {
		try {
			await rescanLink(current.id).unwrap();
			notifications.show({
				title: "Scan requested",
				message: "URL will be rescanned shortly",
				color: "blue",
			});
			void refetchLink();
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	};

	const handleGenerateQr = async (current: Link) => {
		try {
			await generateQr(current.id).unwrap();
			notifications.show({
				title: "QR code ready",
				message: "QR code generated successfully",
				color: "green",
			});
			void refetchLink();
		} catch (err) {
			notifications.show({
				title: "Error",
				message: getErrorMessage(err),
				color: "red",
			});
		}
	};

	if (!id) {
		return <Alert color="red">Missing link ID.</Alert>;
	}

	if (isLinkLoading) {
		return (
			<Group justify="center" py="xl">
				<Loader />
			</Group>
		);
	}

	if (linkError) {
		return (
			<Alert color="red">
				Failed to load link: {getErrorMessage(linkError)}
			</Alert>
		);
	}

	if (!link) {
		return <Alert color="yellow">Link not found.</Alert>;
	}

	const analyticsData = analyticsQuery.data?.data ?? [];
	const analyticsMeta = analyticsQuery.data?.meta;

	return (
		<Stack gap="lg">
			<Group justify="space-between" align="center">
				<Title order={1}>Link Details</Title>
				<Button
					variant="subtle"
					leftSection={<IconArrowLeft size={16} />}
					onClick={() => navigate("/dashboard")}
				>
					Back
				</Button>
			</Group>

			<LinkDetailHeader
				link={link}
				onEdit={openEditModal}
				onArchiveToggle={() => handleArchiveToggle(link)}
				onRescan={() => handleRescan(link)}
				onDelete={() => handleDelete(link)}
				archiveLoading={archiveLoading}
				rescanLoading={isRescanning}
				deleteLoading={isDeleting}
			/>

			<SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
				<Stack gap="lg" style={{ gridColumn: "span 2" }}>
					<LinkStatsGrid link={link} summary={summaryQuery.data} />
					<LinkAnalyticsSummary
						summary={summaryQuery.data}
						loading={summaryQuery.isLoading}
						isPro={isPro}
					/>
					<LinkAnalyticsTable
						records={analyticsData}
						page={page}
						pageCount={analyticsMeta?.pageCount ?? 1}
						onPageChange={setPage}
						loading={analyticsQuery.isLoading}
						isPro={isPro}
					/>
				</Stack>

				<Stack gap="md">
					<LinkQrCard
						link={link}
						onGenerate={() => handleGenerateQr(link)}
						loading={isQrLoading}
					/>
					<LinkScanDetails link={link} />
					<LinkInfoGrid link={link} />
				</Stack>
			</SimpleGrid>

			<EditLinkModal
				link={link}
				opened={editModalOpened}
				onClose={closeEditModal}
				onSuccess={() => void refetchLink()}
			/>
		</Stack>
	);
}
