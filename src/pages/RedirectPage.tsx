import { Button, Stack, Text, Title } from "@mantine/core";
import { Link, useParams } from "react-router-dom";

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
