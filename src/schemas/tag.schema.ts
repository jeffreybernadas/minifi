import { z } from "zod";

/**
 * Hex color validation regex
 */
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

/**
 * Zod validation schema for tag creation/edit form
 * Defaults match backend Prisma schema defaults
 */
export const tagSchema = z.object({
	name: z
		.string()
		.min(1, "Tag name is required")
		.max(50, "Tag name must be less than 50 characters")
		.trim(),
	backgroundColor: z
		.string()
		.regex(
			hexColorRegex,
			"Background color must be a valid hex color (e.g., #3B82F6)",
		)
		.optional(),
	textColor: z
		.string()
		.regex(
			hexColorRegex,
			"Text color must be a valid hex color (e.g., #FFFFFF)",
		)
		.optional(),
});

export type TagFormData = z.infer<typeof tagSchema>;
