import {
	ActionIcon,
	Anchor,
	Button,
	Group,
	Paper,
	Stack,
	Text,
} from "@mantine/core";
import {
	IconArchive,
	IconArchiveOff,
	IconExternalLink,
	IconPencil,
	IconRefresh,
	IconTrash,
} from "@tabler/icons-react";
import { CopyButton, LinkStatusBadge, ScanStatusBadge } from "@/components/ui";
import type { Link } from "@/types";

export interface LinkDetailHeaderProps {
	link: Link;
	onEdit?: () => void;
	onArchiveToggle?: () => void;
	onRescan?: () => void;
	onDelete?: () => void;
	archiveLoading?: boolean;
	rescanLoading?: boolean;
	deleteLoading?: boolean;
}

export function LinkDetailHeader({
	link,
	onEdit,
	onArchiveToggle,
	onRescan,
	onDelete,
	archiveLoading,
	rescanLoading,
	deleteLoading,
}: Readonly<LinkDetailHeaderProps>) {
	const shortUrl =
		link.shortUrl ||
		`${typeof window !== "undefined" ? window.location.origin : ""}/r/${link.shortCode}`;
	const isArchived = link.isArchived || link.status === "ARCHIVED";

	return (
		<Paper withBorder p="lg" radius="md">
			<Stack gap="md">
				<Group align="flex-start" justify="space-between" wrap="nowrap">
					<Stack gap="md" style={{ flex: 1 }}>
						<Group align="center" gap="sm">
							<Text size="xl" fw={800} lineClamp={1}>
								{link.title || link.originalUrl}
							</Text>
							<LinkStatusBadge status={link.status} />
							<ScanStatusBadge status={link.scanStatus} />
						</Group>

						<Stack gap="xs">
							<Stack gap={2}>
								<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
									Short URL
								</Text>
								<Group gap="xs" align="center">
									<Text
										size="md"
										c="blue"
										fw={600}
										style={{ fontFamily: "monospace" }}
									>
										{shortUrl}
									</Text>
									<CopyButton value={shortUrl} size="xs" variant="subtle" />
									<ActionIcon
										variant="subtle"
										color="blue"
										component="a"
										href={shortUrl}
										target="_blank"
										rel="noreferrer"
										size="sm"
									>
										<IconExternalLink size={16} />
									</ActionIcon>
								</Group>
							</Stack>

							<Stack gap={2}>
								<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
									Destination
								</Text>
								<Group gap="xs" align="center">
									<Anchor
										href={link.originalUrl}
										target="_blank"
										rel="noreferrer"
										size="sm"
										lineClamp={1}
										style={{ wordBreak: "break-all" }}
									>
										{link.originalUrl}
									</Anchor>
								</Group>
							</Stack>

							{link.description && (
								<Stack gap={2}>
									<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
										Description
									</Text>
									<Text size="sm" c="dimmed" lineClamp={2}>
										{link.description}
									</Text>
								</Stack>
							)}
						</Stack>
					</Stack>

					<Group gap="xs" align="flex-start">
						{onEdit && (
							<Button
								variant="light"
								size="sm"
								leftSection={<IconPencil size={16} />}
								onClick={onEdit}
							>
								Edit
							</Button>
						)}
						{onRescan && (
							<Button
								variant="light"
								size="sm"
								color="violet"
								leftSection={<IconRefresh size={16} />}
								onClick={onRescan}
								loading={rescanLoading}
							>
								Rescan
							</Button>
						)}
						<Button
							variant="outline"
							size="sm"
							color={isArchived ? "green" : "orange"}
							leftSection={
								isArchived ? (
									<IconArchiveOff size={16} />
								) : (
									<IconArchive size={16} />
								)
							}
							onClick={onArchiveToggle}
							disabled={!onArchiveToggle}
							loading={archiveLoading}
						>
							{isArchived ? "Unarchive" : "Archive"}
						</Button>

						<Button
							variant="subtle"
							color="red"
							size="sm"
							leftSection={<IconTrash size={16} />}
							onClick={onDelete}
							disabled={!onDelete}
							loading={deleteLoading}
						>
							Delete
						</Button>
					</Group>
				</Group>
			</Stack>
		</Paper>
	);
}
