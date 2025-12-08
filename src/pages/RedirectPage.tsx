import { Title, Text, Stack, Button } from "@mantine/core";
import { useParams, Link } from "react-router-dom";

export default function RedirectPage() {
	const { code } = useParams();

	return (
		<Stack gap="md">
			<Title order={1}>Redirect Page</Title>
			<Text>Handling redirect for code: {code}</Text>

			<Button component={Link} to="/" mt="xl">
				Back to Landing
			</Button>
		</Stack>
	);
}
