// ============================================================================
// CORE TYPES - Links, Tags, Enums
// ============================================================================

/**
 * Link status values from backend
 */
export type LinkStatus =
	| "ACTIVE"
	| "SCHEDULED"
	| "DISABLED"
	| "ARCHIVED"
	| "SUSPICIOUS";

/**
 * Scan status for security scanning
 */
export type ScanStatus =
	| "PENDING"
	| "SAFE"
	| "SUSPICIOUS"
	| "MALICIOUS"
	| "ADULT_CONTENT";

/**
 * Tag model
 */
export interface Tag {
	id: string;
	userId: string;
	name: string;
	backgroundColor: string;
	textColor: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Scan details from OpenAI analysis
 */
export interface ScanDetails {
	threats?: string[];
	reasoning?: string;
	recommendations?: string;
}

/**
 * Core link model returned by the backend
 */
export interface Link {
	id: string;
	userId: string | null;
	originalUrl: string;
	shortCode: string;
	customAlias?: string;
	shortUrl?: string; // client-side helper for display
	title?: string;
	description?: string;
	status: LinkStatus;
	hasPassword: boolean;
	scheduledAt?: string | null;
	expiresAt?: string | null;
	clickLimit?: number | null;
	isOneTime: boolean;
	isArchived: boolean;
	notes?: string | null;
	scanStatus: ScanStatus;
	scanScore?: number | null;
	scanDetails?: ScanDetails | null;
	scannedAt?: string | null;
	lastScanVersion?: string | null;
	clickCount: number;
	uniqueClickCount: number;
	lastClickedAt?: string | null;
	qrCodeUrl?: string | null;
	tags?: Tag[]; // Tags assigned to this link
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// DTOs - Request/Response Payloads
// ============================================================================

/**
 * Guest link creation payload
 */
export interface CreateGuestLinkDto {
	originalUrl: string;
}

/**
 * Authenticated link creation payload
 */
export interface CreateLinkDto {
	originalUrl: string;
	customAlias?: string;
	title?: string;
	description?: string;
	password?: string;
	scheduledAt?: string;
	expiresAt?: string;
	clickLimit?: number;
	isOneTime?: boolean;
	notes?: string;
	tagIds?: string[];
}

/**
 * Link update payload
 */
export interface UpdateLinkDto {
	customAlias?: string | null;
	title?: string | null;
	description?: string | null;
	password?: string | null;
	scheduledAt?: string | null;
	expiresAt?: string | null;
	clickLimit?: number | null;
	isOneTime?: boolean;
	notes?: string | null;
	tagIds?: string[];
}

/**
 * Link filter/search params (matches backend LinkFilterDto)
 */
export interface LinkFilterDto {
	page?: number;
	limit?: number;
	search?: string;
	status?: LinkStatus;
	tagId?: string; // single tag filter
	isArchived?: boolean;
	order?: "asc" | "desc";
}

/**
 * Pagination metadata (matches backend OffsetPageMetaDto)
 */
export interface PaginationMeta {
	page: number;
	limit: number;
	itemCount: number;
	pageCount: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
	data: T[];
	meta: PaginationMeta;
}

/**
 * QR code generation response
 */
export interface QrCodeResponse {
	qrCodeUrl: string;
}

/**
 * Tag creation payload
 */
export interface CreateTagDto {
	name: string;
	backgroundColor?: string;
	textColor?: string;
}

/**
 * Tag update payload
 */
export interface UpdateTagDto {
	name?: string;
	backgroundColor?: string;
	textColor?: string;
}
