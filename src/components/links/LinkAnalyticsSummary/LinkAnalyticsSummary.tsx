import { AreaChart } from "@mantine/charts";
import {
	Badge,
	Button,
	Center,
	Paper,
	SimpleGrid,
	Stack,
	Text,
} from "@mantine/core";
import { IconCrown, IconLock } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import type { LinkAnalyticsSummary as ILinkAnalyticsSummary } from "@/types";

interface TopListProps {
	title: string;
	items: { label: string; count: number }[];
	locked?: boolean;
}

function TopList({ title, items, locked }: Readonly<TopListProps>) {
	const navigate = useNavigate();

	return (
		<Paper withBorder p="md" radius="md" mih={200}>
			<Text size="sm" fw={600} mb="xs">
				{title}
				{locked && (
					<Badge
						size="xs"
						color="violet"
						variant="light"
						ml="xs"
						leftSection={<IconCrown size={10} />}
					>
						PRO
					</Badge>
				)}
			</Text>
			{locked ? (
				<Center h={140}>
					<Stack align="center" gap="sm">
						<IconLock size={32} color="var(--mantine-color-gray-5)" />
						<Text size="sm" c="dimmed" ta="center">
							Upgrade to PRO to unlock
						</Text>
						<Button
							size="xs"
							variant="light"
							color="violet"
							leftSection={<IconCrown size={14} />}
							onClick={() => navigate("/dashboard/settings")}
						>
							Upgrade
						</Button>
					</Stack>
				</Center>
			) : items.length === 0 ? (
				<Text size="sm" c="dimmed">
					No data available
				</Text>
			) : (
				<Stack gap="xs">
					{items.slice(0, 10).map((item, index) => (
						<Stack key={`${item.label}-${index}`} gap={2}>
							<Text size="sm" fw={500}>
								{item.label}
							</Text>
							<Text size="xs" c="dimmed">
								{item.count.toLocaleString()} clicks
							</Text>
						</Stack>
					))}
				</Stack>
			)}
		</Paper>
	);
}

export interface LinkAnalyticsSummaryProps {
	summary?: ILinkAnalyticsSummary;
	loading?: boolean;
	isPro?: boolean;
}

export function LinkAnalyticsSummary({
	summary,
	loading,
	isPro = false,
}: Readonly<LinkAnalyticsSummaryProps>) {
	const clicksData =
		summary?.clicksByDate
			.map((item) => ({
				date: new Date(item.date).toLocaleDateString(),
				Clicks: item.count,
			}))
			.reverse() ?? [];

	return (
		<Stack gap="md">
			<Paper withBorder p="md" radius="md">
				<Text size="sm" fw={600} mb="sm">
					Clicks over time
					{!isPro && (
						<Badge size="xs" color="gray" variant="light" ml="xs">
							Last 7 days
						</Badge>
					)}
				</Text>
				{clicksData.length === 0 ? (
					<Text size="sm" c="dimmed">
						{loading ? "Loading analytics..." : "No click data yet"}
					</Text>
				) : (
					<AreaChart
						h={240}
						data={clicksData}
						dataKey="date"
						series={[{ name: "Clicks", color: "blue.5" }]}
						strokeWidth={2}
						curveType="monotone"
					/>
				)}
			</Paper>

			<SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
				<TopList
					title="Top Countries"
					items={
						summary?.topCountries.map((country) => ({
							label: country.country || "Unknown",
							count: country.count,
						})) ?? []
					}
				/>
				<TopList
					title="Top Referrers"
					locked={!isPro}
					items={
						summary?.topReferrers.map((ref) => ({
							label: ref.referrer || "Direct",
							count: ref.count,
						})) ?? []
					}
				/>
				<TopList
					title="Top Devices"
					locked={!isPro}
					items={
						summary?.topDevices.map((device) => ({
							label: device.device || "Unknown",
							count: device.count,
						})) ?? []
					}
				/>
			</SimpleGrid>
		</Stack>
	);
}
