import { ActionIcon, Indicator, Transition } from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setChatOpen } from "@/features/chat/chat.slice";
import { useAuth } from "@/hooks";
import { ChatWindow } from "../ChatWindow/ChatWindow";

export function ChatWidget() {
	const dispatch = useAppDispatch();
	const { isPro, isAdmin } = useAuth();
	const { isOpen } = useAppSelector((state) => state.chat);

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
							label={2}
							size={16}
							color="red"
							offset={4}
							disabled={false}
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
