import type { AdvisoryStatus, AdvisoryType } from "@/types";

// ============================================================================
// Filter Options
// ============================================================================

export const STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "DRAFT", label: "Draft" },
	{ value: "PUBLISHED", label: "Published" },
	{ value: "ARCHIVED", label: "Archived" },
];

export const TYPE_OPTIONS = [
	{ value: "", label: "All Types" },
	{ value: "INFO", label: "Info" },
	{ value: "WARNING", label: "Warning" },
	{ value: "MAINTENANCE", label: "Maintenance" },
	{ value: "CRITICAL", label: "Critical" },
];

export const FORM_TYPE_OPTIONS = [
	{ value: "INFO", label: "Info (Blue)" },
	{ value: "WARNING", label: "Warning (Orange)" },
	{ value: "MAINTENANCE", label: "Maintenance (Yellow)" },
	{ value: "CRITICAL", label: "Critical (Red)" },
];

// ============================================================================
// Badge Colors
// ============================================================================

export const TYPE_COLORS: Record<AdvisoryType, string> = {
	INFO: "blue",
	WARNING: "orange",
	MAINTENANCE: "yellow",
	CRITICAL: "red",
};

export const STATUS_COLORS: Record<AdvisoryStatus, string> = {
	DRAFT: "gray",
	PUBLISHED: "green",
	ARCHIVED: "gray",
};
