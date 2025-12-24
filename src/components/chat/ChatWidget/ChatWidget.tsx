import { ActionIcon, Indicator, Transition } from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setChatOpen } from "@/features/chat/chat.slice";
import { useGetUserChatsQuery } from "@/app/api/chat.api";
import { useAuth } from "@/hooks";
import { ChatWindow } from "../ChatWindow/ChatWindow";

export function ChatWidget() {
	const dispatch = useAppDispatch();
	const { isPro, isAdmin } = useAuth();
	const { isOpen } = useAppSelector((state) => state.chat);

	// Fetch chats to get unread count
	const { data: chats = [] } = useGetUserChatsQuery(undefined, {
		// Only fetch when widget is visible (PRO user, not admin)
		skip: !isPro || isAdmin,
	});

	// Calculate total unread count across all chats
	const totalUnreadCount = chats.reduce(
		(sum, chat) => sum + (chat.unreadCount ?? 0),
		0,
	);

	const toggleChat = () => {
		dispatch(setChatOpen(!isOpen));
	};

	// Hide widget for admins and non pro users
	if (!isPro || isAdmin) return null;

	return (
		<>
			{/* Chat Window */}
			<Transition
				mounted={isOpen}
				transition="slide-up"
				duration={200}
				timingFunction="ease"
			>
				{(styles) => (
					<div
						style={{
							...styles,
							position: "fixed",
							bottom: 20,
							right: 20,
							zIndex: 1000,
						}}
					>
						<ChatWindow />
					</div>
				)}
			</Transition>

			{/* Toggle Button */}
			<Transition
				mounted={!isOpen}
				transition="scale"
				duration={200}
				timingFunction="ease"
			>
				{(styles) => (
					<div
						style={{
							...styles,
							position: "fixed",
							bottom: 20,
							right: 20,
							zIndex: 1000,
						}}
					>
						<Indicator
							label={totalUnreadCount > 99 ? "99+" : totalUnreadCount}
							size={16}
							color="red"
							offset={4}
							disabled={totalUnreadCount === 0}
						>
							<ActionIcon
								variant="filled"
								color="blue"
								size={56}
								radius="xl"
								onClick={toggleChat}
							>
								<IconMessageCircle size={28} />
							</ActionIcon>
						</Indicator>
					</div>
				)}
			</Transition>
		</>
	);
}
