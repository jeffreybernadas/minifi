import { AppShell as MantineAppShell, Container } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import { Header } from "../Header";
import { Sidebar } from "../Sidebar";
import { Footer } from "../Footer";

interface AppShellProps {
	/** Whether to show the sidebar (for authenticated pages) */
	withSidebar?: boolean;
}

export function AppShell({ withSidebar = false }: AppShellProps) {
	const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
	const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

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
				<MantineAppShell.Navbar>
					<Sidebar />
				</MantineAppShell.Navbar>
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
