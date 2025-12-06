import { Container, Title, Text, Stack } from "@mantine/core";

export default function AnalyticsPage() {
	return (
		<Container size="lg" py="xl">
			<Stack gap="md">
				<Title order={1}>Analytics Overview</Title>
				<Text>Global analytics across all links</Text>
			</Stack>
		</Container>
	);
}
