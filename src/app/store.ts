import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
	type PersistConfig,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { baseApi } from "./api/base.api";

/**
 * Root reducer combining all slices
 */
const rootReducer = combineReducers({
	// RTK Query API reducer (not persisted)
	[baseApi.reducerPath]: baseApi.reducer,
	// Feature slices will be added here
	// auth: authReducer,
	// theme: themeReducer,
	// chat: chatReducer,
});

// Infer root state type from rootReducer
type RootReducerState = ReturnType<typeof rootReducer>;

/**
 * Redux Persist configuration
 * - Whitelist specific slices to persist (theme, etc.)
 * - Blacklist RTK Query cache (should not be persisted)
 */
const persistConfig: PersistConfig<RootReducerState> = {
	key: "minifi",
	version: 1,
	storage,
	// Only persist these slices
	whitelist: ["theme"],
	// Never persist these (RTK Query handles its own caching)
	blacklist: [baseApi.reducerPath],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Middleware configuration shared between test and production stores
 */
const middlewareConfig = {
	serializableCheck: {
		// Ignore redux-persist actions
		ignoredActions: [
			FLUSH,
			REHYDRATE,
			PAUSE,
			PERSIST,
			PURGE,
			REGISTER,
			// Keycloak instance is non-serializable
			"auth/setKeycloak",
		],
		// Ignore these paths in the state
		ignoredPaths: ["auth.keycloak", "_persist"],
	},
};

/**
 * Create store with optional preloaded state
 */
export const createStore = (
	preloadedState?: Parameters<
		typeof configureStore<ReturnType<typeof persistedReducer>>
	>[0]["preloadedState"],
) => {
	return configureStore({
		reducer: persistedReducer,
		preloadedState,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware(middlewareConfig).concat(baseApi.middleware),
		devTools: import.meta.env.DEV,
	});
};

export const store = createStore();

// Create persistor for PersistGate
export const persistor = persistStore(store);

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = RootReducerState;
export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = typeof store.dispatch;
