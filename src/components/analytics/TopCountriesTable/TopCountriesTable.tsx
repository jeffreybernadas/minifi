import { Paper, Progress, Stack, Table, Text, Title } from "@mantine/core";
import type {
	TopCity,
	TopCityData,
	TopCountry,
	TopCountryData,
} from "@/types";
import { AnalyticsEmptyState } from "../AnalyticsEmptyState";

export interface TopCountriesTableProps {
	/**
	 * Top countries/cities data (can be either TopCountry/TopCountryData/TopCity/TopCityData)
	 */
	data: TopCountry[] | TopCountryData[] | TopCity[] | TopCityData[];

	/**
	 * Loading state
	 */
	loading?: boolean;

	/**
	 * Table title
	 * @default "Top Countries"
	 */
	title?: string;

	/**
	 * Number of countries to display
	 * @default undefined (show all)
	 */
	limit?: number;

	/**
	 * Whether to show progress bars
	 * @default true
	 */
	showProgress?: boolean;

	/**
	 * Label for the name column
	 * @default "Country"
	 */
	nameLabel?: string;

	/**
	 * Whether to show country flags
	 * @default true
	 */
	showFlag?: boolean;
}

// Map of country names to flag emojis (common countries)
const COUNTRY_FLAGS: Record<string, string> = {
	"United States": "🇺🇸",
	"United Kingdom": "🇬🇧",
	Canada: "🇨🇦",
	Germany: "🇩🇪",
	France: "🇫🇷",
	Italy: "🇮🇹",
	Spain: "🇪🇸",
	Netherlands: "🇳🇱",
	Australia: "🇦🇺",
	Japan: "🇯🇵",
	China: "🇨🇳",
	India: "🇮🇳",
	Brazil: "🇧🇷",
	Mexico: "🇲🇽",
	Russia: "🇷🇺",
	"South Korea": "🇰🇷",
	Singapore: "🇸🇬",
	Sweden: "🇸🇪",
	Norway: "🇳🇴",
	Denmark: "🇩🇰",
	Finland: "🇫🇮",
	Poland: "🇵🇱",
	Belgium: "🇧🇪",
	Switzerland: "🇨🇭",
	Austria: "🇦🇹",
	Ireland: "🇮🇪",
	"New Zealand": "🇳🇿",
	Philippines: "🇵🇭",
	Thailand: "🇹🇭",
	Vietnam: "🇻🇳",
	Indonesia: "🇮🇩",
	Malaysia: "🇲🇾",
	Portugal: "🇵🇹",
	Greece: "🇬🇷",
	"Czech Republic": "🇨🇿",
	Romania: "🇷🇴",
	Hungary: "🇭🇺",
	Turkey: "🇹🇷",
	"South Africa": "🇿🇦",
	Egypt: "🇪🇬",
	Nigeria: "🇳🇬",
	Kenya: "🇰🇪",
	Argentina: "🇦🇷",
	Chile: "🇨🇱",
	Colombia: "🇨🇴",
	Peru: "🇵🇪",
};

/**
 * TopCountriesTable Component
 *
 * Displays a table ranking countries by click count with optional progress bars.
 * Used in both individual link and global analytics.
 */
export function TopCountriesTable({
	data,
	loading,
	title = "Top Countries",
	limit,
	showProgress = true,
	nameLabel = "Country",
	showFlag = true,
}: Readonly<TopCountriesTableProps>) {
	if (loading || !data || data.length === 0) {
		return (
			<AnalyticsEmptyState
				title={title}
				message="No country data available"
				height={250}
				loading={loading}
			/>
		);
	}

	// Limit countries if specified
	const countries = limit ? data.slice(0, limit) : data;

	// Calculate total clicks for percentage
	const totalClicks = countries.reduce(
		(sum, c) => sum + ("count" in c ? c.count : c.clicks),
		0,
	);

	// Helper to get click count (handles TopCountry/TopCountryData/TopCity/TopCityData)
	const getClicks = (
		item: TopCountry | TopCountryData | TopCity | TopCityData,
	): number => {
		return "count" in item ? item.count : item.clicks;
	};

	const getName = (
		item: TopCountry | TopCountryData | TopCity | TopCityData,
	): string => {
		if ("country" in item) {
			return item.country || "Unknown";
		}
		if ("city" in item) {
			return item.city || "Unknown";
		}
		return "Unknown";
	};

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="md">
				<Title order={4}>{title}</Title>
				<Table>
					<Table.Thead>
						<Table.Tr>
							<Table.Th style={{ width: "40%" }}>{nameLabel}</Table.Th>
							<Table.Th style={{ width: "20%", textAlign: "right" }}>
								Clicks
							</Table.Th>
							{showProgress && (
								<Table.Th style={{ width: "40%" }}>Share</Table.Th>
							)}
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{countries.map((row, index) => {
							const clicks = getClicks(row);
							const percentage = (clicks / totalClicks) * 100;
							const name = getName(row);
							const flag =
								showFlag && "country" in row
									? COUNTRY_FLAGS[name] || "🌍"
									: "";

							return (
								<Table.Tr key={index}>
									<Table.Td>
										<Text size="sm">
											{flag ? `${flag} ${name}` : name}
										</Text>
									</Table.Td>
									<Table.Td style={{ textAlign: "right" }}>
										<Text size="sm" fw={500}>
											{clicks.toLocaleString()}
										</Text>
									</Table.Td>
									{showProgress && (
										<Table.Td>
											<Stack gap={4}>
												<Progress
													value={percentage}
													color="blue"
													size="sm"
													radius="xl"
												/>
												<Text size="xs" c="dimmed">
													{percentage.toFixed(1)}%
												</Text>
											</Stack>
										</Table.Td>
									)}
								</Table.Tr>
							);
						})}
					</Table.Tbody>
				</Table>
			</Stack>
		</Paper>
	);
}
