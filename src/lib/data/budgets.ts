import type {
  TypedPocketBase,
  Budget,
  BudgetItem,
  Obligation,
  Payment,
  Transfer,
} from "@/types";

export interface BudgetWithDetails {
  budget: Budget;
  budgetItem: BudgetItem | null;
  obligations: Obligation[];
  payments: Payment[];
  transfers: Transfer[];
  availableYears: number[];
}

export interface BudgetOverviewData {
  budgets: Budget[];
  items: BudgetItem[];
  allItems: BudgetItem[];
  payments: Payment[];
  transfers: Transfer[];
  obligations: Obligation[];
  availableYears: number[];
}

/**
 * Get all budgets
 */
export async function getBudgets(pb: TypedPocketBase): Promise<Budget[]> {
  return pb.collection("budgets").getFullList<Budget>();
}

/**
 * Get a single budget by ID
 */
export async function getBudgetById(
  pb: TypedPocketBase,
  id: string
): Promise<Budget | null> {
  try {
    return await pb.collection("budgets").getOne<Budget>(id);
  } catch {
    return null;
  }
}

/**
 * Get all budget items with optional year filter
 */
export async function getBudgetItems(
  pb: TypedPocketBase,
  year?: number
): Promise<BudgetItem[]> {
  return pb.collection("budget_items").getFullList<BudgetItem>({
    filter: year ? `year=${year}` : undefined,
    sort: "budget.ref",
    expand: "budget",
  });
}

/**
 * Get budget item for a specific budget and year
 */
export async function getBudgetItemByBudgetAndYear(
  pb: TypedPocketBase,
  budgetId: string,
  year: number
): Promise<BudgetItem | null> {
  const result = await pb.collection("budget_items").getList<BudgetItem>(1, 1, {
    filter: `budget = "${budgetId}" && year = ${year}`,
    expand: "budget",
  });
  return result.items[0] || null;
}

/**
 * Get all budget items for a specific budget (all years)
 */
export async function getBudgetItemsByBudget(
  pb: TypedPocketBase,
  budgetId: string
): Promise<BudgetItem[]> {
  return pb.collection("budget_items").getFullList<BudgetItem>({
    filter: `budget = "${budgetId}"`,
  });
}

/**
 * Get budget with all its related details for a specific year
 */
export async function getBudgetWithDetails(
  pb: TypedPocketBase,
  id: string,
  year: number
): Promise<BudgetWithDetails | null> {
  // Get budget first - let this throw if not found
  let budget: Budget;
  try {
    budget = await pb.collection("budgets").getOne<Budget>(id);
  } catch (e) {
    console.error("Error fetching budget:", e);
    return null;
  }

  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  // Get all related data in parallel - these can fail gracefully
  const [budgetItemResult, allItems, obligations, payments, transfers] =
    await Promise.all([
      pb.collection("budget_items").getList<BudgetItem>(1, 1, {
        filter: `budget = "${id}" && year = ${year}`,
        expand: "budget",
      }),
      pb.collection("budget_items").getFullList<BudgetItem>({
        filter: `budget = "${id}"`,
      }),
      pb.collection("obligations").getFullList<Obligation>({
        filter: `budget = "${id}"`,
        sort: "-date",
        expand: "project,bill,budget",
      }),
      pb.collection("payments").getFullList<Payment>({
        filter: `budget = "${id}"`,
        sort: "-created",
        expand: "project,bill,obligation",
      }),
      pb.collection("transfers").getFullList<Transfer>({
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
}

/**
 * Get budget overview data for a specific year (for index page)
 */
export async function getBudgetOverview(
  pb: TypedPocketBase,
  year: number
): Promise<BudgetOverviewData> {
  const [budgets, allItems, payments, transfers, obligations] = await Promise.all([
    pb.collection("budgets").getFullList<Budget>(),
    pb.collection("budget_items").getFullList<BudgetItem>({
      sort: "budget.ref",
      expand: "budget",
    }),
    pb.collection("payments").getFullList<Payment>({
      sort: "-created",
      expand: "budget,bill,project",
    }),
    pb.collection("transfers").getFullList<Transfer>({
      sort: "-created",
      expand: "from,to",
    }),
    pb.collection("obligations").getFullList<Obligation>({
      sort: "-created",
      expand: "budget,project,bill",
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
}

/**
 * Calculate budget totals from items
 */
export function calculateBudgetTotals(items: BudgetItem[]): {
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
  obligations: Obligation[],
  budgetId: string,
  type: "cash" | "cost" = "cash"
): number {
  return obligations
    .filter((o) => o.budget === budgetId)
    .reduce((sum, o) => sum + (type === "cash" ? o.cash : o.cost || 0), 0);
}

/**
 * Get payments total by budget ID from a list of payments
 */
export function getPaymentsByBudgetId(
  payments: Payment[],
  budgetId: string
): number {
  return payments
    .filter((p) => p.budget === budgetId)
    .reduce((sum, p) => sum + (p.amount || 0), 0);
}
