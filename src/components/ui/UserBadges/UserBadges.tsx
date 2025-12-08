import { Badge, Group, type MantineSize } from "@mantine/core";
import { IconCrown } from "@tabler/icons-react";

export interface UserBadgesProps {
	isAdmin?: boolean;
	userType?: "GUEST" | "FREE" | "PRO" | null;
	size?: MantineSize;
}

// Icon sizes based on badge size
const iconSizes: Record<MantineSize, number> = {
	xs: 10,
	sm: 12,
	md: 14,
	lg: 16,
	xl: 18,
};

export function UserBadges({
	isAdmin,
	userType,
	size = "xs",
}: UserBadgesProps) {
	if (!isAdmin && !userType) return null;

	const iconSize = iconSizes[size] || 12;

	return (
		<Group gap={4} wrap="nowrap">
			{isAdmin && (
				<Badge size={size} color="red" variant="filled">
					ADMIN
				</Badge>
			)}
			{userType && (
				<Badge
					size={size}
					color={userType === "PRO" ? "violet" : "gray"}
					variant="light"
					leftSection={
						userType === "PRO" ? <IconCrown size={iconSize} /> : undefined
					}
				>
					{userType}
				</Badge>
			)}
		</Group>
	);
}
