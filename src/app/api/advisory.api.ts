import type {
	Advisory,
	AdvisoryFilterDto,
	AdvisoryListItem,
	CreateAdvisoryDto,
	PaginatedResponse,
	UpdateAdvisoryDto,
} from "@/types";
import { baseApi } from "./base.api";

/**
 * Advisory API slice
 * Admin endpoints for CRUD operations
 * Public endpoints for getting active advisories and dismissing
 */
export const advisoryApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// ============ ADMIN ENDPOINTS ============

		/**
		 * Get paginated list of all advisories (admin)
		 */
		getAdvisories: builder.query<
			PaginatedResponse<AdvisoryListItem>,
			AdvisoryFilterDto | undefined
		>({
			query: (filters) => ({
				url: "/admin/advisories",
				method: "GET",
				params: filters ?? {},
			}),
			providesTags: (result) =>
				result
					? [
							...result.data.map(({ id }) => ({
								type: "Advisory" as const,
								id,
							})),
							{ type: "Advisory", id: "LIST" },
						]
					: [{ type: "Advisory", id: "LIST" }],
		}),

		/**
		 * Get single advisory details (admin)
		 * Note: Currently unused but reserved for future detail view or edit modal pre-fetch
		 */
		getAdvisory: builder.query<Advisory, string>({
			query: (id) => `/admin/advisories/${id}`,
			providesTags: (_result, _error, id) => [{ type: "Advisory", id }],
		}),

		/**
		 * Create new advisory (admin)
		 */
		createAdvisory: builder.mutation<Advisory, CreateAdvisoryDto>({
			query: (data) => ({
				url: "/admin/advisories",
				method: "POST",
				body: data,
			}),
			invalidatesTags: [{ type: "Advisory", id: "LIST" }],
		}),

		/**
		 * Update advisory (admin)
		 */
		updateAdvisory: builder.mutation<
			Advisory,
			{ id: string; data: UpdateAdvisoryDto }
		>({
			query: ({ id, data }) => ({
				url: `/admin/advisories/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "Advisory", id },
				{ type: "Advisory", id: "LIST" },
			],
		}),

		/**
		 * Publish advisory (admin)
		 */
		publishAdvisory: builder.mutation<Advisory, string>({
			query: (id) => ({
				url: `/admin/advisories/${id}/publish`,
				method: "PATCH",
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: "Advisory", id },
				{ type: "Advisory", id: "LIST" },
				{ type: "Advisory", id: "ACTIVE" },
			],
		}),

		/**
		 * Archive advisory (admin)
		 */
		archiveAdvisory: builder.mutation<Advisory, string>({
			query: (id) => ({
				url: `/admin/advisories/${id}/archive`,
				method: "PATCH",
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: "Advisory", id },
				{ type: "Advisory", id: "LIST" },
				{ type: "Advisory", id: "ACTIVE" },
			],
		}),

		/**
		 * Delete advisory (admin)
		 */
		deleteAdvisory: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({
				url: `/admin/advisories/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: [
				{ type: "Advisory", id: "LIST" },
				{ type: "Advisory", id: "ACTIVE" },
			],
		}),

		// ============ PUBLIC ENDPOINTS ============

		/**
		 * Get active advisories for current user
		 * Returns advisories that are published, not expired, and not dismissed
		 */
		getActiveAdvisories: builder.query<Advisory[], void>({
			query: () => "/advisories/active",
			// Backend wraps arrays with { data, meta: { count } }, extract just the array
			transformResponse: (
				response: { data: Advisory[]; meta: { count: number } } | Advisory[],
			) => {
				if (Array.isArray(response)) {
					return response;
				}
				return response.data;
			},
			providesTags: [{ type: "Advisory", id: "ACTIVE" }],
		}),

		/**
		 * Dismiss an advisory for current user
		 */
		dismissAdvisory: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({
				url: `/advisories/${id}/dismiss`,
				method: "POST",
			}),
			invalidatesTags: [{ type: "Advisory", id: "ACTIVE" }],
		}),
	}),
});

export const {
	// Admin hooks
	useGetAdvisoriesQuery,
	useGetAdvisoryQuery,
	useCreateAdvisoryMutation,
	useUpdateAdvisoryMutation,
	usePublishAdvisoryMutation,
	useArchiveAdvisoryMutation,
	useDeleteAdvisoryMutation,
	// Public hooks
	useGetActiveAdvisoriesQuery,
	useDismissAdvisoryMutation,
} = advisoryApi;
