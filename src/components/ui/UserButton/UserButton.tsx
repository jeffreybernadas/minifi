import { Avatar, Group, Menu, rem, Text, UnstyledButton } from "@mantine/core";
import {
	IconLogout,
	IconSelector,
	IconSettings,
	IconUser,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useGetUserProfileQuery } from "@/app/api/user.api";
import { UserBadges } from "@/components/ui";
import { keycloak } from "@/features/auth";
import { useAuth } from "@/hooks";
import classes from "./UserButton.module.css";

interface UserButtonProps {
	onNavigate?: () => void;
}

export function UserButton({ onNavigate }: UserButtonProps) {
	const { data: profile } = useGetUserProfileQuery();
	const { isAdmin } = useAuth();

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
								profile?.avatarUrl ||
								"https://avatars.githubusercontent.com/u/0?v=0"
							}
							radius="xl"
							size={38}
						/>

						<div className={classes.userInfo}>
							<Group gap={4} wrap="nowrap">
								<Text
									size="sm"
									fw={500}
									lineClamp={1}
									style={{ flex: 1, minWidth: 0 }}
								>
									{profile?.name || "Loading..."}
								</Text>
								<UserBadges isAdmin={isAdmin} size="xs" />
							</Group>

							<Group gap={4} wrap="nowrap">
								<Text
									c="dimmed"
									size="xs"
									lineClamp={1}
									style={{ flex: 1, minWidth: 0 }}
								>
									{profile?.email || "Loading..."}
								</Text>
								{!isAdmin && (
									<UserBadges userType={profile?.userType} size="xs" />
								)}
							</Group>
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
					onClick={() => onNavigate?.()}
					leftSection={<IconUser style={{ width: rem(16), height: rem(16) }} />}
				>
					Profile
				</Menu.Item>
				<Menu.Item
					component={Link}
					to="/dashboard/settings"
					onClick={() => onNavigate?.()}
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
