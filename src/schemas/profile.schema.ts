import { z } from "zod";

/**
 * Zod validation schema for profile form
 */
export const profileSchema = z.object({
	phoneNumber: z
		.string()
		.optional()
		.refine(
			(val) => {
				if (!val || val.trim() === "") return true; // Allow empty
				return /^\+?[1-9]\d{1,14}$/.test(val); // E.164 format
			},
			{
				message: "Phone number must be in E.164 format (e.g., +639123456789)",
			},
		),
	address: z
		.string()
		.max(500, "Address must be less than 500 characters")
		.optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
