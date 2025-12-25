// ============================================================================
// ADMIN TYPES - Platform Management Types
// ============================================================================

// ============================================================================
// Enums (reused from link.types.ts where applicable)
// ============================================================================

/**
 * User type values from Keycloak
 */
export type UserType = "USER" | "ADMIN";

/**
 * Subscription tier values
 */
export type SubscriptionTier = "FREE" | "PRO";

// ============================================================================
// Admin Stats Types (from /admin/stats)
// ============================================================================

/**
 * Growth data for comparing periods
 */
export interface GrowthData {
	current: number;
	previous: number;
	percentage: number;
}

/**
 * Platform-wide statistics
 */
export interface AdminStats {
	totalUsers: number;
	totalLinks: number;
	totalClicks: number;
	totalProUsers: number;
	activeLinks: number;
	blockedUsers: number;
	blockedLinks: number;
	userGrowth: GrowthData;
	linkGrowth: GrowthData;
	clickGrowth: GrowthData;
}

// ============================================================================
// Platform Analytics Types (from /admin/analytics)
// ============================================================================

/**
 * Daily stat point for trend charts
 */
export interface DailyStat {
	date: string;
	count: number;
}

/**
 * Top item for leaderboard-style displays
 */
export interface TopItem {
	name: string;
	count: number;
}

/**
 * Platform analytics data
 */
export interface PlatformAnalytics {
	dailyUsers: DailyStat[];
	dailyLinks: DailyStat[];
	dailyClicks: DailyStat[];
	topCountries: TopItem[];
	topDevices: TopItem[];
	topBrowsers: TopItem[];
	topReferrers: TopItem[];
}

// ============================================================================
// Security Overview Types (from /admin/security)
// ============================================================================

/**
 * Security status breakdown
 */
export interface SecurityStat {
	status: string;
	count: number;
}

/**
 * Recent security alert
 */
export interface RecentAlert {
	linkId: string;
	shortCode: string;
	originalUrl: string;
	scanStatus: string;
	scanScore: number | null;
	scannedAt: string | null;
	userId: string | null;
}

/**
 * Security overview data
 */
export interface SecurityOverview {
	byStatus: SecurityStat[];
	pendingScanCount: number;
	maliciousCount: number;
	suspiciousCount: number;
	recentAlerts: RecentAlert[];
}

// ============================================================================
// Admin User Types (from /admin/users)
// ============================================================================

/**
 * Admin user filter parameters
 */
export interface AdminUserFilterDto {
	page?: number;
	limit?: number;
	search?: string;
	userType?: UserType;
	isBlocked?: boolean;
	emailVerified?: boolean;
}

/**
 * User as returned in admin list
 */
export interface AdminUser {
	id: string;
	email: string;
	username?: string;
	firstName?: string;
	lastName?: string;
	emailVerified: boolean;
	userType: UserType;
	isBlocked: boolean;
	blockedAt?: string;
	blockedReason?: string;
	linksCount: number;
	activeLinksCount: number;
	totalClicks: number;
	createdAt: string;
	updatedAt: string;
}

/**
 * Detailed user info (extends AdminUser)
 */
export interface AdminUserDetail extends AdminUser {
	phoneNumber?: string;
	avatarUrl?: string;
	address?: string;
	emailNotificationsEnabled: boolean;
	subscriptionTier?: SubscriptionTier;
	subscriptionStatus?: string;
	stripeCustomerId?: string;
}

/**
 * Change tier request payload
 */
export interface ChangeTierDto {
	tier: SubscriptionTier;
}

/**
 * Block user request payload
 */
export interface BlockUserDto {
	reason: string;
}

// ============================================================================
// Admin Link Types (from /admin/links)
// ============================================================================

import type { LinkStatus, ScanStatus } from "./link.types";

/**
 * Admin link filter parameters
 */
export interface AdminLinkFilterDto {
	page?: number;
	limit?: number;
	search?: string;
	status?: LinkStatus;
	scanStatus?: ScanStatus;
	isGuest?: boolean;
	isArchived?: boolean;
	userId?: string;
}

/**
 * Link as returned in admin list
 */
export interface AdminLink {
	id: string;
	userId?: string;
	userEmail?: string;
	originalUrl: string;
	shortCode: string;
	customAlias?: string;
	title?: string;
	description?: string;
	status: LinkStatus;
	isGuest: boolean;
	scanStatus: ScanStatus;
	scanScore?: number;
	scannedAt?: string;
	hasPassword: boolean;
	scheduledAt?: string;
	expiresAt?: string;
	clickLimit?: number;
	isOneTime: boolean;
	isArchived: boolean;
	clickCount: number;
	uniqueClickCount: number;
	lastClickedAt?: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Detailed link info (extends AdminLink)
 */
export interface AdminLinkDetail extends AdminLink {
	guestIpAddress?: string;
	guestUserAgent?: string;
	scanDetails?: Record<string, unknown>;
	notes?: string;
	qrCodeUrl?: string;
}

/**
 * Admin edit link request payload
 */
export interface AdminEditLinkDto {
	title?: string;
	description?: string;
	status?: LinkStatus;
	customAlias?: string;
	expiresAt?: string;
	clickLimit?: number;
	isArchived?: boolean;
	notes?: string;
}

/**
 * Block link request payload
 */
export interface BlockLinkDto {
	reason: string;
}
