import { Stack, Text, Title } from "@mantine/core";

export default function AdminLinksPage() {
	return (
		<Stack gap="md">
			<Title order={1}>Link Management</Title>
			<Text>Manage links (details via drawer)</Text>
		</Stack>
	);
}
