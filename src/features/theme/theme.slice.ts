import type { MantineColorScheme } from "@mantine/core";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Theme state shape
 * - colorScheme: Mantine color scheme (light, dark, auto)
 * - primaryColor: Mantine primary color key
 */
export interface ThemeState {
	colorScheme: MantineColorScheme;
	primaryColor: string;
}

const initialState: ThemeState = {
	colorScheme: "auto",
	primaryColor: "blue",
};

export const themeSlice = createSlice({
	name: "theme",
	initialState,
	reducers: {
		setColorScheme: (state, action: PayloadAction<MantineColorScheme>) => {
			state.colorScheme = action.payload;
		},

		toggleColorScheme: (state) => {
			if (state.colorScheme === "auto") {
				state.colorScheme = "dark";
			} else if (state.colorScheme === "dark") {
				state.colorScheme = "light";
			} else {
				state.colorScheme = "dark";
			}
		},

		setPrimaryColor: (state, action: PayloadAction<string>) => {
			state.primaryColor = action.payload;
		},
	},
});

export const { setColorScheme, toggleColorScheme, setPrimaryColor } =
	themeSlice.actions;

export default themeSlice.reducer;
