import { Badge, type MantineSize } from "@mantine/core";
import {
	LINK_STATUS_CONFIG,
	SCAN_STATUS_CONFIG,
} from "@/constants/status.constant";
import type { LinkStatus, ScanStatus } from "@/types";

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
