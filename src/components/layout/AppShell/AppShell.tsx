import { Container, AppShell as MantineAppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import { useGetUserProfileQuery } from "@/app/api/user.api";
import { ChatWidget } from "@/components/chat";
import { Footer } from "../Footer";
import { Header } from "../Header";
import { Sidebar } from "../Sidebar";

interface AppShellProps {
	/** Whether to show the sidebar (for authenticated pages) */
	withSidebar?: boolean;
}

export function AppShell({ withSidebar = false }: AppShellProps) {
	const [mobileOpened, mobileHandlers] = useDisclosure();
	const [desktopOpened, desktopHandlers] = useDisclosure(true);
	const { toggle: toggleMobile, close: closeMobile } = mobileHandlers;
	const { toggle: toggleDesktop } = desktopHandlers;

	// Pre-fetch user profile for authenticated pages (with sidebar)
	// This ensures profile data is available for UserButton and other components
	// Skip query if not authenticated (withSidebar=false)
	useGetUserProfileQuery(undefined, {
		skip: !withSidebar,
	});

	return (
		<MantineAppShell
			header={{ height: 60 }}
			navbar={
				withSidebar
					? {
							width: 250,
							breakpoint: "sm",
							collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
						}
					: undefined
			}
			layout="alt"
			padding={withSidebar ? "md" : 0}
		>
			<MantineAppShell.Header>
				<Header
					mobileOpened={mobileOpened}
					desktopOpened={desktopOpened}
					toggleMobile={toggleMobile}
					toggleDesktop={toggleDesktop}
					withSidebar={withSidebar}
				/>
			</MantineAppShell.Header>

			{withSidebar && (
				<>
					<MantineAppShell.Navbar>
						<Sidebar onCloseMobile={closeMobile} />
					</MantineAppShell.Navbar>
					<ChatWidget />
				</>
			)}

			<MantineAppShell.Main>
				{!withSidebar ? (
					<>
						<Container size={1400} px="md" py="md" my={0}>
							<Outlet />
						</Container>
						<Container size={1400} px="md">
							<Footer />
						</Container>
					</>
				) : (
					<Outlet />
				)}
			</MantineAppShell.Main>
		</MantineAppShell>
	);
}
