import { useEffect } from "react";
import "@mantine/core/styles.css";
import {
	MantineProvider,
	Center,
	Loader,
	Text,
	Stack,
	Button,
	Group,
} from "@mantine/core";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
	keycloak,
	keycloakInitOptions,
	getUserFromToken,
	setInitialized,
	setAuthenticated,
	clearAuth,
} from "@/features/auth";
import { toggleColorScheme } from "@/features/theme";

function App() {
	const dispatch = useAppDispatch();
	const { isInitialized, isAuthenticated, user } = useAppSelector(
		(state) => state.auth,
	);
	const { colorScheme } = useAppSelector((state) => state.theme);

	useEffect(() => {
		const initKeycloak = async () => {
			try {
				const authenticated = await keycloak.init(keycloakInitOptions);

				if (authenticated) {
					const userInfo = getUserFromToken();
					if (userInfo) {
						dispatch(setAuthenticated(userInfo));
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
			<MantineProvider forceColorScheme={resolvedScheme}>
				<Center h="100vh">
					<Loader size="lg" />
				</Center>
			</MantineProvider>
		);
	}

	// Temporary UI to demonstrate auth and theme state
	return (
		<MantineProvider forceColorScheme={resolvedScheme}>
			<Center h="100vh">
				<Stack align="center" gap="md">
					<Button onClick={() => dispatch(toggleColorScheme())}>
						Toggle Theme ({colorScheme})
					</Button>

					{isAuthenticated && user ? (
						<>
							<Text size="xl">Welcome, {user.name || user.username}!</Text>
							<Text c="dimmed">{user.email}</Text>
							<Text size="sm" c="dimmed">
								Roles: {user.roles.join(", ") || "none"}
							</Text>
							<Group>
								<Button variant="outline" onClick={() => keycloak.logout()}>
									Logout
								</Button>
							</Group>
						</>
					) : (
						<>
							<Text size="xl">Not authenticated</Text>
							<Group>
								<Button onClick={() => keycloak.login()}>Login</Button>
								<Button variant="outline" onClick={() => keycloak.register()}>
									Register
								</Button>
							</Group>
						</>
					)}
				</Stack>
			</Center>
		</MantineProvider>
	);
}

export default App;
