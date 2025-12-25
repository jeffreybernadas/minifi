import {
	Alert,
	Button,
	Grid,
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
import { useMemo, useState } from "react";
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
	ClicksTimelineChart,
	GeoHeatMap,
	ReferrerBarChart,
	TopCountriesTable,
} from "@/components/analytics";
import { ProFeatureGuard } from "@/components/common";
import {
	EditLinkModal,
	LinkAnalyticsTable,
	LinkDetailHeader,
	LinkInfoGrid,
	LinkQrCard,
	LinkScanDetails,
	LinkStatsGrid,
	LinkTagsCard,
} from "@/components/links";
import { AnalyticsPieChart } from "@/components/ui";
import { useAuth } from "@/hooks";
import type { Link, TopCountryData } from "@/types";
import { getErrorMessage } from "@/types";

export default function LinkDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { isPro } = useAuth();
	const [page, setPage] = useState(1);
	const limit = 10;
	const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
		useDisclosure(false);
	const [dateRange, setDateRange] = useState<[string | null, string | null]>([
		null,
		null,
	]);
	const [startDate, endDate] = dateRange;

	const handleDateRangeChange = (value: [string | null, string | null]) => {
		setDateRange(value);
		setPage(1); // Reset to first page when date range changes
	};

	const {
		data: link,
		isLoading: isLinkLoading,
		error: linkError,
		refetch: refetchLink,
	} = useGetLinkQuery(id ?? "", { skip: !id });
	const summaryQuery = useGetAnalyticsSummaryQuery(
		{ id: id ?? "", startDate: startDate!, endDate: endDate! },
		{ skip: !id || Boolean(startDate) !== Boolean(endDate) },
	);
	const analyticsQuery = useGetLinkAnalyticsQuery(
		{
			id: id ?? "",
			filters: {
				page,
				limit,
				...(startDate && endDate && { startDate, endDate }),
			},
		},
		{ skip: !id || Boolean(startDate) !== Boolean(endDate) },
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

	// Prepare data for charts
	const summary = summaryQuery.data;
	const clicksByDate = summary?.clicksByDate ?? [];
	const topCountries = summary?.topCountries ?? [];
	const topDevices = summary?.topDevices ?? [];
	const topBrowsers = summary?.topBrowsers ?? [];
	const topReferrers = summary?.topReferrers ?? [];

	// Dynamic chart title based on date selection
	const clicksTimelineTitle = useMemo(() => {
		if (startDate && endDate) {
			const start = new Date(startDate).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});
			const end = new Date(endDate).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});
			return `Clicks Over Time (${start} - ${end})`;
		}
		return isPro
			? "Clicks Over Time (Last 90 days)"
			: "Clicks Over Time (Last 7 days)";
	}, [startDate, endDate, isPro]);

	// Convert TopCountry to TopCountryData for heat map
	const topCountriesData: TopCountryData[] = topCountries.map((c) => ({
		country: c.country,
		clicks: c.count,
	}));

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
				dateRange={dateRange}
				onDateRangeChange={handleDateRangeChange}
				isPro={isPro}
			/>

			<Grid gutter="lg">
				{/* Sidebar - QR & Link Details (Order: 1st on mobile, 2nd on desktop) */}
				<Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
					<Stack gap="md">
						<LinkQrCard
							link={link}
							onGenerate={() => handleGenerateQr(link)}
							loading={isQrLoading}
						/>
						<LinkTagsCard link={link} />
						<LinkScanDetails link={link} />
						<LinkInfoGrid link={link} />
					</Stack>
				</Grid.Col>

				{/* Analytics Content (Order: 2nd on mobile, 1st on desktop) */}
				<Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
					<Stack gap="lg">
						{/* Summary Stats */}
						<LinkStatsGrid
							link={link}
							summary={summaryQuery.data}
							loading={summaryQuery.isLoading || summaryQuery.isFetching}
						/>

						{/* Clicks Timeline - Available to all */}
						<ClicksTimelineChart
							data={clicksByDate}
							loading={summaryQuery.isLoading || summaryQuery.isFetching}
							title={clicksTimelineTitle}
						/>

						{/* Geographic Analytics */}
						<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
							<ProFeatureGuard
								isPro={isPro}
								featureName="Geographic Heat Map"
								upgradeMessage="Visualize your global reach with an interactive heat map showing click intensity by country."
							>
								<GeoHeatMap
									data={topCountriesData}
									loading={summaryQuery.isLoading || summaryQuery.isFetching}
								/>
							</ProFeatureGuard>

							<TopCountriesTable
								data={topCountries}
								loading={summaryQuery.isLoading || summaryQuery.isFetching}
								limit={isPro ? 10 : 5}
							/>
						</SimpleGrid>

						{/* Device & Browser Analytics - PRO Only */}
						<ProFeatureGuard
							isPro={isPro}
							featureName="Device & Browser Analytics"
							upgradeMessage="Understand your audience better with detailed device and browser breakdowns."
						>
							<SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
								<AnalyticsPieChart
									data={topDevices}
									loading={summaryQuery.isLoading || summaryQuery.isFetching}
									title="Device Breakdown"
									emptyMessage="No device data available"
								/>
								<AnalyticsPieChart
									data={topBrowsers}
									loading={summaryQuery.isLoading || summaryQuery.isFetching}
									title="Browser Breakdown"
									emptyMessage="No browser data available"
								/>
							</SimpleGrid>
						</ProFeatureGuard>

						{/* Referrer Analytics - PRO Only */}
						<ProFeatureGuard
							isPro={isPro}
							featureName="Traffic Sources"
							upgradeMessage="Discover where your clicks are coming from with detailed referrer tracking."
						>
							<ReferrerBarChart
								data={topReferrers}
								loading={summaryQuery.isLoading || summaryQuery.isFetching}
								limit={10}
							/>
						</ProFeatureGuard>

						{/* Click Log Table - PRO Only */}
						<ProFeatureGuard
							isPro={isPro}
							featureName="Click Log"
							upgradeMessage="Access detailed click-level data with visitor information, device data, referrers, and UTM tracking."
						>
							<LinkAnalyticsTable
								records={analyticsData}
								page={page}
								pageCount={analyticsMeta?.pageCount ?? 1}
								onPageChange={setPage}
								loading={analyticsQuery.isLoading || analyticsQuery.isFetching}
							/>
						</ProFeatureGuard>
					</Stack>
				</Grid.Col>
			</Grid>

			<EditLinkModal
				link={link}
				opened={editModalOpened}
				onClose={closeEditModal}
				onSuccess={() => void refetchLink()}
			/>
		</Stack>
	);
}
