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

// ============================================================================
// ANALYTICS - Click Tracking & Raw Data
// ============================================================================

/**
 * Link analytics record (single click - matches backend)
 * Returned by GET /v1/links/:id/analytics (paginated, PRO only)
 * Each record represents a single click with full visitor data
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
 * Global analytics filter params (for overview endpoint)
 */
export interface AnalyticsFilterDto {
	page?: number;
	limit?: number;
	startDate?: string;
	endDate?: string;
}

/**
 * Link-specific analytics filter params (for individual link click log)
 * Matches backend AnalyticsFilterDto with additional filters
 */
export interface LinkAnalyticsFilterDto extends AnalyticsFilterDto {
	countryCode?: string; // Filter by ISO country code
	device?: string; // Filter by device type
	search?: string; // Search referrer or URL
}

// ============================================================================
// ANALYTICS - Chart & Aggregation Data Types
// ============================================================================

/**
 * Clicks by date for timeline charts
 */
export interface ClicksByDate {
	date: string;
	count: number;
}

/**
 * Top country in link analytics summary
 */
export interface TopCountry {
	country: string;
	count: number;
}

/**
 * Top city in link analytics summary
 */
export interface TopCity {
	city: string;
	count: number;
}

/**
 * Top device in link analytics summary
 */
export interface TopDevice {
	device: string;
	count: number;
}

/**
 * Top operating system in analytics
 * Used for OS breakdown charts
 */
export interface TopOS {
	os: string;
	count: number;
}

/**
 * Top browser in link analytics summary
 */
export interface TopBrowser {
	browser: string;
	count: number;
}

/**
 * Top referrer in link analytics summary
 */
export interface TopReferrer {
	referrer: string;
	count: number;
}

/**
 * Link analytics summary (matches backend LinkAnalyticsSummaryDto)
 * Returned by GET /v1/links/:id/analytics/summary
 * Tier-based: FREE gets top 3 countries, 7-day history | PRO gets top 10, 90-day history
 */
export interface LinkAnalyticsSummary {
	totalClicks: number;
	uniqueVisitors: number;
	clicksByDate: ClicksByDate[];
	topCountries: TopCountry[];
	topCities: TopCity[]; // PRO only
	topDevices: TopDevice[]; // PRO only
	topBrowsers: TopBrowser[]; // PRO only
	topReferrers: TopReferrer[]; // PRO only
}

// ============================================================================
// ANALYTICS - Global Overview Data Types
// ============================================================================

/**
 * Top link data for global analytics overview
 */
export interface TopLinkData {
	shortCode: string;
	title?: string;
	clicks: number;
	uniqueClicks: number;
}

/**
 * Top country data for global analytics overview
 * Used in geographic heat maps
 */
export interface TopCountryData {
	country: string;
	countryCode?: string; // ISO 2-letter code (optional, for map matching)
	clicks: number;
}

/**
 * Geographic data point for heat map visualization
 * Extends TopCountryData with additional geographic metadata
 */
export interface GeoDataPoint extends TopCountryData {
	coordinates?: [number, number]; // [longitude, latitude] for map plotting
	percentage?: number; // Percentage of total clicks
}

/**
 * Top device data for global analytics overview
 * Includes percentage for pie charts
 */
export interface TopDeviceData {
	device: string;
	clicks: number;
	percentage: number;
}

/**
 * Top referrer data for global analytics overview
 */
export interface TopReferrerData {
	referrer: string;
	clicks: number;
}

/**
 * User monthly analytics result from LinkService (Global Analytics)
 * Returned by GET /v1/links/analytics/overview?startDate=&endDate=
 * Used in /dashboard/analytics/* pages
 */
export interface UserMonthlyAnalytics {
	totalClicks: number;
	uniqueVisitors: number;
	totalActiveLinks: number;
	linksCreatedThisMonth: number;
	previousMonthClicks: number;
	topLinks: TopLinkData[];
	topCountries: TopCountryData[];
	topDevices: TopDeviceData[];
	topReferrers: TopReferrerData[];
	bestDay?: { date: string; clicks: number };
	clicksByDate: ClicksByDate[];
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
