import { VITE_APP_URL } from "@/constants/env.constant";
import type {
	AnalyticsFilterDto,
	CreateGuestLinkDto,
	CreateLinkDto,
	Link,
	LinkAnalytics,
	LinkAnalyticsSummary,
	LinkFilterDto,
	PaginatedResponse,
	QrCodeResponse,
	UpdateLinkDto,
} from "@/types";
import { baseApi } from "./base.api";

/**
 * Helper to build short URL for display
 */
const buildShortUrl = (link: Link): string => {
	return (
		link.shortUrl || `${VITE_APP_URL}/r/${link.customAlias ?? link.shortCode}`
	);
};

/**
 * Transform link response to include shortUrl
 */
const transformLink = (link: Link): Link => ({
	...link,
	shortUrl: buildShortUrl(link),
});

/**
 * Links API slice - Full CRUD + Analytics
 */
export const linksApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// ============ LINK CRUD ============

		/**
		 * Create link (authenticated users)
		 */
		createLink: builder.mutation<Link, CreateLinkDto>({
			query: (body) => ({
				url: "/links",
				method: "POST",
				body,
			}),
			transformResponse: transformLink,
			invalidatesTags: ["Link"],
		}),

		/**
		 * Create guest link (no auth required)
		 */
		createGuestLink: builder.mutation<Link, CreateGuestLinkDto>({
			query: (body) => ({
				url: "/links/guest",
				method: "POST",
				body,
			}),
			transformResponse: transformLink,
		}),

		/**
		 * Get user's links with pagination and filters
		 */
		getLinks: builder.query<PaginatedResponse<Link>, LinkFilterDto | undefined>(
			{
				query: (filters) => ({
					url: "/links",
					method: "GET",
					params: filters ?? {},
				}),
				transformResponse: (response: PaginatedResponse<Link>) => ({
					...response,
					data: response.data.map(transformLink),
				}),
				providesTags: (result) =>
					result
						? [
								...result.data.map(({ id }) => ({ type: "Link" as const, id })),
								{ type: "Link", id: "LIST" },
							]
						: [{ type: "Link", id: "LIST" }],
			},
		),

		/**
		 * Get single link by ID
		 */
		getLink: builder.query<Link, string>({
			query: (id) => `/links/${id}`,
			transformResponse: transformLink,
			providesTags: (_result, _error, id) => [{ type: "Link", id }],
		}),

		/**
		 * Update link
		 */
		updateLink: builder.mutation<Link, { id: string; data: UpdateLinkDto }>({
			query: ({ id, data }) => ({
				url: `/links/${id}`,
				method: "PATCH",
				body: data,
			}),
			transformResponse: transformLink,
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "Link", id },
				{ type: "Link", id: "LIST" },
			],
		}),

		/**
		 * Archive link (soft delete)
		 */
		archiveLink: builder.mutation<Link, string>({
			query: (id) => ({
				url: `/links/${id}/archive`,
				method: "PATCH",
			}),
			transformResponse: transformLink,
			invalidatesTags: (_result, _error, id) => [
				{ type: "Link", id },
				{ type: "Link", id: "LIST" },
			],
		}),

		/**
		 * Unarchive link (restore)
		 */
		unarchiveLink: builder.mutation<Link, string>({
			query: (id) => ({
				url: `/links/${id}/unarchive`,
				method: "PATCH",
			}),
			transformResponse: transformLink,
			invalidatesTags: (_result, _error, id) => [
				{ type: "Link", id },
				{ type: "Link", id: "LIST" },
			],
		}),

		/**
		 * Delete link permanently
		 */
		deleteLink: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({
				url: `/links/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: "Link", id },
				{ type: "Link", id: "LIST" },
			],
		}),

		// ============ LINK ACTIONS ============

		/**
		 * Request URL security rescan
		 */
		rescanLink: builder.mutation<Link, string>({
			query: (id) => ({
				url: `/links/${id}/rescan`,
				method: "POST",
			}),
			transformResponse: transformLink,
			invalidatesTags: (_result, _error, id) => [{ type: "Link", id }],
		}),

		/**
		 * Generate QR code for link
		 */
		generateQr: builder.mutation<QrCodeResponse, string>({
			query: (id) => ({
				url: `/links/${id}/qr`,
				method: "POST",
			}),
			invalidatesTags: (_result, _error, id) => [{ type: "Link", id }],
		}),

		// ============ ANALYTICS ============

		/**
		 * Get link analytics (paginated click records)
		 */
		getLinkAnalytics: builder.query<
			PaginatedResponse<LinkAnalytics>,
			{ id: string; filters?: AnalyticsFilterDto }
		>({
			query: ({ id, filters }) => ({
				url: `/links/${id}/analytics`,
				method: "GET",
				params: filters || {},
			}),
			providesTags: (_result, _error, { id }) => [
				{ type: "LinkAnalytics", id },
			],
		}),

		/**
		 * Get link analytics summary (aggregated stats)
		 */
		getAnalyticsSummary: builder.query<LinkAnalyticsSummary, string>({
			query: (id) => `/links/${id}/analytics/summary`,
			providesTags: (_result, _error, id) => [{ type: "LinkAnalytics", id }],
		}),
	}),
});

export const {
	// CRUD
	useCreateLinkMutation,
	useCreateGuestLinkMutation,
	useGetLinksQuery,
	useGetLinkQuery,
	useUpdateLinkMutation,
	useArchiveLinkMutation,
	useUnarchiveLinkMutation,
	useDeleteLinkMutation,
	// Actions
	useRescanLinkMutation,
	useGenerateQrMutation,
	// Analytics
	useGetLinkAnalyticsQuery,
	useGetAnalyticsSummaryQuery,
} = linksApi;
