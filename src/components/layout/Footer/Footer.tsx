import { Group, Anchor, Text } from "@mantine/core";
import { Link } from "react-router-dom";

export function Footer() {
	return (
		<Group justify="space-between" py="md">
			<Text size="sm" c="dimmed">
				© 2025 Minifi. All rights reserved.
			</Text>

			<Group gap="md">
				<Anchor component={Link} to="/privacy" size="sm" c="dimmed">
					Privacy
				</Anchor>
				<Anchor component={Link} to="/terms" size="sm" c="dimmed">
					Terms
				</Anchor>
				<Anchor
					href="https://github.com/jeffreybernadas/minifi"
					target="_blank"
					size="sm"
					c="dimmed"
				>
					GitHub
				</Anchor>
			</Group>
		</Group>
	);
}
