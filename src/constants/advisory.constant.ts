/**
 * Advisory constants - types, colors, icons, and filter options
 */

import type { MantineColor } from "@mantine/core";
import {
	IconAlertTriangle,
	IconInfoCircle,
	IconTool,
	IconUrgent,
} from "@tabler/icons-react";
import type { AdvisoryStatus, AdvisoryType } from "@/types";

// ============================================================================
// Filter Options
// ============================================================================

export const ADVISORY_STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "DRAFT", label: "Draft" },
	{ value: "PUBLISHED", label: "Published" },
	{ value: "ARCHIVED", label: "Archived" },
];

export const ADVISORY_TYPE_OPTIONS = [
	{ value: "", label: "All Types" },
	{ value: "INFO", label: "Info" },
	{ value: "WARNING", label: "Warning" },
	{ value: "MAINTENANCE", label: "Maintenance" },
	{ value: "CRITICAL", label: "Critical" },
];

export const ADVISORY_FORM_TYPE_OPTIONS = [
	{ value: "INFO", label: "Info (Blue)" },
	{ value: "WARNING", label: "Warning (Orange)" },
	{ value: "MAINTENANCE", label: "Maintenance (Yellow)" },
	{ value: "CRITICAL", label: "Critical (Red)" },
];

// ============================================================================
// Badge Colors
// ============================================================================

export const ADVISORY_TYPE_COLORS: Record<AdvisoryType, MantineColor> = {
	INFO: "blue",
	WARNING: "orange",
	MAINTENANCE: "yellow",
	CRITICAL: "red",
};

export const ADVISORY_STATUS_COLORS: Record<AdvisoryStatus, MantineColor> = {
	DRAFT: "gray",
	PUBLISHED: "green",
	ARCHIVED: "gray",
};

// ============================================================================
// Type Configuration (with icons)
// ============================================================================

export const ADVISORY_TYPE_CONFIG: Record<
	AdvisoryType,
	{ color: MantineColor; icon: typeof IconInfoCircle; label: string }
> = {
	INFO: { color: "blue", icon: IconInfoCircle, label: "Information" },
	WARNING: { color: "orange", icon: IconAlertTriangle, label: "Warning" },
	MAINTENANCE: { color: "yellow", icon: IconTool, label: "Maintenance" },
	CRITICAL: { color: "red", icon: IconUrgent, label: "Critical Alert" },
};
