import Keycloak from "keycloak-js";
import {
	VITE_KEYCLOAK_URL,
	VITE_KEYCLOAK_REALM,
	VITE_KEYCLOAK_CLIENT_ID,
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
 */
export const getUserFromToken = (): AuthUser | null => {
	if (!keycloak.authenticated || !keycloak.tokenParsed) {
		return null;
	}

	const token = keycloak.tokenParsed;
	return {
		id: keycloak.subject ?? "",
		email: (token.email as string) ?? "",
		name: (token.name as string) ?? "",
		username: (token.preferred_username as string) ?? "",
		roles: token.realm_access?.roles ?? [],
	};
};

/**
 * Check if user has a specific role
 */
export const hasRole = (role: string): boolean => {
	return keycloak.hasRealmRole(role);
};

/**
 * Check if user is an admin
 */
export const isAdmin = (): boolean => {
	return hasRole("admin") || hasRole("superadmin");
};
