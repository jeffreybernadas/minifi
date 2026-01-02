import {
	Anchor,
	Box,
	Button,
	Divider,
	Paper,
	Stack,
	Text,
	ThemeIcon,
} from "@mantine/core";
import { IconBan, IconMail } from "@tabler/icons-react";
import { keycloak } from "@/features/auth/keycloak";

export interface BlockedUserModalContentProps {
	reason: string;
	onLogout?: () => void;
}

/**
 * Content for the blocked user modal
 * Displays suspension message with reason and logout button
 */
export function BlockedUserModalContent({
	reason,
	onLogout,
}: Readonly<BlockedUserModalContentProps>) {
	const handleLogout = () => {
		onLogout?.();
		keycloak.logout();
	};

	return (
		<Stack gap="lg" py="md">
			{/* Icon and Title */}
			<Stack align="center" gap="sm">
				<ThemeIcon size={72} radius="xl" color="red" variant="light">
					<IconBan size={40} />
				</ThemeIcon>
				<Text ta="center" size="xl" fw={600}>
					Account Suspended
				</Text>
				<Text ta="center" c="dimmed" size="sm">
					Your access to Minifi has been restricted
				</Text>
			</Stack>

			<Divider />

			{/* Reason Section */}
			<Box>
				<Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={8}>
					Reason for Suspension
				</Text>
				<Paper
					withBorder
					p="md"
					radius="md"
					bg="var(--mantine-color-red-light)"
				>
					<Text size="sm" c="red.9">
						{reason}
					</Text>
				</Paper>
			</Box>

			{/* Contact Support */}
			<Paper withBorder p="md" radius="md">
				<Stack gap="xs">
					<Text size="sm" fw={500}>
						Need help?
					</Text>
					<Text size="xs" c="dimmed">
						If you believe this was a mistake or would like to appeal this
						decision, please contact the administrator.
					</Text>
					<Anchor
						href="mailto:jeffreybernadas0@gmail.com"
						size="sm"
						style={{ display: "flex", alignItems: "center", gap: 6 }}
					>
						<IconMail size={16} />
						jeffreybernadas0@gmail.com
					</Anchor>
				</Stack>
			</Paper>

			{/* Logout Button */}
			<Button
				fullWidth
				color="red"
				size="md"
				onClick={handleLogout}
				leftSection={<IconBan size={18} />}
			>
				Log Out
			</Button>
		</Stack>
	);
}
