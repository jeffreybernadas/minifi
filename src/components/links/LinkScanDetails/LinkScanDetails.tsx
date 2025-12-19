import { Badge, List, Paper, Stack, Text } from "@mantine/core";
import type { Link } from "@/types";

export interface LinkScanDetailsProps {
	link: Link;
	withContainer?: boolean;
}

export function LinkScanDetails({
	link,
	withContainer = true,
}: Readonly<LinkScanDetailsProps>) {
	const details = link.scanDetails;
	const threats = details?.threats ?? [];

	const content = (
		<Stack gap="sm">
			<Text fw={600}>Security Scan</Text>
			<Stack gap={4}>
				{link.scanScore !== null && link.scanScore !== undefined && (
					<Text size="sm" c="dimmed">
						Score: {link.scanScore}/1
					</Text>
				)}
				<Text size="sm" c="dimmed">
					Last scanned:{" "}
					{link.scannedAt
						? new Date(link.scannedAt).toLocaleString()
						: "Pending"}
				</Text>
				{link.lastScanVersion && (
					<Text size="xs" c="dimmed">
						Engine: {link.lastScanVersion}
					</Text>
				)}
			</Stack>

			{threats.length > 0 && (
				<Stack gap="xs">
					<Text size="sm" fw={500}>
						Detected threats
					</Text>
					<Stack gap={4}>
						{threats.map((threat) => (
							<Badge key={threat} color="red" variant="light">
								{threat}
							</Badge>
						))}
					</Stack>
				</Stack>
			)}

			{details?.reasoning && (
				<Stack gap={4}>
					<Text size="sm" fw={500}>
						Reasoning
					</Text>
					<Text size="sm" c="dimmed">
						{details.reasoning}
					</Text>
				</Stack>
			)}

			{details?.recommendations && (
				<Stack gap={4}>
					<Text size="sm" fw={500}>
						Recommendations
					</Text>
					<List size="sm" c="dimmed">
						<List.Item>{details.recommendations}</List.Item>
					</List>
				</Stack>
			)}
		</Stack>
	);

	if (!withContainer) {
		return content;
	}

	return (
		<Paper withBorder p="md" radius="md">
			{content}
		</Paper>
	);
}
