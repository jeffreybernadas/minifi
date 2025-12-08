import {
	Group,
	Burger,
	ActionIcon,
	Text,
	UnstyledButton,
	rem,
	Container,
} from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toggleColorScheme } from "@/features/theme";
import { keycloak } from "@/features/auth";
import { Logo } from "@/components/ui";
import classes from "./Header.module.css";

interface HeaderProps {
	/** Burger menu opened state */
	mobileOpened: boolean;
	/** Desktop nav opened state */
	desktopOpened: boolean;
	/** Toggle mobile burger menu */
	toggleMobile: () => void;
	/** Toggle desktop nav */
	toggleDesktop: () => void;
	/** Whether sidebar is shown (hide burgers if false) */
	withSidebar?: boolean;
}

export function Header({
	mobileOpened,
	desktopOpened,
	toggleMobile,
	toggleDesktop,
	withSidebar = false,
}: HeaderProps) {
	const dispatch = useAppDispatch();
	const { isAuthenticated, user } = useAppSelector((state) => state.auth);
	const { colorScheme } = useAppSelector((state) => state.theme);

	const isDark = colorScheme === "dark";

	const headerContent = (
		<Group h="100%" justify="space-between">
			{/* Left: Logo + Burger */}
			<Group>
				{withSidebar && (
					<>
						<Burger
							opened={mobileOpened}
							onClick={toggleMobile}
							hiddenFrom="sm"
							size="sm"
						/>
						<Burger
							opened={desktopOpened}
							onClick={toggleDesktop}
							visibleFrom="sm"
							size="sm"
						/>
					</>
				)}
				<Logo />
			</Group>

			{/* Right: Theme toggle + User menu */}
			<Group>
				{/* Theme Toggle */}
				<ActionIcon
					variant="default"
					onClick={() => dispatch(toggleColorScheme())}
					size="lg"
				>
					{isDark ? (
						<IconSun style={{ width: rem(20), height: rem(20) }} />
					) : (
						<IconMoon style={{ width: rem(20), height: rem(20) }} />
					)}
				</ActionIcon>

				{/* Login Button */}
				{!(isAuthenticated && user) && (
					<Group>
						<UnstyledButton onClick={() => keycloak.login()}>
							<Text size="sm" fw={500}>
								Login
							</Text>
						</UnstyledButton>
					</Group>
				)}
			</Group>
		</Group>
	);

	return withSidebar ? (
		<div className={classes.headerWrapper}>{headerContent}</div>
	) : (
		<Container size={1400} px="md" h="100%">
			{headerContent}
		</Container>
	);
}
