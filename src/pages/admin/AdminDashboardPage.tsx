import { Container, Title, Text, Stack } from "@mantine/core";

export default function AdminDashboardPage() {
	return (
		<Container size="lg" py="xl">
			<Stack gap="md">
				<Title order={1}>Admin Dashboard</Title>
				<Text>Platform stats and overview</Text>
			</Stack>
		</Container>
	);
}
