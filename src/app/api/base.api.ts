import {
	type BaseQueryFn,
	createApi,
	type FetchArgs,
	type FetchBaseQueryError,
	fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { VITE_API_BASE_URL } from "@/constants/env.constant";
import { keycloak } from "@/features/auth/keycloak";
import { clearAuth } from "@/features/auth";

/**
 * Base query with authentication header injection
 * Backend wraps responses in: { success, statusCode, data, ... }
 * We need to extract the 'data' field
 */
const baseQuery = fetchBaseQuery({
	baseUrl: `${VITE_API_BASE_URL}api/v1`,
	prepareHeaders: (headers) => {
		const token = keycloak.token;
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		}
		return headers;
	},
	// Extract the 'data' field from backend response
	responseHandler: async (response) => {
		const json = await response.json();
		// Return just the data field, not the wrapper
		return json.data ?? json;
	},
});

/**
 * Base query with re-authentication on 401/403
 * - Single retry attempt after token refresh
 * - Logs out and redirects if refresh fails or retry fails
 */
const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	let result = await baseQuery(args, api, extraOptions);

	if (
		result.error &&
		(result.error.status === 401 || result.error.status === 403)
	) {
		// Try to refresh token (single attempt)
		try {
			const refreshed = await keycloak.updateToken(-1); // Force refresh
			if (refreshed) {
				// Retry the original request with new token
				result = await baseQuery(args, api, extraOptions);

				// If retry still fails with 401/403, logout
				if (
					result.error &&
					(result.error.status === 401 || result.error.status === 403)
				) {
					api.dispatch(clearAuth());
					keycloak.logout();
				}
			} else {
				// Refresh returned false - logout
				api.dispatch(clearAuth());
				keycloak.logout();
			}
		} catch (_) {
			// Refresh failed - logout
			api.dispatch(clearAuth());
			keycloak.logout();
		}
	}

	return result;
};

/**
 * RTK Query API slice - base configuration
 *
 * All API slices should inject endpoints into this base API
 * using `baseApi.injectEndpoints()`
 *
 * Tag types for cache invalidation:
 * - Link: URL links
 * - Tag: User tags for organizing links
 * - User: User profile data
 * - Subscription: User subscription status
 * - Chat: Chat rooms and messages
 * - Admin: Admin-specific data (users, links, stats)
 */
export const baseApi = createApi({
	reducerPath: "api",
	baseQuery: baseQueryWithReauth,
	tagTypes: [
		"Link",
		"LinkAnalytics",
		"Tag",
		"User",
		"Subscription",
		"Chat",
		"Message",
		"AdminStats",
		"AdminUser",
		"AdminLink",
	],
	endpoints: () => ({}),
});
