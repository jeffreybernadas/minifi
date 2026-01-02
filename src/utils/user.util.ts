/**
 * User display utilities
 */

interface UserLike {
	firstName?: string | null;
	lastName?: string | null;
	email: string;
}

/**
 * Get user initials from name or email
 * Returns up to 2 characters based on first/last name, or first letter of email
 */
export const getUserInitials = (user: UserLike): string => {
	if (user.firstName && user.lastName) {
		return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
	}
	if (user.firstName) {
		return user.firstName.charAt(0).toUpperCase();
	}
	return user.email.charAt(0).toUpperCase();
};

/**
 * Get display name for user
 * Returns full name if available, otherwise email
 */
export const getDisplayName = (user: UserLike): string => {
	if (user.firstName || user.lastName) {
		return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
	}
	return user.email;
};
