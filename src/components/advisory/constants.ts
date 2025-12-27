import {
	IconAlertTriangle,
	IconInfoCircle,
	IconTool,
	IconUrgent,
} from "@tabler/icons-react";
import type { AdvisoryType } from "@/types";

/**
 * Configuration for advisory types used in modal display
 */
export const TYPE_CONFIG: Record<
	AdvisoryType,
	{ color: string; icon: typeof IconInfoCircle; label: string }
> = {
	INFO: { color: "blue", icon: IconInfoCircle, label: "Information" },
	WARNING: { color: "orange", icon: IconAlertTriangle, label: "Warning" },
	MAINTENANCE: { color: "yellow", icon: IconTool, label: "Maintenance" },
	CRITICAL: { color: "red", icon: IconUrgent, label: "Critical Alert" },
};
