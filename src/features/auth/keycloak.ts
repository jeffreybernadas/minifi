import Keycloak from "keycloak-js";
import {
	VITE_KEYCLOAK_CLIENT_ID,
	VITE_KEYCLOAK_REALM,
	VITE_KEYCLOAK_URL,
} from "@/constants/env.constant";
import type { AuthUser } from "./auth.slice";

/**
 * Keycloak instance configuration
 *
 * This is a singleton instance used throughout the application.
 * Initialize it in App.tsx before rendering the app.
 */
export const keycloak = new Keycloak({
	url: VITE_KEYCLOAK_URL,
	realm: VITE_KEYCLOAK_REALM,
	clientId: VITE_KEYCLOAK_CLIENT_ID,
});

/**
 * Keycloak initialization options
 */
export const keycloakInitOptions: Keycloak.KeycloakInitOptions = {
	onLoad: "check-sso",
	silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
	pkceMethod: "S256",
	checkLoginIframe: false,
};

/**
 * Extract user info from Keycloak token
 * Combines realm roles and client-specific roles
 *
 * Used during initial authentication to populate Redux state.
 * For checking roles/admin status in components, use hooks from @/hooks.
 */
export const getUserFromToken = (): AuthUser | null => {
	if (!keycloak.authenticated || !keycloak.tokenParsed) {
		return null;
	}

	const token = keycloak.tokenParsed;

	// Combine realm roles and client-specific roles
	const realmRoles = token.realm_access?.roles ?? [];
	const clientRoles =
		(
			token.resource_access?.[VITE_KEYCLOAK_CLIENT_ID] as {
				roles?: string[];
			}
		)?.roles ?? [];
	const allRoles = [...new Set([...realmRoles, ...clientRoles])]; // Deduplicate

	return {
		id: keycloak.subject ?? "",
		email: (token.email as string) ?? "",
		name: (token.name as string) ?? "",
		username: (token.preferred_username as string) ?? "",
		roles: allRoles,
		picture: (token.picture as string) ?? "",
	};
};
