import { z } from "zod";

export const redirectPasswordSchema = z.object({
	password: z.string().min(1, "Password is required"),
});

export type RedirectPasswordFormValues = z.infer<typeof redirectPasswordSchema>;
