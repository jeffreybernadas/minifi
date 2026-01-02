/**
 * Scan Score Formatting Utilities
 *
 * Standardizes display of security scan scores across the frontend.
 * Backend stores scores as Float (0.0-1.0), where 1.0 = safest, 0.0 = most dangerous.
 * Frontend displays as percentage (0-100%) for better user understanding.
 */

/**
 * Format scan score as percentage string
 * @param score - Score from 0.0 to 1.0 (1.0 = safest)
 * @returns Formatted string like "75%" or "—" if null/undefined
 */
export function formatScanScore(score: number | null | undefined): string {
	if (score === null || score === undefined) {
		return "—";
	}

	const percentage = Math.round(score * 100);
	return `${percentage}%`;
}

/**
 * Get color for scan score based on safety level
 * @param score - Score from 0.0 to 1.0 (1.0 = safest)
 * @returns Mantine color string
 */
export function getScanScoreColor(score: number | null | undefined): string {
	if (score === null || score === undefined) {
		return "gray";
	}

	const percentage = score * 100;

	if (percentage >= 80) return "green";
	if (percentage >= 60) return "yellow";
	if (percentage >= 40) return "orange";
	return "red";
}

/**
 * Get descriptive label for scan score
 * @param score - Score from 0.0 to 1.0 (1.0 = safest)
 * @returns Human-readable safety level
 */
export function getScanScoreLabel(score: number | null | undefined): string {
	if (score === null || score === undefined) {
		return "Not scanned";
	}

	const percentage = score * 100;

	if (percentage >= 80) return "Safe";
	if (percentage >= 60) return "Moderate";
	if (percentage >= 40) return "Suspicious";
	return "Dangerous";
}
