import { Title, Text, Stack } from "@mantine/core";

export default function TagsPage() {
	return (
		<Stack gap="md">
			<Title order={1}>Tags</Title>
			<Text>Tag list with create/edit/delete modals</Text>
		</Stack>
	);
}
