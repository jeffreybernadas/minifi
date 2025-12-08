import { Title, Text, Stack } from "@mantine/core";

export default function AdminUsersPage() {
	return (
		<Stack gap="md">
			<Title order={1}>User Management</Title>
			<Text>Manage users (details via drawer)</Text>
		</Stack>
	);
}
