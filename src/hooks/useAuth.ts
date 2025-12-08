import { useAppSelector } from "@/app/hooks";
import type { RootState } from "@/app/store";
import type { AuthState } from "@/features/auth";

export interface UseAuthReturn extends AuthState {
	// Subscription tier checks (from profile API)
	userType: "GUEST" | "FREE" | "PRO" | null;
	isPro: boolean;
	isFree: boolean;
	isGuest: boolean;

	// Admin check (from profile API - synced from Keycloak)
	isAdmin: boolean;

	// Role checker utility
	hasRole: (role: string) => boolean;
}

/**
 * Centralized authentication hook
 *
 * Returns all auth-related state and computed properties:
 * - isAuthenticated, isInitialized, user (from Redux auth state)
 * - isAdmin, userType, isPro, isFree, isGuest (from profile API cache)
 * - hasRole(role) utility function
 *
 * Usage:
 * ```
 * const { isAuthenticated, isAdmin, isPro, hasRole } = useAuth();
 *
 * if (isAdmin) { ... }
 * if (isPro) { ... }
 * if (hasRole("moderator")) { ... }
 * ```
 */
export const useAuth = (): UseAuthReturn => {
	// Get auth state from Redux
	const auth = useAppSelector((state) => state.auth);

	// Get profile data from RTK Query cache
	const profile = useAppSelector((state: RootState) => {
		const cacheEntry = state.api.queries["getUserProfile(undefined)"];
		return cacheEntry?.status === "fulfilled"
			? (cacheEntry.data as {
					isAdmin: boolean;
					userType: "GUEST" | "FREE" | "PRO";
				})
			: null;
	});

	// Extract values with fallbacks
	const userType = profile?.userType ?? null;
	const isAdmin = profile?.isAdmin ?? false;

	// Computed subscription tier checks
	const isPro = userType === "PRO";
	const isFree = userType === "FREE";
	const isGuest = userType === "GUEST";

	// Role checker utility
	const hasRole = (role: string): boolean => {
		return auth.user?.roles.includes(role) ?? false;
	};

	return {
		...auth,
		userType,
		isAdmin,
		isPro,
		isFree,
		isGuest,
		hasRole,
	};
};
