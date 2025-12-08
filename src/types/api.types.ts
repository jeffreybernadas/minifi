/**
 * Standard API error response structure from backend
 * Matches the format from ExceptionsFilter
 */
export interface ApiErrorResponse {
	success: false;
	statusCode: number;
	path: string;
	timestamp: string;
	error: {
		code: string;
		message: string;
	};
}

/**
 * RTK Query error wrapper
 * When RTK Query catches an error, it wraps it in this structure
 */
export interface RtkQueryError {
	status: number;
	data: ApiErrorResponse;
}

/**
 * Type guard to check if error is RtkQueryError
 */
export function isRtkQueryError(error: unknown): error is RtkQueryError {
	return (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		"data" in error &&
		typeof (error as RtkQueryError).data === "object" &&
		"error" in (error as RtkQueryError).data
	);
}

/**
 * Extract error message from RTK Query error
 */
export function getErrorMessage(error: unknown): string {
	if (isRtkQueryError(error)) {
		return error.data.error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "An unexpected error occurred";
}

/**
 * Extract error code from RTK Query error
 */
export function getErrorCode(error: unknown): string | undefined {
	if (isRtkQueryError(error)) {
		return error.data.error.code;
	}
	return undefined;
}
