/**
 * Filter options for dropdowns and select components
 */

// ============================================================================
// Link Status Filter Options
// ============================================================================

/**
 * Link status filter options for user dashboard
 */
export const LINK_STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "ACTIVE", label: "Active" },
	{ value: "SCHEDULED", label: "Scheduled" },
	{ value: "DISABLED", label: "Disabled" },
	{ value: "BLOCKED", label: "Blocked" },
];

/**
 * Link status filter options for admin (same as user, but keeping separate for potential differences)
 */
export const ADMIN_LINK_STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "ACTIVE", label: "Active" },
	{ value: "SCHEDULED", label: "Scheduled" },
	{ value: "DISABLED", label: "Disabled" },
	{ value: "BLOCKED", label: "Blocked" },
];

// ============================================================================
// Scan Status Filter Options
// ============================================================================

export const SCAN_STATUS_OPTIONS = [
	{ value: "", label: "All Scan Status" },
	{ value: "PENDING", label: "Pending" },
	{ value: "SAFE", label: "Safe" },
	{ value: "SUSPICIOUS", label: "Suspicious" },
	{ value: "MALICIOUS", label: "Malicious" },
	{ value: "ADULT_CONTENT", label: "Adult Content" },
];

// ============================================================================
// Guest/Registered Filter Options
// ============================================================================

export const GUEST_OPTIONS = [
	{ value: "", label: "All Links" },
	{ value: "true", label: "Guest Only" },
	{ value: "false", label: "Registered Only" },
];
