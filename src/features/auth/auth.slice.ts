import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * User info extracted from Keycloak token
 */
export interface AuthUser {
	id: string;
	email: string;
	name: string;
	username: string;
	roles: string[];
}

/**
 * Auth state shape
 */
export interface AuthState {
	isInitialized: boolean;
	isAuthenticated: boolean;
	user: AuthUser | null;
}

const initialState: AuthState = {
	isInitialized: false,
	isAuthenticated: false,
	user: null,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		/**
		 * Called after Keycloak.init() completes
		 */
		setInitialized: (state, action: PayloadAction<boolean>) => {
			state.isInitialized = action.payload;
		},

		/**
		 * Called when user authenticates successfully
		 */
		setAuthenticated: (state, action: PayloadAction<AuthUser>) => {
			state.isAuthenticated = true;
			state.user = action.payload;
		},

		/**
		 * Called on logout or session expiry
		 */
		clearAuth: (state) => {
			state.isAuthenticated = false;
			state.user = null;
		},
	},
});

export const { setInitialized, setAuthenticated, clearAuth } =
	authSlice.actions;

export default authSlice.reducer;
