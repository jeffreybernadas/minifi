export const formatTime = (date: string) => {
	const messageDate = new Date(date);
	const now = new Date();
	const diffMs = now.getTime() - messageDate.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;

	return messageDate.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year:
			messageDate.getFullYear() === now.getFullYear() ? undefined : "numeric",
	});
};
