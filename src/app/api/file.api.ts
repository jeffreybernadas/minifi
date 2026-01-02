import { baseApi } from "./base.api";

/**
 * File Upload Types
 */
export interface FileUploadResponse {
	message: string;
	originalname: string;
	filename: string;
	mimetype: string;
	size: string;
	path: string; // MinIO URL
}

/**
 * File API slice
 */
export const fileApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Upload a single file
		 * Max size: 5MB
		 * Allowed types: images (jpeg, png, gif, webp), PDF
		 */
		uploadFile: builder.mutation<FileUploadResponse, FormData>({
			query: (formData) => ({
				url: "/upload/single",
				method: "POST",
				body: formData,
				// Don't set Content-Type - browser will set it with boundary for multipart
			}),
		}),
	}),
});

export const { useUploadFileMutation } = fileApi;
