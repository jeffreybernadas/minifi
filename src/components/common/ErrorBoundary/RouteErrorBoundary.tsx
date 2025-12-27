import { Button, Center, Code, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconHome, IconRefresh } from "@tabler/icons-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

/**
 * RouteErrorBoundary Component
 *
 * Error boundary for React Router routes.
 * Catches errors during route loading (dynamic imports) and rendering.
 * Uses React Router's useRouteError hook.
 */
export function RouteErrorBoundary() {
	const error = useRouteError();

	const handleRetry = () => {
		window.location.reload();
	};

	const handleGoHome = () => {
		window.location.href = "/";
	};

	// Get error message based on error type
	let errorMessage = "An unexpected error occurred";
	let errorDetails: string | null = null;

	if (isRouteErrorResponse(error)) {
		// React Router error response (404, etc.)
		errorMessage = error.statusText || `Error ${error.status}`;
		errorDetails = error.data?.message || null;
	} else if (error instanceof Error) {
		errorMessage = error.message;
		// Check for dynamic import errors
		if (error.message.includes("dynamically imported module")) {
			errorMessage = "Failed to load page";
			errorDetails =
				"This might be due to a network issue or the app was updated. Try refreshing.";
		}
	}

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
						{errorDetails || errorMessage}
					</Text>
				</Stack>

				{errorMessage && !errorDetails && (
					<Code block w="100%" style={{ whiteSpace: "pre-wrap" }}>
						{errorMessage}
					</Code>
				)}

				<Group>
					<Button
						leftSection={<IconRefresh size={16} />}
						onClick={handleRetry}
						variant="filled"
					>
						Refresh Page
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
