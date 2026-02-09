import type {
  TypedPocketBase,
  BudgetsResponse,
  BudgetItemsResponse,
  ObligationsResponse,
  PaymentsResponse,
  TransfersResponse,
} from "@/pocketbase-types";
import { cache, cacheKey } from "@/lib/cache";

export interface BudgetWithDetails {
  budget: BudgetsResponse;
  budgetItem: BudgetItemsResponse | null;
  obligations: ObligationsResponse[];
  payments: PaymentsResponse[];
  transfers: TransfersResponse[];
  availableYears: number[];
}

export interface BudgetOverviewData {
  budgets: BudgetsResponse[];
  items: BudgetItemsResponse[];
  allItems: BudgetItemsResponse[];
  payments: PaymentsResponse[];
  transfers: TransfersResponse[];
  obligations: ObligationsResponse[];
  availableYears: number[];
}

/**
 * Get all budgets
 */
export async function getBudgets(pb: TypedPocketBase): Promise<BudgetsResponse[]> {
  return cache.getOrFetch(
    cacheKey(pb, "budgets", "list"),
    () => pb.collection("budgets").getFullList<BudgetsResponse>(),
    60
  );
}

/**
 * Get a single budget by ID
 */
export async function getBudgetById(
  pb: TypedPocketBase,
  id: string
): Promise<BudgetsResponse | null> {
  return cache.getOrFetch(
    cacheKey(pb, "budget", id),
    async () => {
      try {
        return await pb.collection("budgets").getOne<BudgetsResponse>(id);
      } catch {
        return null;
      }
    },
    60
  );
}

/**
 * Get all budget items with optional year filter
 */
export async function getBudgetItems(
  pb: TypedPocketBase,
  year?: number
): Promise<BudgetItemsResponse[]> {
  return cache.getOrFetch(
    cacheKey(pb, "budget_items", "list", String(year ?? "all")),
    () =>
      pb.collection("budget_items").getFullList<BudgetItemsResponse>({
        filter: year ? `year=${year}` : undefined,
        sort: "budget.ref",
        expand: "budget",
      }),
    60
  );
}

/**
 * Get budget item for a specific budget and year
 */
export async function getBudgetItemByBudgetAndYear(
  pb: TypedPocketBase,
  budgetId: string,
  year: number
): Promise<BudgetItemsResponse | null> {
  return cache.getOrFetch(
    cacheKey(pb, "budget_item", budgetId, String(year)),
    async () => {
      const result = await pb.collection("budget_items").getList<BudgetItemsResponse>(1, 1, {
        filter: `budget = "${budgetId}" && year = ${year}`,
        expand: "budget",
      });
      return result.items[0] || null;
    },
    60
  );
}

/**
 * Get all budget items for a specific budget (all years)
 */
export async function getBudgetItemsByBudget(
  pb: TypedPocketBase,
  budgetId: string
): Promise<BudgetItemsResponse[]> {
  return cache.getOrFetch(
    cacheKey(pb, "budget_items", "by_budget", budgetId),
    () =>
      pb.collection("budget_items").getFullList<BudgetItemsResponse>({
        filter: `budget = "${budgetId}"`,
      }),
    60
  );
}

/**
 * Get budget with all its related details for a specific year
 */
export async function getBudgetWithDetails(
  pb: TypedPocketBase,
  id: string,
  year: number
): Promise<BudgetWithDetails | null> {
  return cache.getOrFetch(
    cacheKey(pb, "budget", id, "details", String(year)),
    async () => {
      // Get budget first - let this throw if not found
      let budget: BudgetsResponse;
      try {
        budget = await pb.collection("budgets").getOne<BudgetsResponse>(id);
      } catch (e) {
        console.error("Error fetching budget:", e);
        return null;
      }

      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;

      // Get all related data in parallel - these can fail gracefully
      const [budgetItemResult, allItems, obligations, payments, transfers] =
        await Promise.all([
          pb.collection("budget_items").getList<BudgetItemsResponse>(1, 1, {
            filter: `budget = "${id}" && year = ${year}`,
            expand: "budget",
          }),
          pb.collection("budget_items").getFullList<BudgetItemsResponse>({
            filter: `budget = "${id}"`,
          }),
          pb.collection("obligations").getFullList<ObligationsResponse>({
            filter: `budget = "${id}"`,
            sort: "-date",
            expand: "project,budget",
          }),
          pb.collection("payments").getFullList<PaymentsResponse>({
            sort: "-created",
            expand: "project,obligation",
          }),
          pb.collection("transfers").getFullList<TransfersResponse>({
            filter: `(from = "${id}" || to = "${id}")`,
            sort: "-created",
            expand: "from,to",
          }),
        ]);

      // Filter by year on client side (simpler and avoids date filter issues)
      const yearObligations = obligations.filter((o) => {
        const date = o.date || o.created;
        return date >= yearStart && date <= yearEnd;
      });

      const yearPayments = payments.filter((p) => {
        return p.created >= yearStart && p.created <= yearEnd;
      });

      const yearTransfers = transfers.filter((t) => {
        return t.created >= yearStart && t.created <= yearEnd;
      });

      const availableYears = [...new Set(allItems.map((item) => item.year))].sort(
        (a, b) => b - a
      );

      return {
        budget,
        budgetItem: budgetItemResult.items[0] || null,
        obligations: yearObligations,
        payments: yearPayments,
        transfers: yearTransfers,
        availableYears,
      };
    },
    60
  );
}

/**
 * Get budget overview data for a specific year (for index page)
 */
export async function getBudgetOverview(
  pb: TypedPocketBase,
  year: number
): Promise<BudgetOverviewData> {
  return cache.getOrFetch(
    cacheKey(pb, "budget_overview", String(year)),
    async () => {
      const [budgets, allItems, payments, transfers, obligations] = await Promise.all([
        pb.collection("budgets").getFullList<BudgetsResponse>(),
        pb.collection("budget_items").getFullList<BudgetItemsResponse>({
          sort: "budget.ref",
          expand: "budget",
        }),
        pb.collection("payments").getFullList<PaymentsResponse>({
          sort: "-created",
          expand: "project,obligation",
        }),
        pb.collection("transfers").getFullList<TransfersResponse>({
          sort: "-created",
          expand: "from,to",
        }),
        pb.collection("obligations").getFullList<ObligationsResponse>({
          sort: "-created",
          expand: "budget,project",
        }),
      ]);

      // Get unique years
      const currentYear = new Date().getFullYear();
      const availableYears = [...new Set(allItems.map((item) => item.year))].sort(
        (a, b) => b - a
      );
      if (!availableYears.includes(currentYear)) {
        availableYears.unshift(currentYear);
      }

      // Filter items by selected year
      const items = allItems.filter((item) => item.year === year);

      return {
        budgets,
        items,
        allItems,
        payments,
        transfers,
        obligations,
        availableYears,
      };
    },
    60
  );
}

/**
 * Calculate budget totals from items
 */
export function calculateBudgetTotals(items: BudgetItemsResponse[]): {
  totalCash: number;
  totalCost: number;
} {
  return items.reduce(
    (acc, item) => ({
      totalCash: acc.totalCash + (item.cash || 0),
      totalCost: acc.totalCost + (item.cost || 0),
    }),
    { totalCash: 0, totalCost: 0 }
  );
}

/**
 * Get obligations total by budget ID from a list of obligations
 */
export function getObligationsByBudgetId(
  obligations: ObligationsResponse[],
  budgetId: string,
  type: "cash" | "cost" = "cash"
): number {
  return obligations
    .filter((o) => o.budget === budgetId)
    .reduce((sum, o) => sum + (type === "cash" ? o.cash : o.cost || 0), 0);
}

/**
 * Get payments total by budget ID from a list of payments (only status = "paid")
 */
export function getPaymentsByBudgetId(
  payments: PaymentsResponse[],
  budgetId: string
): number {
  return payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
}
