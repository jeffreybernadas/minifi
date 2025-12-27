import { z } from "zod";

/**
 * Zod validation schema for advisory creation/edit form
 */
export const advisorySchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(200, "Title must be less than 200 characters")
		.trim(),
	content: z
		.string()
		.min(1, "Content is required")
		.refine((val) => val.trim().length > 0 && val !== "<p></p>", {
			message: "Content is required",
		}),
	type: z.enum(["INFO", "WARNING", "MAINTENANCE", "CRITICAL"]),
	expiresAt: z.date().nullable().optional(),
});

export type AdvisoryFormData = z.infer<typeof advisorySchema>;
