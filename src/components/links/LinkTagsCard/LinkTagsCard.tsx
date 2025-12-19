import { Group, Paper, Stack, Text } from "@mantine/core";
import { TagBadge } from "@/components/ui";
import type { Link } from "@/types";

export interface LinkTagsCardProps {
	link: Link;
}

export function LinkTagsCard({ link }: Readonly<LinkTagsCardProps>) {
	const tags = link.tags ?? [];

	return (
		<Paper p="md" radius="md" withBorder>
			<Stack gap="md">
				<Text fw={600}>Tags</Text>
				{tags.length > 0 ? (
					<Group gap="xs">
						{tags.map((tag) => (
							<TagBadge key={tag.id} tag={tag} size="sm" />
						))}
					</Group>
				) : (
					<Text size="sm" c="dimmed">
						No tags assigned
					</Text>
				)}
			</Stack>
		</Paper>
	);
}
