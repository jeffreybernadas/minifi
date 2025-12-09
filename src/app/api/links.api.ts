import { VITE_APP_URL } from "@/constants/env.constant";
import { baseApi } from "./base.api";
import type { CreateGuestLinkDto, Link } from "@/types";

/**
 * Links API slice
 *
 * Only guest link creation is needed for landing page in Phase 2 kickoff.
 * Additional endpoints can be injected here as dashboard features expand.
 */
export const linksApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Create guest link (no auth required)
		 * Backend will rate-limit by IP and auto-expire in 3 days.
		 */
		createGuestLink: builder.mutation<Link, CreateGuestLinkDto>({
			query: (body) => ({
				url: "/links/guest",
				method: "POST",
				body,
			}),
			transformResponse: (response: Link) => {
				// Ensure shortUrl is populated for display
				const shortUrl =
					response.shortUrl ||
					`${VITE_APP_URL}/r/${response.customAlias ?? response.shortCode}`;

				return { ...response, shortUrl };
			},
		}),
	}),
});

export const { useCreateGuestLinkMutation } = linksApi;
