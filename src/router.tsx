import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { RouteErrorBoundary } from "@/components/common";
import { AppShell } from "@/components/layout";
import { useAuth } from "./hooks";

/**
 * Helper to create lazy route with nprogress
 * Uses try/finally to ensure progress always completes
 */
const lazyLoad = (
	importFn: () => Promise<{ default: React.ComponentType }>,
) => {
	return async () => {
		nprogress.start();
		try {
			const module = await importFn();
			return { Component: module.default };
		} finally {
			nprogress.complete();
		}
	};
};

/**
 * Auth Guard - Redirects to landing if not authenticated
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isInitialized } = useAppSelector(
		(state) => state.auth,
	);

	if (!isInitialized) {
		return null; // App.tsx handles loading state
	}

	if (!isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return <Suspense fallback={null}>{children}</Suspense>;
}

/**
 * Admin Guard - Redirects to dashboard if not admin
 */
function AdminGuard({ children }: { children: React.ReactNode }) {
	const { isAdmin } = useAuth();
	const { isAuthenticated, isInitialized } = useAppSelector(
		(state) => state.auth,
	);

	if (!isInitialized) {
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	if (!isAdmin) {
		return <Navigate to="/dashboard" replace />;
	}

	return <Suspense fallback={null}>{children}</Suspense>;
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
 * - /dashboard/links/:id (Link details + analytics)
 * - /dashboard/analytics/overview (Global analytics)
 * - /dashboard/analytics/audience (Audience analytics)
 * - /dashboard/analytics/geo (Geographic analytics)
 * - /dashboard/tags
 * - /dashboard/settings
 *
 * Admin routes (require admin role):
 * - /admin
 * - /admin/users
 * - /admin/links
 */
export const router = createBrowserRouter([
	// Public routes (no sidebar)
	{
		element: <AppShell withSidebar={false} />,
		errorElement: <RouteErrorBoundary />,
		children: [
			{
				path: "/",
				lazy: lazyLoad(() => import("@/pages/LandingPage")),
			},
			{
				path: "/r/:code",
				lazy: lazyLoad(() => import("@/pages/RedirectPage")),
			},
		],
	},

	// Protected routes (require authentication, with sidebar)
	{
		element: (
			<AuthGuard>
				<AppShell withSidebar={true} />
			</AuthGuard>
		),
		errorElement: <RouteErrorBoundary />,
		children: [
			{
				path: "/dashboard",
				lazy: lazyLoad(() => import("@/pages/dashboard/DashboardPage")),
			},
			{
				path: "/dashboard/links/:id",
				lazy: lazyLoad(() => import("@/pages/dashboard/LinkDetailPage")),
			},
			{
				path: "/dashboard/analytics",
				children: [
					{
						index: true,
						element: <Navigate to="/dashboard/analytics/overview" replace />,
					},
					{
						path: "overview",
						lazy: lazyLoad(
							() => import("@/pages/dashboard/analytics/AnalyticsOverviewPage"),
						),
					},
					{
						path: "audience",
						lazy: lazyLoad(
							() => import("@/pages/dashboard/analytics/AnalyticsAudiencePage"),
						),
					},
					{
						path: "geo",
						lazy: lazyLoad(
							() =>
								import("@/pages/dashboard/analytics/AnalyticsGeographyPage"),
						),
					},
				],
			},
			{
				path: "/dashboard/tags",
				lazy: lazyLoad(() => import("@/pages/dashboard/TagsPage")),
			},
			{
				path: "/dashboard/profile",
				lazy: lazyLoad(() => import("@/pages/dashboard/ProfilePage")),
			},
			{
				path: "/dashboard/settings",
				lazy: lazyLoad(() => import("@/pages/dashboard/SettingsPage")),
			},
		],
	},

	// Admin routes (require admin role, with sidebar)
	{
		element: (
			<AdminGuard>
				<AppShell withSidebar={true} />
			</AdminGuard>
		),
		errorElement: <RouteErrorBoundary />,
		children: [
			{
				path: "/admin",
				lazy: lazyLoad(() => import("@/pages/admin/AdminDashboardPage")),
			},
			{
				path: "/admin/users",
				lazy: lazyLoad(() => import("@/pages/admin/AdminUsersPage")),
			},
			{
				path: "/admin/links",
				lazy: lazyLoad(() => import("@/pages/admin/AdminLinksPage")),
			},
			{
				path: "/admin/links/:id",
				lazy: lazyLoad(() => import("@/pages/admin/AdminLinkDetailPage")),
			},
			{
				path: "/admin/chat",
				lazy: lazyLoad(() => import("@/pages/admin/AdminChatPage")),
			},
			{
				path: "/admin/advisories",
				lazy: lazyLoad(() => import("@/pages/admin/AdminAdvisoriesPage")),
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
