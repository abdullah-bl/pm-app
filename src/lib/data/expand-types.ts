/**
 * Central expand types for PocketBase API responses.
 * Use these wherever you need typed expand (pages, data layer, components).
 * Re-export from @/lib/data for convenience.
 */

import type {
	BudgetsResponse,
	BudgetItemsResponse,
	ObligationsResponse,
	PaymentsResponse,
	PhasesResponse,
	ProjectLogsResponse,
	ProjectsResponse,
	TransfersResponse,
	UsersResponse,
} from "@/pocketbase-types";

// --- Project detail page (getProjectWithDetails) ---

export type ProjectWithExpand = ProjectsResponse<{
	phase: PhasesResponse;
	assignee: UsersResponse[];
}>;

export type ObligationWithExpand = ObligationsResponse<{
	budget: BudgetsResponse;
	project: ProjectsResponse;
}>;

export type PaymentWithExpand = PaymentsResponse<{
	project: ProjectsResponse;
	obligation: ObligationsResponse;
}>;

export type ProjectLogWithExpand = ProjectLogsResponse<{
	phase: PhasesResponse;
	previous_phase: PhasesResponse;
	by: UsersResponse;
}>;

// --- Search page ---

export type ProjectWithPhaseExpand = ProjectsResponse<{
	phase: PhasesResponse;
}>;

export type BudgetItemWithBudgetExpand = BudgetItemsResponse<{
	budget: BudgetsResponse;
}>;

// --- Transfers (expand from, to) - use in budget/transfer views if needed ---

export type TransferWithExpand = TransfersResponse<{
	from: BudgetsResponse;
	to: BudgetsResponse;
}>;
