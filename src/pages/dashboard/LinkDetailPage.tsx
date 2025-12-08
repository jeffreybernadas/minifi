import { Title, Text, Stack } from "@mantine/core";
import { useParams } from "react-router-dom";

export default function LinkDetailPage() {
	const { id } = useParams();

	return (
		<Stack gap="md">
			<Title order={1}>Link Details</Title>
			<Text>
				Link details + edit modal + QR code + analytics summary for link: {id}
			</Text>
		</Stack>
	);
}
