import type {
	AdminEditLinkDto,
	AdminLink,
	AdminLinkDetail,
	AdminLinkFilterDto,
	AdminStats,
	AdminUser,
	AdminUserDetail,
	AdminUserFilterDto,
	BlockLinkDto,
	BlockUserDto,
	ChangeTierDto,
	PaginatedResponse,
	PlatformAnalytics,
	SecurityOverview,
} from "@/types";
import { baseApi } from "./base.api";

/**
 * Admin API slice - Platform management endpoints
 * All endpoints require admin role
 */
export const adminApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// ============ PLATFORM STATS ============

		/**
		 * Get platform-wide statistics
		 */
		getAdminStats: builder.query<AdminStats, void>({
			query: () => "/admin/stats",
			providesTags: ["Admin"],
		}),

		/**
		 * Get platform analytics (30-day trends)
		 */
		getAdminAnalytics: builder.query<PlatformAnalytics, void>({
			query: () => "/admin/analytics",
			providesTags: ["Admin"],
		}),

		/**
		 * Get security overview
		 */
		getSecurityOverview: builder.query<SecurityOverview, void>({
			query: () => "/admin/security",
			providesTags: ["Admin"],
		}),

		// ============ USER MANAGEMENT ============

		/**
		 * Get paginated list of all users
		 */
		getAdminUsers: builder.query<
			PaginatedResponse<AdminUser>,
			AdminUserFilterDto | undefined
		>({
			query: (filters) => ({
				url: "/admin/users",
				method: "GET",
				params: filters ?? {},
			}),
			providesTags: (result) =>
				result
					? [
							...result.data.map(({ id }) => ({
								type: "AdminUser" as const,
								id,
							})),
							{ type: "AdminUser", id: "LIST" },
						]
					: [{ type: "AdminUser", id: "LIST" }],
		}),

		/**
		 * Get user details
		 */
		getAdminUser: builder.query<AdminUserDetail, string>({
			query: (id) => `/admin/users/${id}`,
			providesTags: (_result, _error, id) => [{ type: "AdminUser", id }],
		}),

		/**
		 * Change user subscription tier
		 */
		changeTier: builder.mutation<
			AdminUserDetail,
			{ id: string; data: ChangeTierDto }
		>({
			query: ({ id, data }) => ({
				url: `/admin/users/${id}/tier`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "AdminUser", id },
				{ type: "AdminUser", id: "LIST" },
				"Admin",
			],
		}),

		/**
		 * Block a user
		 */
		blockUser: builder.mutation<
			AdminUserDetail,
			{ id: string; data: BlockUserDto }
		>({
			query: ({ id, data }) => ({
				url: `/admin/users/${id}/block`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "AdminUser", id },
				{ type: "AdminUser", id: "LIST" },
				"Admin",
			],
		}),

		/**
		 * Unblock a user
		 */
		unblockUser: builder.mutation<AdminUserDetail, string>({
			query: (id) => ({
				url: `/admin/users/${id}/unblock`,
				method: "PATCH",
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: "AdminUser", id },
				{ type: "AdminUser", id: "LIST" },
				"Admin",
			],
		}),

		/**
		 * Delete a user permanently
		 */
		deleteUser: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({
				url: `/admin/users/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: "AdminUser", id },
				{ type: "AdminUser", id: "LIST" },
				"Admin",
			],
		}),

		// ============ LINK MANAGEMENT ============

		/**
		 * Get paginated list of all links
		 */
		getAdminLinks: builder.query<
			PaginatedResponse<AdminLink>,
			AdminLinkFilterDto | undefined
		>({
			query: (filters) => ({
				url: "/admin/links",
				method: "GET",
				params: filters ?? {},
			}),
			providesTags: (result) =>
				result
					? [
							...result.data.map(({ id }) => ({
								type: "AdminLink" as const,
								id,
							})),
							{ type: "AdminLink", id: "LIST" },
						]
					: [{ type: "AdminLink", id: "LIST" }],
		}),

		/**
		 * Get link details
		 */
		getAdminLink: builder.query<AdminLinkDetail, string>({
			query: (id) => `/admin/links/${id}`,
			providesTags: (_result, _error, id) => [{ type: "AdminLink", id }],
		}),

		/**
		 * Edit a link
		 */
		editAdminLink: builder.mutation<
			AdminLinkDetail,
			{ id: string; data: AdminEditLinkDto }
		>({
			query: ({ id, data }) => ({
				url: `/admin/links/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "AdminLink", id },
				{ type: "AdminLink", id: "LIST" },
			],
		}),

		/**
		 * Block a link
		 */
		blockLink: builder.mutation<
			AdminLinkDetail,
			{ id: string; data: BlockLinkDto }
		>({
			query: ({ id, data }) => ({
				url: `/admin/links/${id}/block`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "AdminLink", id },
				{ type: "AdminLink", id: "LIST" },
				"Admin",
			],
		}),

		/**
		 * Unblock a link
		 */
		unblockLink: builder.mutation<AdminLinkDetail, string>({
			query: (id) => ({
				url: `/admin/links/${id}/unblock`,
				method: "PATCH",
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: "AdminLink", id },
				{ type: "AdminLink", id: "LIST" },
				"Admin",
			],
		}),

		/**
		 * Queue link for security rescan
		 */
		rescanAdminLink: builder.mutation<AdminLinkDetail, string>({
			query: (id) => ({
				url: `/admin/links/${id}/rescan`,
				method: "POST",
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: "AdminLink", id },
				"Admin",
			],
		}),

		/**
		 * Delete a link permanently
		 */
		deleteAdminLink: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({
				url: `/admin/links/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: "AdminLink", id },
				{ type: "AdminLink", id: "LIST" },
				"Admin",
			],
		}),
	}),
});

export const {
	// Platform stats
	useGetAdminStatsQuery,
	useGetAdminAnalyticsQuery,
	useGetSecurityOverviewQuery,
	// User management
	useGetAdminUsersQuery,
	useGetAdminUserQuery,
	useChangeTierMutation,
	useBlockUserMutation,
	useUnblockUserMutation,
	useDeleteUserMutation,
	// Link management
	useGetAdminLinksQuery,
	useGetAdminLinkQuery,
	useEditAdminLinkMutation,
	useBlockLinkMutation,
	useUnblockLinkMutation,
	useRescanAdminLinkMutation,
	useDeleteAdminLinkMutation,
} = adminApi;
