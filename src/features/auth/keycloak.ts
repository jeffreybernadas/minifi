import Keycloak from "keycloak-js";
import {
	VITE_KEYCLOAK_URL,
	VITE_KEYCLOAK_REALM,
	VITE_KEYCLOAK_CLIENT_ID,
} from "@/constants/env.constant";

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
	checkLoginIframe: false, // Disable iframe check for better compatibility
};
