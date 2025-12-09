import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
	FLUSH,
	PAUSE,
	PERSIST,
	type PersistConfig,
	PURGE,
	persistReducer,
	persistStore,
	REGISTER,
	REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "@/features/auth/auth.slice";
import themeReducer from "@/features/theme/theme.slice";
import { baseApi, publicApi } from "./api/base.api";

/**
 * Root reducer combining all slices
 */
const rootReducer = combineReducers({
	[baseApi.reducerPath]: baseApi.reducer,
	[publicApi.reducerPath]: publicApi.reducer,
	auth: authReducer,
	theme: themeReducer,
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
	blacklist: [baseApi.reducerPath, publicApi.reducerPath],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Middleware configuration
 */
const middlewareConfig = {
	serializableCheck: {
		ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
		ignoredPaths: ["_persist"],
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
			getDefaultMiddleware(middlewareConfig)
				.concat(baseApi.middleware)
				.concat(publicApi.middleware),
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
