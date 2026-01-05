import { Anchor, Group, Text } from "@mantine/core";
import { Link } from "react-router-dom";

export function Footer() {
	const year = new Date().getFullYear();
	return (
		<Group justify="space-between" py="md" wrap="wrap" gap="sm">
			<Text
				size="sm"
				c="dimmed"
				ta={{ base: "center", xs: "left" }}
				w={{ base: "100%", xs: "auto" }}
			>
				© {year} Minifi. All rights reserved.
			</Text>

			<Group gap="md" justify="center" w={{ base: "100%", xs: "auto" }}>
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
