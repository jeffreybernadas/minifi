import { useEffect } from "react";
import "@mantine/core/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import { Center, Loader, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { RouterProvider } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ErrorBoundary } from "@/components/common";
import {
	clearAuth,
	getUserFromToken,
	keycloak,
	keycloakInitOptions,
	setAuthenticated,
	setInitialized,
} from "@/features/auth";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { NavigationProgress, router } from "@/router";
import { theme } from "@/styles/theme";

function App() {
	const dispatch = useAppDispatch();
	const { isInitialized } = useAppSelector((state) => state.auth);
	const { colorScheme } = useAppSelector((state) => state.theme);

	useEffect(() => {
		const initKeycloak = async () => {
			try {
				const authenticated = await keycloak.init(keycloakInitOptions);

				if (authenticated) {
					const userInfo = getUserFromToken();
					if (userInfo) {
						dispatch(setAuthenticated(userInfo));

						// Connect socket - backend auto-joins user:${userId} room on connection
						connectSocket();
					}
				}

				// Set up token refresh handler
				keycloak.onTokenExpired = () => {
					keycloak.updateToken(30).catch(() => {
						dispatch(clearAuth());
					});
				};

				// Handle auth state changes (logout from another tab, etc.)
				keycloak.onAuthLogout = () => {
					disconnectSocket();
					dispatch(clearAuth());
				};

				dispatch(setInitialized(true));
			} catch (error) {
				console.error("Keycloak initialization failed:", error);
				dispatch(setInitialized(true));
			}
		};

		initKeycloak();
	}, [dispatch]);

	// Resolve "auto" to actual scheme for forceColorScheme
	const resolvedScheme =
		colorScheme === "auto"
			? window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
			: colorScheme;

	// Show loading while Keycloak initializes
	if (!isInitialized) {
		return (
			<MantineProvider theme={theme} forceColorScheme={resolvedScheme}>
				<Center h="100vh">
					<Loader size="lg" />
				</Center>
			</MantineProvider>
		);
	}

	return (
		<ErrorBoundary>
			<MantineProvider theme={theme} forceColorScheme={resolvedScheme}>
				<ModalsProvider>
					<Notifications position="top-right" zIndex={1000} />
					<NavigationProgress />
					<RouterProvider router={router} />
				</ModalsProvider>
			</MantineProvider>
		</ErrorBoundary>
	);
}

export default App;
