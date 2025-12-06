import { Container, Title, Text, Stack } from "@mantine/core";

export default function AdminUsersPage() {
	return (
		<Container size="lg" py="xl">
			<Stack gap="md">
				<Title order={1}>User Management</Title>
				<Text>Manage users (details via drawer)</Text>
			</Stack>
		</Container>
	);
}
