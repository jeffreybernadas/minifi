import { Alert, Transition } from "@mantine/core";
import { useNetwork } from "@mantine/hooks";
import { IconWifiOff } from "@tabler/icons-react";

/**
 * OfflineBanner Component
 *
 * Displays a fixed banner at the top of the page when the user is offline.
 * Uses Mantine's useNetwork hook for network status detection.
 * Automatically hides when the user goes back online.
 */
export function OfflineBanner() {
	const { online } = useNetwork();

	return (
		<Transition mounted={!online} transition="slide-down" duration={300}>
			{(styles) => (
				<Alert
					variant="filled"
					color="orange"
					icon={<IconWifiOff size={20} />}
					style={{
						...styles,
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						zIndex: 1000,
						borderRadius: 0,
					}}
					title="You're offline"
				>
					Some features may not work until you're back online.
				</Alert>
			)}
		</Transition>
	);
}
