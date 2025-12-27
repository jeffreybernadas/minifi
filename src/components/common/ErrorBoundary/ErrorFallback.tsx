import { Button, Center, Code, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconHome, IconRefresh } from "@tabler/icons-react";

export interface ErrorFallbackProps {
	/**
	 * The error that was caught
	 */
	error: Error | null;

	/**
	 * Callback to reset the error state and retry
	 */
	onReset: () => void;
}

/**
 * ErrorFallback Component
 *
 * Fallback UI displayed when an error is caught by ErrorBoundary.
 * Provides options to retry or navigate home.
 */
export function ErrorFallback({
	error,
	onReset,
}: Readonly<ErrorFallbackProps>) {
	const handleGoHome = () => {
		window.location.href = "/";
	};

	return (
		<Center h="100vh" p="xl">
			<Stack align="center" gap="lg" maw={500}>
				<IconAlertTriangle
					size={64}
					color="var(--mantine-color-red-6)"
					stroke={1.5}
				/>

				<Stack align="center" gap="xs">
					<Title order={2}>Something went wrong</Title>
					<Text c="dimmed" ta="center">
						An unexpected error occurred. You can try again or return to the
						home page.
					</Text>
				</Stack>

				{error?.message && (
					<Code block w="100%" style={{ whiteSpace: "pre-wrap" }}>
						{error.message}
					</Code>
				)}

				<Group>
					<Button
						leftSection={<IconRefresh size={16} />}
						onClick={onReset}
						variant="filled"
					>
						Try Again
					</Button>
					<Button
						leftSection={<IconHome size={16} />}
						onClick={handleGoHome}
						variant="light"
					>
						Go Home
					</Button>
				</Group>
			</Stack>
		</Center>
	);
}
