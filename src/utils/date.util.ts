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
