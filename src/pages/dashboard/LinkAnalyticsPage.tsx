import { Container, Title, Text, Stack } from "@mantine/core";
import { useParams } from "react-router-dom";

export default function LinkAnalyticsPage() {
	const { id } = useParams();

	return (
		<Container size="lg" py="xl">
			<Stack gap="md">
				<Title order={1}>Link Analytics</Title>
				<Text>Detailed analytics for link: {id}</Text>
			</Stack>
		</Container>
	);
}
