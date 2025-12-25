import { Badge, type MantineColor, type MantineSize } from "@mantine/core";
import type { LinkStatus, ScanStatus } from "@/types";

/**
 * Link status badge configuration
 */
const LINK_STATUS_CONFIG: Record<
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
const SCAN_STATUS_CONFIG: Record<
	ScanStatus,
	{ color: MantineColor; label: string }
> = {
	PENDING: { color: "blue", label: "Pending" },
	SAFE: { color: "green", label: "Safe" },
	SUSPICIOUS: { color: "yellow", label: "Suspicious" },
	MALICIOUS: { color: "red", label: "Malicious" },
	ADULT_CONTENT: { color: "orange", label: "Adult" },
};

export interface LinkStatusBadgeProps {
	status: LinkStatus;
	size?: MantineSize;
}

export interface ScanStatusBadgeProps {
	status: ScanStatus;
	size?: MantineSize;
}

/**
 * Badge for link status (ACTIVE, SCHEDULED, etc.)
 */
export function LinkStatusBadge({ status, size = "sm" }: LinkStatusBadgeProps) {
	const config = LINK_STATUS_CONFIG[status];
	return (
		<Badge size={size} color={config.color} variant="light">
			{config.label}
		</Badge>
	);
}

/**
 * Badge for scan status (SAFE, SUSPICIOUS, etc.)
 */
export function ScanStatusBadge({ status, size = "sm" }: ScanStatusBadgeProps) {
	const config = SCAN_STATUS_CONFIG[status];
	return (
		<Badge size={size} color={config.color} variant="dot">
			{config.label}
		</Badge>
	);
}
