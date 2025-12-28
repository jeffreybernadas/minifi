/**
 * String manipulation utilities
 */

/**
 * Truncate a URL or string to a maximum length with ellipsis
 * Example: "https://example.com/very/long/path" -> "https://example.com/very/l..."
 */
export const truncateUrl = (url: string, maxLength = 50): string => {
	return url.length > maxLength ? `${url.slice(0, maxLength)}...` : url;
};

/**
 * Truncate any string to a maximum length with ellipsis
 */
export const truncateString = (str: string, maxLength = 50): string => {
	return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};
