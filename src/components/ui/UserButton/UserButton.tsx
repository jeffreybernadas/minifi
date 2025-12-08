import {
	IconSelector,
	IconSettings,
	IconUser,
	IconLogout,
} from "@tabler/icons-react";
import { Avatar, Group, Text, UnstyledButton, Menu, rem } from "@mantine/core";
import { Link } from "react-router-dom";
import classes from "./UserButton.module.css";
import { useAppSelector } from "@/app/hooks";
import { keycloak } from "@/features/auth";

export function UserButton() {
	const { user } = useAppSelector((state) => state.auth);

	return (
		<Menu
			width={260}
			position="top"
			transitionProps={{ transition: "pop" }}
			withinPortal
		>
			<Menu.Target>
				<UnstyledButton className={classes.user}>
					<Group wrap="nowrap">
						<Avatar
							src={
								user?.picture || "https://avatars.githubusercontent.com/u/0?v=0"
							}
							radius="xl"
							size={38}
						/>

						<div className={classes.userInfo}>
							<Text size="sm" fw={500} lineClamp={1}>
								{user?.name || "User"}
							</Text>

							<Text c="dimmed" size="xs" lineClamp={1}>
								{user?.email || "user@example.com"}
							</Text>
						</div>

						<IconSelector size={16} stroke={1.5} className={classes.icon} />
					</Group>
				</UnstyledButton>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Label>Account</Menu.Label>
				<Menu.Item
					component={Link}
					to="/dashboard/profile"
					leftSection={<IconUser style={{ width: rem(16), height: rem(16) }} />}
				>
					Profile
				</Menu.Item>
				<Menu.Item
					component={Link}
					to="/dashboard/settings"
					leftSection={
						<IconSettings style={{ width: rem(16), height: rem(16) }} />
					}
				>
					Settings
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item
					color="red"
					leftSection={
						<IconLogout style={{ width: rem(16), height: rem(16) }} />
					}
					onClick={() => keycloak.logout()}
				>
					Logout
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}
