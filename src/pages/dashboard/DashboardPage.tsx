import { Title, Text, Stack } from "@mantine/core";

export default function DashboardPage() {
	return (
		<Stack gap="md">
			<Title order={1}>Dashboard</Title>
			<Text>Links list (table) + stats cards</Text>
		</Stack>
	);
}
