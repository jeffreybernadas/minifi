import { createTheme } from "@mantine/core";

/**
 * Mantine theme customization
 *
 * Mostly uses Mantine defaults with minor tweaks:
 * - Primary color set to blue (can be changed)
 * - Component defaults for consistency
 * - Enhanced dark mode colors for better contrast
 */
export const theme = createTheme({
	/** Primary color used for buttons, links, etc. */
	primaryColor: "blue",

	/** Default border radius for components */
	defaultRadius: "md",

	/** Component-specific defaults */
	components: {
		Button: {
			defaultProps: {
				radius: "sm",
			},
		},
		TextInput: {
			defaultProps: {
				radius: "md",
			},
		},
		Card: {
			defaultProps: {
				radius: "md",
				withBorder: true,
			},
		},
		Paper: {
			defaultProps: {
				radius: "md",
			},
		},
		Modal: {
			defaultProps: {
				radius: "md",
			},
		},
	},
});
