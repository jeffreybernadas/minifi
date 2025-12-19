import { Paper, Stack, Table, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { TopLinkData } from "@/types";
import { AnalyticsEmptyState } from "../AnalyticsEmptyState";

export interface TopLinksTableProps {
	data: TopLinkData[];
	loading?: boolean;
	title?: string;
	limit?: number;
}

export function TopLinksTable({
	data,
	loading = false,
	title = "Top Performing Links",
	limit = 5,
}: Readonly<TopLinksTableProps>) {
	const navigate = useNavigate();

	if (loading || !data || data.length === 0) {
		return (
			<AnalyticsEmptyState
				title={title}
				message="No links data available"
				height={250}
				loading={loading}
			/>
		);
	}

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="md">
				<Title order={4}>{title}</Title>
				<Table>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Link</Table.Th>
							<Table.Th style={{ textAlign: "right" }}>Clicks</Table.Th>
							<Table.Th style={{ textAlign: "right" }}>Unique</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{data.slice(0, limit).map((link) => (
							<Table.Tr
								key={link.id}
								style={{ cursor: "pointer" }}
								onClick={() => navigate(`/dashboard/links/${link.id}`)}
							>
								<Table.Td>
									<Stack gap={2}>
										<Text size="sm" fw={500} lineClamp={1}>
											{link.title || link.shortCode}
										</Text>
										<Text size="xs" c="dimmed" ff="monospace">
											/{link.shortCode}
										</Text>
									</Stack>
								</Table.Td>
								<Table.Td style={{ textAlign: "right" }}>
									<Text size="sm" fw={500}>
										{link.clicks.toLocaleString()}
									</Text>
								</Table.Td>
								<Table.Td style={{ textAlign: "right" }}>
									<Text size="sm" c="dimmed">
										{link.uniqueClicks.toLocaleString()}
									</Text>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</Stack>
		</Paper>
	);
}
