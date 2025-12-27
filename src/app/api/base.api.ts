import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
	type BaseQueryFn,
	createApi,
	type FetchArgs,
	type FetchBaseQueryError,
	fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { IconWifiOff } from "@tabler/icons-react";
import { createElement } from "react";
import { BlockedUserModalContent } from "@/components/common/BlockedUserModal";
import { VITE_API_BASE_URL } from "@/constants/env.constant";
import { clearAuth } from "@/features/auth/auth.slice";
import { keycloak } from "@/features/auth/keycloak";

/**
 * Error code returned by backend when user is blocked
 */
const BLOCKED_USER_ERROR_CODE = "USER_BLOCKED";

/**
 * Backend error response structure
 */
interface BackendErrorResponse {
	success: boolean;
	statusCode: number;
	error?: {
		code: string;
		message: string;
	};
}

/**
 * Check if error response indicates a blocked user
 * Backend returns: { success, statusCode, error: { code, message } }
 */
const isBlockedUserError = (error: FetchBaseQueryError): boolean => {
	if (error.status === 403 && error.data) {
		const data = error.data as BackendErrorResponse;
		return data.error?.code === BLOCKED_USER_ERROR_CODE;
	}
	return false;
};

/**
 * Get blocked reason from error response
 */
const getBlockedReason = (error: FetchBaseQueryError): string => {
	if (error.data) {
		const data = error.data as BackendErrorResponse;
		return data.error?.message || "Your account has been suspended.";
	}
	return "Your account has been suspended.";
};

/**
 * Track if blocked modal is already shown to prevent duplicate modals
 */
let isBlockedModalShown = false;

/**
 * Show blocked user modal using Mantine's imperative modals API
 * Modal cannot be closed - only option is to log out
 */
const showBlockedUserModal = (reason: string): void => {
	// Prevent showing multiple modals
	if (isBlockedModalShown) return;
	isBlockedModalShown = true;

	modals.open({
		modalId: "blocked-user",
		title: "Account Suspended",
		centered: true,
		closeOnClickOutside: false,
		closeOnEscape: false,
		withCloseButton: false,
		children: createElement(BlockedUserModalContent, {
			reason,
			onLogout: () => modals.close("blocked-user"),
		}),
	});
};

/**
 * Response handler to extract 'data' field from backend wrapper
 * For paginated responses (has meta), returns { data, meta }
 * For non-paginated responses, returns just the data
 */
const responseHandler = async (response: Response) => {
	const json = await response.json();
	// For paginated responses, preserve both data and meta
	if (json.data && json.meta) {
		return { data: json.data, meta: json.meta };
	}
	// For non-paginated responses, return just the data
	return json.data ?? json;
};

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
	responseHandler,
});

/**
 * Public base query - no auth headers, no re-auth on 403
 * Used for public endpoints like redirect where 403 is a business error, not auth error
 */
export const publicBaseQuery = fetchBaseQuery({
	baseUrl: `${VITE_API_BASE_URL}api/v1`,
	responseHandler,
});

/**
 * Base query with re-authentication on 401/403
 * - Single retry attempt after token refresh
 * - Shows blocked user modal if user is blocked
 * - Logs out and redirects if refresh fails or retry fails
 */
const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	let result = await baseQuery(args, api, extraOptions);

	// Handle network errors (offline, connection refused, etc.)
	if (result.error && result.error.status === "FETCH_ERROR") {
		notifications.show({
			id: "network-error",
			title: "Network Error",
			message: "Please check your internet connection and try again.",
			color: "red",
			icon: createElement(IconWifiOff, { size: 16 }),
			autoClose: 5000,
		});
		return result;
	}

	// Check for blocked user error first - show modal instead of logout
	if (result.error && isBlockedUserError(result.error)) {
		const reason = getBlockedReason(result.error);
		showBlockedUserModal(reason);
		return result;
	}

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

				// Check if retry returned blocked user error
				if (result.error && isBlockedUserError(result.error)) {
					const reason = getBlockedReason(result.error);
					showBlockedUserModal(reason);
					return result;
				}

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
		"Admin",
		"AdminUser",
		"AdminLink",
	],
	endpoints: () => ({}),
});

/**
 * Public API slice - for endpoints that don't require auth
 * Uses publicBaseQuery which doesn't trigger re-auth on 403
 * (403 on public endpoints means business logic error, not auth error)
 */
export const publicApi = createApi({
	reducerPath: "publicApi",
	baseQuery: publicBaseQuery,
	endpoints: () => ({}),
});
