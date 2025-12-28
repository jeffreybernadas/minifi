/**
 * Number formatting utilities
 */

/**
 * Format a number with locale-appropriate thousand separators
 * Example: 1234567 -> "1,234,567"
 */
export const formatNumber = (num: number): string => {
	return num.toLocaleString();
};
