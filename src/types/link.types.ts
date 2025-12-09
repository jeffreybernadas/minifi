/**
 * Common link status values from the backend
 */
export type LinkStatus =
	| "ACTIVE"
	| "SCHEDULED"
	| "DISABLED"
	| "ARCHIVED"
	| "SUSPICIOUS";

/**
 * Core link model returned by the backend
 */
export interface Link {
	id: string;
	userId?: string;
	originalUrl: string;
	shortCode: string;
	customAlias?: string;
	shortUrl?: string; // client-side helper for display
	title?: string | null;
	description?: string | null;
	status?: LinkStatus;
	expiresAt?: string | null;
	scheduledAt?: string | null;
	clickLimit?: number | null;
	isOneTime?: boolean;
	isArchived?: boolean;
	hasPassword?: boolean;
	tagIds?: string[];
	clickCount?: number;
	uniqueClickCount?: number;
	lastClickedAt?: string | null;
	notes?: string | null;
	qrCodeUrl?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * Guest link creation payload
 * Landing page form sends only the original URL
 */
export interface CreateGuestLinkDto {
	originalUrl: string;
}

/**
 * Authenticated link creation payload
 * Used on dashboard (FREE/PRO)
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
