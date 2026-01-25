import type { TypedPocketBase, Obligation } from "@/types";

export interface ObligationFilters {
  budgetId?: string;
  projectId?: string;
  billId?: string;
  year?: number;
}

/**
 * Get all obligations with optional filters
 */
export async function getObligations(
  pb: TypedPocketBase,
  filters?: ObligationFilters
): Promise<Obligation[]> {
  const filterParts: string[] = [];

  if (filters?.budgetId) {
    filterParts.push(`budget = "${filters.budgetId}"`);
  }
  if (filters?.projectId) {
    filterParts.push(`project = "${filters.projectId}"`);
  }
  if (filters?.billId) {
    filterParts.push(`bill = "${filters.billId}"`);
  }
  if (filters?.year) {
    const yearStart = `${filters.year}-01-01`;
    const yearEnd = `${filters.year}-12-31`;
    filterParts.push(`(date >= "${yearStart}" && date <= "${yearEnd}")`);
  }

  return pb.collection("obligations").getFullList<Obligation>({
    filter: filterParts.length > 0 ? filterParts.join(" && ") : undefined,
    sort: "-date",
    expand: "budget,project,bill",
  });
}

/**
 * Get obligations by budget ID for a specific year
 */
export async function getObligationsByBudget(
  pb: TypedPocketBase,
  budgetId: string,
  year?: number
): Promise<Obligation[]> {
  return getObligations(pb, { budgetId, year });
}

/**
 * Get obligations by project ID
 */
export async function getObligationsByProject(
  pb: TypedPocketBase,
  projectId: string
): Promise<Obligation[]> {
  return getObligations(pb, { projectId });
}

/**
 * Get obligations by bill ID
 */
export async function getObligationsByBill(
  pb: TypedPocketBase,
  billId: string
): Promise<Obligation[]> {
  return getObligations(pb, { billId });
}

/**
 * Filter obligations by year (for client-side filtering)
 */
export function filterObligationsByYear(
  obligations: Obligation[],
  year: number
): Obligation[] {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  return obligations.filter((o) => {
    const date = o.date || o.created;
    return date >= yearStart && date <= yearEnd;
  });
}

/**
 * Calculate total obligated amounts
 */
export function calculateObligationTotals(obligations: Obligation[]): {
  totalCash: number;
  totalCost: number;
} {
  return obligations.reduce(
    (acc, o) => ({
      totalCash: acc.totalCash + (o.cash || 0),
      totalCost: acc.totalCost + (o.cost || 0),
    }),
    { totalCash: 0, totalCost: 0 }
  );
}
