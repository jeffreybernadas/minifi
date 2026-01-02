import { Container, Stack, Text, Title } from "@mantine/core";

export default function SettingsPage() {
	return (
		<Container size="lg" py="xl">
			<Stack gap="md">
				<Title order={1}>Settings</Title>
				<Text>Profile, notifications, and subscription settings</Text>
			</Stack>
		</Container>
	);
}
