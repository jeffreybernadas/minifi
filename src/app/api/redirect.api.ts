import { publicApi } from "./base.api";

/**
 * Scan status from backend
 */
export type ScanStatus =
	| "PENDING"
	| "SAFE"
	| "SUSPICIOUS"
	| "MALICIOUS"
	| "ADULT_CONTENT";

/**
 * Warning info for non-SAFE links
 */
export interface RedirectWarning {
	isSafe?: boolean;
	status: ScanStatus;
	scanScore?: number | null;
	threats?: string[];
	reasoning?: string;
	recommendations?: string;
	scannedAt?: string | null;
}

/**
 * Response from GET /v1/redirect/:code
 */
export interface RedirectResponse {
	requiresPassword: boolean;
	originalUrl?: string;
	shortCode?: string;
	code?: string;
	warning?: RedirectWarning;
}

/**
 * Response from POST /v1/redirect/:code/verify
 */
export interface VerifyPasswordResponse {
	success: boolean;
	originalUrl?: string;
	shortCode?: string;
	warning?: RedirectWarning;
}

/**
 * Payload for password verification
 */
export interface VerifyPasswordDto {
	password: string;
}

/**
 * Redirect API slice
 * Public endpoints - no auth required
 * Uses publicApi to avoid re-auth on 403 (business logic error, not auth error)
 */
export const redirectApi = publicApi.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Get redirect info for a short code
		 * Returns originalUrl or indicates password requirement
		 */
		getRedirectInfo: builder.query<RedirectResponse, string>({
			query: (code) => ({
				url: `/redirect/${code}`,
				method: "GET",
			}),
		}),

		/**
		 * Verify password for protected link
		 */
		verifyPassword: builder.mutation<
			VerifyPasswordResponse,
			{ code: string; password: string }
		>({
			query: ({ code, password }) => ({
				url: `/redirect/${code}/verify`,
				method: "POST",
				body: { password },
			}),
		}),
	}),
});

export const { useGetRedirectInfoQuery, useVerifyPasswordMutation } =
	redirectApi;
