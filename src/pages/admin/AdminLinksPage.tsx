import { Container, Title, Text, Stack } from "@mantine/core";

export default function AdminLinksPage() {
	return (
		<Container size="lg" py="xl">
			<Stack gap="md">
				<Title order={1}>Link Management</Title>
				<Text>Manage links (details via drawer)</Text>
			</Stack>
		</Container>
	);
}
