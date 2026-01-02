import { Badge, CloseButton, type MantineSize } from "@mantine/core";
import type { Tag } from "@/types";

export interface TagBadgeProps {
	/** Tag object with backgroundColor and textColor */
	tag: Tag;
	/** Size of the badge */
	size?: MantineSize;
	/** Optional close handler for removable tags */
	onRemove?: () => void;
	/** Whether the badge is clickable */
	onClick?: () => void;
}

/**
 * Tag badge component with custom colors
 * Uses tag's backgroundColor and textColor for styling
 */
export function TagBadge({
	tag,
	size = "sm",
	onRemove,
	onClick,
}: Readonly<TagBadgeProps>) {
	const badgeContent = (
		<Badge
			size={size}
			style={{
				backgroundColor: tag.backgroundColor,
				color: tag.textColor,
				cursor: onClick ? "pointer" : "default",
			}}
			variant="filled"
			onClick={onClick}
			rightSection={
				onRemove ? (
					<CloseButton
						size="xs"
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						style={{ backgroundColor: "transparent", color: tag.textColor }}
						aria-label={`Remove tag ${tag.name}`}
					/>
				) : undefined
			}
		>
			{tag.name}
		</Badge>
	);

	return badgeContent;
}
