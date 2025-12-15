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
	createdAt: string;
	updatedAt: string;
}

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
 * Link analytics record (single click - matches backend)
 */
export interface LinkAnalytics {
	id: string;
	linkId: string;
	clickedAt: string;
	ipAddress?: string;
	userAgent?: string;
	browser?: string;
	browserVersion?: string;
	os?: string;
	osVersion?: string;
	device?: string;
	country?: string;
	countryCode?: string;
	city?: string;
	region?: string;
	latitude?: number;
	longitude?: number;
	referrer?: string;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
	utmTerm?: string;
	utmContent?: string;
}

/**
 * Analytics filter params
 */
export interface AnalyticsFilterDto {
	page?: number;
	limit?: number;
	startDate?: string;
	endDate?: string;
}

/**
 * Clicks by date for chart
 */
export interface ClicksByDate {
	date: string;
	count: number;
}

/**
 * Top country in analytics
 */
export interface TopCountry {
	country: string;
	count: number;
}

/**
 * Top city in analytics
 */
export interface TopCity {
	city: string;
	count: number;
}

/**
 * Top device in analytics
 */
export interface TopDevice {
	device: string;
	count: number;
}

/**
 * Top browser in analytics
 */
export interface TopBrowser {
	browser: string;
	count: number;
}

/**
 * Top referrer in analytics
 */
export interface TopReferrer {
	referrer: string;
	count: number;
}

/**
 * Link analytics summary (matches backend LinkAnalyticsSummaryDto)
 */
export interface LinkAnalyticsSummary {
	totalClicks: number;
	uniqueVisitors: number;
	clicksByDate: ClicksByDate[];
	topCountries: TopCountry[];
	topCities: TopCity[];
	topDevices: TopDevice[];
	topBrowsers: TopBrowser[];
	topReferrers: TopReferrer[];
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
