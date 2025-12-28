/**
 * Link URL utilities
 */
import { VITE_APP_URL } from "@/constants/env.constant";

interface LinkLike {
	customAlias?: string | null;
	shortCode: string;
}

/**
 * Build the full short URL from link data
 * Uses customAlias if available, otherwise falls back to shortCode
 */
export const buildShortUrl = (link: LinkLike): string => {
	return `${VITE_APP_URL}/r/${link.customAlias ?? link.shortCode}`;
};
