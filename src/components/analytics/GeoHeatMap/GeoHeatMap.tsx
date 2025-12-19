import { Paper, Stack, Text, Title } from "@mantine/core";
import { scaleLinear } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic";
import { useState } from "react";
import {
	ComposableMap,
	Geographies,
	Geography,
	ZoomableGroup,
} from "react-simple-maps";
import type { TopCountryData } from "@/types";
import { AnalyticsEmptyState } from "../AnalyticsEmptyState";

export interface GeoHeatMapProps {
	/**
	 * Country click data
	 */
	data: TopCountryData[];

	/**
	 * Loading state
	 */
	loading?: boolean;

	/**
	 * Chart title
	 * @default "Geographic Distribution"
	 */
	title?: string;

	/**
	 * Map height in pixels
	 * @default 400
	 */
	height?: number;

	/**
	 * Color scheme from d3-scale-chromatic
	 * @default interpolateBlues
	 */
	colorScheme?: (t: number) => string;
}

// GeoJSON URL for world map
const GEO_URL =
	"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map common country display names to react-simple-maps topojson names.
const COUNTRY_NAME_ALIASES: Record<string, string> = {
	"United States": "United States of America",
	"United Kingdom": "United Kingdom",
	Russia: "Russian Federation",
	"South Korea": "Korea, Republic of",
	"North Korea": "Korea, Democratic People's Republic of",
	"Viet Nam": "Vietnam",
	"United Arab Emirates": "United Arab Emirates",
	Tanzania: "United Republic of Tanzania",
	Bolivia: "Bolivia (Plurinational State of)",
	Iran: "Iran (Islamic Republic of)",
	Venezuela: "Venezuela (Bolivarian Republic of)",
	"Czech Republic": "Czechia",
};

const normalizeCountryName = (name: string): string =>
	name.trim().toLowerCase();

const resolveCountryName = (country?: string): string => {
	if (!country) {
		return "";
	}

	return COUNTRY_NAME_ALIASES[country] || country;
};

/**
 * GeoHeatMap Component
 *
 * Displays a world heat map colored by click intensity per country.
 * PRO feature for both individual link and global analytics.
 *
 * Uses react-simple-maps for map rendering and d3-scale for color interpolation.
 */
export function GeoHeatMap({
	data,
	loading,
	title = "Geographic Distribution",
	height = 400,
	colorScheme = interpolateBlues,
}: Readonly<GeoHeatMapProps>) {
	const [tooltipContent, setTooltipContent] = useState("");
	const getClicks = (country: TopCountryData & { count?: number }): number =>
		country.clicks ?? country.count ?? 0;

	if (loading || !data || data.length === 0) {
		return (
			<AnalyticsEmptyState
				title={title}
				message="No geographic data available"
				height={height}
				loading={loading}
			/>
		);
	}

	// Create a map of country names to click counts (normalized for matching)
	const clicksByCountry = new Map<string, number>();
	let maxClicks = 0;

	for (const country of data) {
		const name = resolveCountryName(country.country);
		const clicks = getClicks(country);
		if (name) {
			clicksByCountry.set(normalizeCountryName(name), clicks);
			maxClicks = Math.max(maxClicks, clicks);
		}
	}

	// Create color scale
	const colorScale = scaleLinear().domain([0, maxClicks]).range([0, 1]);

	// Get color for a country based on clicks
	const getCountryColor = (countryName: string): string => {
		const clicks = clicksByCountry.get(normalizeCountryName(countryName));
		if (!clicks) {
			return "var(--mantine-color-gray-2)"; // Default color for countries with no data
		}
		const intensity = colorScale(clicks);
		return colorScheme(Number(intensity));
	};

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="md">
				<Title order={4}>{title}</Title>
				<div style={{ position: "relative", height }}>
					<ComposableMap
						projection="geoMercator"
						projectionConfig={{
							scale: 120,
						}}
						height={height}
						style={{
							width: "100%",
							height: "100%",
						}}
					>
						<ZoomableGroup zoom={1}>
							<Geographies geography={GEO_URL}>
								{({ geographies }) =>
									geographies.map((geo) => {
										const countryName = geo.properties.name;
										const clicks =
											clicksByCountry.get(normalizeCountryName(countryName)) ||
											0;
										return (
											<Geography
												key={geo.rsmKey}
												geography={geo}
												fill={getCountryColor(countryName)}
												stroke="var(--mantine-color-gray-4)"
												strokeWidth={0.5}
												style={{
													default: { outline: "none" },
													hover: {
														fill: "var(--mantine-color-blue-7)",
														outline: "none",
														cursor: "pointer",
													},
													pressed: { outline: "none" },
												}}
												onMouseEnter={() => {
													if (clicks > 0) {
														setTooltipContent(
															`${countryName}: ${clicks.toLocaleString()} clicks`,
														);
													} else {
														setTooltipContent(countryName);
													}
												}}
												onMouseLeave={() => {
													setTooltipContent("");
												}}
											/>
										);
									})
								}
							</Geographies>
						</ZoomableGroup>
					</ComposableMap>

					{/* Tooltip */}
					{tooltipContent && (
						<div
							style={{
								position: "absolute",
								top: 10,
								left: 10,
								backgroundColor: "var(--mantine-color-body)",
								border: "1px solid var(--mantine-color-default-border)",
								borderRadius: "var(--mantine-radius-md)",
								padding: "8px 12px",
								pointerEvents: "none",
								fontSize: 12,
								fontWeight: 500,
								zIndex: 1000,
							}}
						>
							{tooltipContent}
						</div>
					)}
				</div>

				{/* Legend */}
				<Stack gap={4}>
					<Text size="xs" fw={500}>
						Click Intensity
					</Text>
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<Text size="xs" c="dimmed">
							Low
						</Text>
						<div
							style={{
								flex: 1,
								height: 8,
								background: `linear-gradient(to right, ${colorScheme(0)}, ${colorScheme(1)})`,
								borderRadius: 4,
							}}
						/>
						<Text size="xs" c="dimmed">
							High
						</Text>
					</div>
					<Text size="xs" c="dimmed" ta="center">
						0 - {maxClicks.toLocaleString()} clicks
					</Text>
				</Stack>
			</Stack>
		</Paper>
	);
}
