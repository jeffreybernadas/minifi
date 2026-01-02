/**
 * Format date for display (e.g., "Jan 15, 2025")
 */
export const formatDate = (date: string | Date): string => {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

/**
 * Format date and time for display (e.g., "Jan 15, 2025, 3:45 PM")
 */
export const formatDateTime = (date: string | Date): string => {
	return new Date(date).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
};

/**
 * Format short date for display (e.g., "Jan 15") - useful for chart labels
 */
export const formatDateShort = (date: string | Date): string => {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
};

/**
 * Convert Date to ISO string, or return null if date is null/undefined
 * Useful for API payloads that expect ISO date strings
 */
export const toISOString = (date?: Date | null): string | null => {
	return date ? date.toISOString() : null;
};
