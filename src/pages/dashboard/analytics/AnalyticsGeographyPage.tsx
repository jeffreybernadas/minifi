import { Grid, Stack, Text, Title, Tooltip } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useState } from "react";
import { useGetGlobalAnalyticsQuery } from "@/app/api/links.api";
import {
	AnalyticsEmptyState,
	GeoHeatMap,
	TopCountriesTable,
} from "@/components/analytics";
import { ProFeatureGuard } from "@/components/common";
import { useAuth } from "@/hooks";

/**
 * AnalyticsGeographyPage
 *
 * Geographic analytics with heat map and country/city breakdowns
 * Route: /dashboard/analytics/geo
 */
export default function AnalyticsGeographyPage() {
	const { isPro } = useAuth();
	const [dateRange, setDateRange] = useState<[string | null, string | null]>([
		null,
		null,
	]);
	const [startDate, endDate] = dateRange;

	// Fetch global analytics
	const {
		data: analytics,
		isLoading,
		isFetching,
	} = useGetGlobalAnalyticsQuery(
		{ startDate: startDate!, endDate: endDate! },
		{ skip: Boolean(startDate) !== Boolean(endDate) },
	);

	if (isLoading || !analytics) {
		return (
			<AnalyticsEmptyState
				title="Geographic Analytics"
				message="No geographic analytics data available"
				height={300}
				loading={isLoading}
			/>
		);
	}

	const { topCountries, topCities } = analytics;

	return (
		<Stack gap="lg">
			<Grid gutter="md" w="100%">
				<Grid.Col span={{ base: 12, sm: 6 }}>
					<Title order={1}>Geographic Analytics</Title>
					<Text c="dimmed" size="sm" mt={4}>
						Visualize your global reach with an interactive heat map and country
						breakdowns
					</Text>
				</Grid.Col>
				<Grid.Col
					span={{ base: 12, sm: 6 }}
					display="flex"
					style={{ justifyContent: "flex-end" }}
				>
					<Tooltip
						label="Upgrade to PRO to filter by custom date range"
						disabled={isPro}
						withArrow
					>
						<DatePickerInput
							type="range"
							placeholder="Filter by date"
							value={dateRange}
							onChange={setDateRange}
							clearable
							maxDate={new Date()}
							disabled={!isPro}
							size="sm"
							w="50%"
							styles={{
								input: {
									fontSize: "0.875rem",
								},
							}}
						/>
					</Tooltip>
				</Grid.Col>
			</Grid>

			{/* Geographic Heat Map - Main Feature */}
			<GeoHeatMap
				data={topCountries}
				title="Global Click Distribution"
				height={500}
				loading={isLoading || isFetching}
			/>

			{/* Top Countries & Cities */}
			<Grid gutter="md">
				{/* Top Countries Table - Available to all */}
				<Grid.Col span={{ base: 12, md: 6 }}>
					<TopCountriesTable
						data={topCountries}
						title="Top Countries"
						limit={10}
						showProgress={true}
						loading={isLoading || isFetching}
					/>
				</Grid.Col>

				{/* Top Cities - PRO Feature */}
				<Grid.Col span={{ base: 12, md: 6 }}>
					<ProFeatureGuard
						isPro={isPro}
						featureName="Top Cities"
						upgradeMessage="See detailed city-level breakdowns of where your clicks are coming from."
					>
						<TopCountriesTable
							data={topCities}
							title="Top Cities"
							limit={10}
							showProgress={true}
							nameLabel="City"
							showFlag={false}
							loading={isLoading || isFetching}
						/>
					</ProFeatureGuard>
				</Grid.Col>
			</Grid>
		</Stack>
	);
}
