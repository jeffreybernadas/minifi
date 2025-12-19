import { z } from "zod";

export const createLinkSchema = z.object({
	originalUrl: z
		.string()
		.min(1, "Destination URL is required")
		.url("Please enter a valid URL"),
	title: z.string().max(100, "Title must be 100 characters or less").optional(),
	description: z
		.string()
		.max(500, "Description must be 500 characters or less")
		.optional(),
	customAlias: z
		.string()
		.min(3, "Alias must be at least 3 characters")
		.max(30, "Alias must be 30 characters or less")
		.regex(
			/^[a-zA-Z0-9_-]*$/,
			"Alias can only contain letters, numbers, hyphens and underscores",
		)
		.optional()
		.or(z.literal("")),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.optional()
		.or(z.literal("")),
	scheduledAt: z.date().nullable().optional(),
	expiresAt: z.date().nullable().optional(),
	clickLimit: z
		.number()
		.min(1, "Click limit must be at least 1")
		.nullable()
		.optional(),
	isOneTime: z.boolean().optional(),
	notes: z
		.string()
		.max(1000, "Notes must be 1000 characters or less")
		.optional(),
	tagIds: z.array(z.string()).optional(),
});

export type CreateLinkFormValues = z.infer<typeof createLinkSchema>;

export const editLinkSchema = z.object({
	title: z.string().max(100, "Title must be 100 characters or less").optional(),
	description: z
		.string()
		.max(500, "Description must be 500 characters or less")
		.optional(),
	customAlias: z
		.string()
		.min(3, "Alias must be at least 3 characters")
		.max(30, "Alias must be 30 characters or less")
		.regex(
			/^[a-zA-Z0-9_-]*$/,
			"Alias can only contain letters, numbers, hyphens and underscores",
		)
		.optional()
		.or(z.literal("")),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.optional()
		.or(z.literal("")),
	removePassword: z.boolean().optional(),
	scheduledAt: z.date().nullable().optional(),
	expiresAt: z.date().nullable().optional(),
	clickLimit: z
		.number()
		.min(1, "Click limit must be at least 1")
		.nullable()
		.optional(),
	isOneTime: z.boolean().optional(),
	notes: z
		.string()
		.max(1000, "Notes must be 1000 characters or less")
		.optional(),
	tagIds: z.array(z.string()).optional(),
});

export type EditLinkFormValues = z.infer<typeof editLinkSchema>;

export const guestLinkSchema = z.object({
	originalUrl: z.string().url("Please enter a valid URL"),
});

export type GuestLinkFormValues = z.infer<typeof guestLinkSchema>;
