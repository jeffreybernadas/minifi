import {
	useDispatch,
	useSelector,
	useStore,
	type TypedUseSelectorHook,
} from "react-redux";
import type { AppDispatch, RootState } from "./store";

/**
 * Typed version of useDispatch hook
 * Use this instead of plain `useDispatch` for proper type inference
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Typed version of useSelector hook
 * Use this instead of plain `useSelector` for proper type inference
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Typed version of useStore hook
 * Use this instead of plain `useStore` for proper type inference
 */
export const useAppStore = useStore.withTypes<typeof import("./store").store>();
