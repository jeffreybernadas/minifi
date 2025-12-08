import { Title, Text, Stack, Button, Group } from "@mantine/core";
import { Link } from "react-router-dom";

export default function LandingPage() {
	return (
		<Stack gap="md">
			<Title order={1}>Landing Page</Title>
			<Text>Public landing page with guest link shortener</Text>

			<Group mt="xl">
				<Button component={Link} to="/r/test123">
					Test Redirect (nprogress)
				</Button>
				<Button component={Link} to="/dashboard" variant="outline">
					Go to Dashboard
				</Button>
			</Group>
		</Stack>
	);
}
