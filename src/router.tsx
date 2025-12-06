import { Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { useAppSelector } from "@/app/hooks";

/**
 * Auth Guard - Redirects to landing if not authenticated
 */
function AuthGuard() {
	const { isAuthenticated, isInitialized } = useAppSelector(
		(state) => state.auth,
	);

	if (!isInitialized) {
		return null; // App.tsx handles loading state
	}

	if (!isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return (
		<Suspense fallback={null}>
			<Outlet />
		</Suspense>
	);
}

/**
 * Admin Guard - Redirects to dashboard if not admin
 */
function AdminGuard() {
	const { isAuthenticated, isInitialized, user } = useAppSelector(
		(state) => state.auth,
	);

	if (!isInitialized) {
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	const isAdmin = user?.roles.some(
		(role) => role === "admin" || role === "superadmin",
	);

	if (!isAdmin) {
		return <Navigate to="/dashboard" replace />;
	}

	return (
		<Suspense fallback={null}>
			<Outlet />
		</Suspense>
	);
}

/**
 * Router configuration
 *
 * Public routes:
 * - / (Landing)
 * - /r/:code (Redirect)
 *
 * Protected routes (require auth):
 * - /dashboard
 * - /dashboard/links/:id
 * - /dashboard/analytics
 * - /dashboard/analytics/:id
 * - /dashboard/tags
 * - /dashboard/settings
 *
 * Admin routes (require admin role):
 * - /admin
 * - /admin/users
 * - /admin/links
 */
export const router = createBrowserRouter([
	// Public routes
	{
		path: "/",
		lazy: async () => {
			nprogress.start();
			const module = await import("@/pages/LandingPage");
			nprogress.complete();
			return { Component: module.default };
		},
	},
	{
		path: "/r/:code",
		lazy: async () => {
			nprogress.start();
			const module = await import("@/pages/RedirectPage");
			nprogress.complete();
			return { Component: module.default };
		},
	},

	// Protected routes (require authentication)
	{
		element: <AuthGuard />,
		children: [
			{
				path: "/dashboard",
				lazy: async () => {
					nprogress.start();
					const module = await import("@/pages/dashboard/DashboardPage");
					nprogress.complete();
					return { Component: module.default };
				},
			},
			{
				path: "/dashboard/links/:id",
				lazy: async () => {
					nprogress.start();
					const module = await import("@/pages/dashboard/LinkDetailPage");
					nprogress.complete();
					return { Component: module.default };
				},
			},
			{
				path: "/dashboard/analytics",
				lazy: async () => {
					nprogress.start();
					const module = await import("@/pages/dashboard/AnalyticsPage");
					nprogress.complete();
					return { Component: module.default };
				},
			},
			{
				path: "/dashboard/analytics/:id",
				lazy: async () => {
					nprogress.start();
					const module = await import("@/pages/dashboard/LinkAnalyticsPage");
					nprogress.complete();
					return { Component: module.default };
				},
			},
			{
				path: "/dashboard/tags",
				lazy: async () => {
					nprogress.start();
					const module = await import("@/pages/dashboard/TagsPage");
					nprogress.complete();
					return { Component: module.default };
				},
			},
			{
				path: "/dashboard/settings",
				lazy: async () => {
					nprogress.start();
					const module = await import("@/pages/dashboard/SettingsPage");
					nprogress.complete();
					return { Component: module.default };
				},
			},
		],
	},

	// Admin routes (require admin role)
	{
		element: <AdminGuard />,
		children: [
			{
				path: "/admin",
				lazy: async () => {
					nprogress.start();
					const module = await import("@/pages/admin/AdminDashboardPage");
					nprogress.complete();
					return { Component: module.default };
				},
			},
			{
				path: "/admin/users",
				lazy: async () => {
					nprogress.start();
					const module = await import("@/pages/admin/AdminUsersPage");
					nprogress.complete();
					return { Component: module.default };
				},
			},
			{
				path: "/admin/links",
				lazy: async () => {
					nprogress.start();
					const module = await import("@/pages/admin/AdminLinksPage");
					nprogress.complete();
					return { Component: module.default };
				},
			},
		],
	},

	// Catch-all redirect
	{
		path: "*",
		element: <Navigate to="/" replace />,
	},
]);

export { NavigationProgress };
