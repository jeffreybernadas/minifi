import type { CreateTagDto, Tag, UpdateTagDto } from "@/types";
import { baseApi } from "./base.api";

/**
 * Tags API slice - Tag CRUD + Link assignment
 */
export const tagsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// ============ TAG CRUD ============

		/**
		 * Create a new tag
		 */
		createTag: builder.mutation<Tag, CreateTagDto>({
			query: (body) => ({
				url: "/links/tags",
				method: "POST",
				body,
			}),
			invalidatesTags: ["Tag"],
		}),

		/**
		 * Get all tags for current user
		 */
		getTags: builder.query<Tag[], void>({
			query: () => "/links/tags",
			transformResponse: (response: { data: Tag[] }) => response.data,
			providesTags: (tags) =>
				tags
					? [
							...tags.map(({ id }) => ({ type: "Tag" as const, id })),
							{ type: "Tag", id: "LIST" },
						]
					: [{ type: "Tag", id: "LIST" }],
		}),

		/**
		 * Update a tag
		 */
		updateTag: builder.mutation<Tag, { id: string; data: UpdateTagDto }>({
			query: ({ id, data }) => ({
				url: `/links/tags/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "Tag", id },
				{ type: "Tag", id: "LIST" },
			],
		}),

		/**
		 * Delete a tag
		 */
		deleteTag: builder.mutation<{ success: boolean }, string>({
			query: (id) => ({
				url: `/links/tags/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: "Tag", id },
				{ type: "Tag", id: "LIST" },
				// Also invalidate links since they may have this tag
				{ type: "Link", id: "LIST" },
			],
		}),

		// ============ LINK-TAG ASSIGNMENT ============

		/**
		 * Add tag to a link
		 */
		addTagToLink: builder.mutation<
			{ success: boolean },
			{ linkId: string; tagId: string }
		>({
			query: ({ linkId, tagId }) => ({
				url: `/links/${linkId}/tags/${tagId}`,
				method: "POST",
			}),
			invalidatesTags: (_result, _error, { linkId }) => [
				{ type: "Link", id: linkId },
			],
		}),

		/**
		 * Remove tag from a link
		 */
		removeTagFromLink: builder.mutation<
			{ success: boolean },
			{ linkId: string; tagId: string }
		>({
			query: ({ linkId, tagId }) => ({
				url: `/links/${linkId}/tags/${tagId}`,
				method: "DELETE",
			}),
			invalidatesTags: (_result, _error, { linkId }) => [
				{ type: "Link", id: linkId },
			],
		}),
	}),
});

export const {
	// CRUD
	useCreateTagMutation,
	useGetTagsQuery,
	useUpdateTagMutation,
	useDeleteTagMutation,
	// Link assignment
	useAddTagToLinkMutation,
	useRemoveTagFromLinkMutation,
} = tagsApi;
