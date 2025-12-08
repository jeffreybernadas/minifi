import { Stack, Text, Title } from "@mantine/core";

export default function SettingsPage() {
	return (
		<Stack gap="md">
			<Title order={1}>Settings</Title>
			<Text>Profile, notifications, and subscription settings</Text>
		</Stack>
	);
}
