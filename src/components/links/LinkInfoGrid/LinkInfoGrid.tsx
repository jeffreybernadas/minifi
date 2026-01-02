import {
	Badge,
	Box,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
} from "@mantine/core";
import type { ReactNode } from "react";
import type { Link } from "@/types";

interface InfoTileProps {
	label: string;
	value: ReactNode;
}

function InfoTile({ label, value }: Readonly<InfoTileProps>) {
	const isSimpleValue =
		typeof value === "string" || typeof value === "number" || value === null;

	return (
		<Stack gap={2}>
			<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
				{label}
			</Text>
			{isSimpleValue ? (
				<Text size="sm" fw={500} style={{ wordBreak: "break-all" }}>
					{value}
				</Text>
			) : (
				<Box
					style={{ fontSize: "var(--mantine-font-size-sm)", fontWeight: 500 }}
				>
					{value}
				</Box>
			)}
		</Stack>
	);
}

export interface LinkInfoGridProps {
	link: Link;
}

export function LinkInfoGrid({ link }: Readonly<LinkInfoGridProps>) {
	return (
		<Paper p="md" radius="md" withBorder>
			<Stack gap="md">
				<Text fw={600}>Link Configuration</Text>
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" verticalSpacing="lg">
					<InfoTile label="Destination" value={link.originalUrl} />
					<InfoTile
						label="Created"
						value={new Date(link.createdAt).toLocaleString()}
					/>

					<InfoTile label="Custom Alias" value={link.customAlias || "—"} />
					<InfoTile
						label="Updated"
						value={new Date(link.updatedAt).toLocaleString()}
					/>

					<InfoTile label="Notes" value={link.notes || "No internal notes"} />

					{(link.scheduledAt || link.expiresAt) && (
						<>
							<InfoTile
								label="Starts"
								value={
									link.scheduledAt
										? new Date(link.scheduledAt).toLocaleString()
										: "Immediately"
								}
							/>
							<InfoTile
								label="Expires"
								value={
									link.expiresAt
										? new Date(link.expiresAt).toLocaleString()
										: "No expiry"
								}
							/>
						</>
					)}

					<InfoTile
						label="Access Controls"
						value={
							<Group gap="xs" wrap="wrap">
								{link.hasPassword && (
									<Badge size="sm" color="violet">
										Password
									</Badge>
								)}
								{link.isOneTime && (
									<Badge size="sm" color="orange">
										One-time
									</Badge>
								)}
								{link.clickLimit && (
									<Badge size="sm">Limit: {link.clickLimit}</Badge>
								)}
								{!link.hasPassword &&
									!link.isOneTime &&
									!link.clickLimit &&
									"Standard access"}
							</Group>
						}
					/>
				</SimpleGrid>
			</Stack>
		</Paper>
	);
}
