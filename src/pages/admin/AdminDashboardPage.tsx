import { Title, Text, Stack } from "@mantine/core";

export default function AdminDashboardPage() {
	return (
		<Stack gap="md">
			<Title order={1}>Admin Dashboard</Title>
			<Text>Platform stats and overview</Text>
		</Stack>
	);
}
