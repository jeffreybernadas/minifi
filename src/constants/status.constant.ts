/**
 * Status badge configuration for links and scans
 */
import type { MantineColor } from "@mantine/core";
import type { LinkStatus, ScanStatus } from "@/types";

/**
 * Link status badge configuration
 */
export const LINK_STATUS_CONFIG: Record<
	LinkStatus,
	{ color: MantineColor; label: string }
> = {
	ACTIVE: { color: "green", label: "Active" },
	SCHEDULED: { color: "blue", label: "Scheduled" },
	DISABLED: { color: "gray", label: "Disabled" },
	ARCHIVED: { color: "dark", label: "Archived" },
	SUSPICIOUS: { color: "yellow", label: "Suspicious" },
	BLOCKED: { color: "red", label: "Blocked" },
};

/**
 * Scan status badge configuration
 */
export const SCAN_STATUS_CONFIG: Record<
	ScanStatus,
	{ color: MantineColor; label: string }
> = {
	PENDING: { color: "blue", label: "Pending" },
	SAFE: { color: "green", label: "Safe" },
	SUSPICIOUS: { color: "yellow", label: "Suspicious" },
	MALICIOUS: { color: "red", label: "Malicious" },
	ADULT_CONTENT: { color: "orange", label: "Adult" },
};

/**
 * Get badge color for scan status (for cases where you just need the color)
 */
export const getScanStatusColor = (
	status: ScanStatus | string,
): MantineColor => {
	const config = SCAN_STATUS_CONFIG[status as ScanStatus];
	return config?.color ?? "gray";
};
