import { Stack, Text, Title } from "@mantine/core";

export default function ProfilePage() {
	return (
		<Stack gap="md">
			<Title order={1}>Profile</Title>
			<Text>User profile: avatar upload, name, email, phone number</Text>
		</Stack>
	);
}
