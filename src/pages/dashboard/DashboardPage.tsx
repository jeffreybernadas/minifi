import { Container, Title, Text, Stack } from "@mantine/core";

export default function DashboardPage() {
	return (
		<Container size="lg" py="xl">
			<Stack gap="md">
				<Title order={1}>Dashboard</Title>
				<Text>Links list (table) + stats cards</Text>
			</Stack>
		</Container>
	);
}
