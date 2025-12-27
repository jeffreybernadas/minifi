// Advisory types matching backend DTOs

export type AdvisoryType = "INFO" | "WARNING" | "MAINTENANCE" | "CRITICAL";
export type AdvisoryStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Advisory {
	id: string;
	title: string;
	content: string;
	type: AdvisoryType;
	status: AdvisoryStatus;
	publishedAt: string | null;
	expiresAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AdvisoryListItem extends Advisory {
	dismissalCount: number;
}

export interface CreateAdvisoryDto {
	title: string;
	content: string;
	type?: AdvisoryType;
	expiresAt?: string;
}

export interface UpdateAdvisoryDto {
	title?: string;
	content?: string;
	type?: AdvisoryType;
	expiresAt?: string | null;
}

export interface AdvisoryFilterDto {
	page?: number;
	limit?: number;
	status?: AdvisoryStatus;
	type?: AdvisoryType;
}
