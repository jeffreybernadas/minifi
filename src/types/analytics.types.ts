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
	id: string;
	shortCode?: string | null;
	customAlias?: string | null;
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

export interface TopCityData {
	city: string;
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

export interface TopBrowserData {
	browser: string;
	clicks: number;
	percentage: number;
}

export interface TopOSData {
	os: string;
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
	topCities: TopCityData[];
	topDevices: TopDeviceData[];
	topBrowsers: TopBrowserData[];
	topOs: TopOSData[];
	topReferrers: TopReferrerData[];
	bestDay?: { date: string; clicks: number };
	clicksByDate: ClicksByDate[];
}
