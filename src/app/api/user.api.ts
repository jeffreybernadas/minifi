import { baseApi } from "./base.api";

/**
 * User Profile Types
 */
export interface UserProfile {
	// Keycloak fields (read-only)
	sub: string;
	email: string;
	email_verified: boolean;
	preferred_username?: string;
	given_name?: string;
	family_name?: string;
	name?: string;
	picture?: string;

	// App-specific fields (editable)
	emailNotificationsEnabled: boolean;
	phoneNumber?: string | null;
	avatarUrl?: string | null;
	address?: string | null;

	// Subscription tier & role
	userType: "GUEST" | "FREE" | "PRO";
	isAdmin: boolean;

	// Metadata
	createdAt: string;
	updatedAt: string;
}

export interface UpdateUserPreferencesDto {
	emailNotificationsEnabled?: boolean;
	phoneNumber?: string;
	avatarUrl?: string;
	address?: string;
}

/**
 * User API slice
 */
export const userApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Get current user profile
		 * Merges Keycloak data with local DB data
		 */
		getUserProfile: builder.query<UserProfile, void>({
			query: () => "/users/profile",
			providesTags: ["User"],
		}),

		/**
		 * Update user preferences (app-specific fields only)
		 * Keycloak fields cannot be updated here
		 */
		updateUserPreferences: builder.mutation<
			UpdateUserPreferencesDto,
			UpdateUserPreferencesDto
		>({
			query: (body) => ({
				url: "/users/preferences",
				method: "PATCH",
				body,
			}),
			invalidatesTags: ["User"],
		}),
	}),
});

export const { useGetUserProfileQuery, useUpdateUserPreferencesMutation } =
	userApi;
