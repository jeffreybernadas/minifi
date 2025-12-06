/**
 * Returns the value of a specified env variable key
 * @param {string} key The name of the env variable to retrieve
 * @param {string} defaultValue Default value (not the value from env variables)
 * @returns {string} Value of the env variable
 */
const getEnv = (key: string, defaultValue?: string): string => {
	const value = import.meta.env[key] ?? defaultValue;
	if (!value) {
		throw new Error(`Environment variable ${key} is not defined`);
	}
	return value;
};

export const VITE_API_BASE_URL = getEnv(
	"VITE_API_BASE_URL",
	"http://localhost:3001",
);
export const VITE_WS_URL = getEnv("VITE_WS_URL", "http://localhost:3001");
export const VITE_KEYCLOAK_URL = getEnv(
	"VITE_KEYCLOAK_URL",
	"http://localhost:8080",
);
export const VITE_KEYCLOAK_REALM = getEnv("VITE_KEYCLOAK_REALM", "minifi");
export const VITE_KEYCLOAK_CLIENT_ID = getEnv(
	"VITE_KEYCLOAK_CLIENT_ID",
	"minifi-frontend",
);
export const VITE_APP_URL = getEnv("VITE_APP_URL", "http://localhost:3000");
export const NODE_ENV = getEnv("NODE_ENV", "development");
