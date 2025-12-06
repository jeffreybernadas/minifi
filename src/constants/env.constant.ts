/**
 * Returns the value of a specified env variable key
 * @param {string} key The name of the env variable to retrieve
 * @param {string} defaultValue Default value (not the value from env variables)
 * @returns {string | undefined} Value of the env variables
 */
const getEnv = (key: string, defaultValue?: string): string => {
	const value = import.meta.env[key] ?? defaultValue;
	if (!value) {
		throw new Error(`Environment variable ${key} is not defined`);
	}
	return value;
};

export const VITE_API_BASE_URL = getEnv("VITE_API_BASE_URL");
