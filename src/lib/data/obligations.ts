import type { TypedPocketBase, ObligationsResponse } from "@/pocketbase-types";
import { cache, cacheKey } from "@/lib/cache";
import type { ObligationWithExpand } from "./expand-types";

export interface ObligationFilters {
  budgetId?: string;
  projectId?: string;
  year?: number;
}

/**
 * Get all obligations with optional filters
 */
export async function getObligations(
  pb: TypedPocketBase,
  filters?: ObligationFilters
): Promise<ObligationWithExpand[]> {
  const filterKey = filters
    ? [
        filters.budgetId ?? "",
        filters.projectId ?? "",
        filters.year ?? "",
      ].join(":")
    : "all";
  return cache.getOrFetch(
    cacheKey(pb, "obligations", filterKey),
    () => {
      const filterParts: string[] = [];

      if (filters?.budgetId) {
        filterParts.push(`budget = "${filters.budgetId}"`);
      }
      if (filters?.projectId) {
        filterParts.push(`project = "${filters.projectId}"`);
      }
      if (filters?.year) {
        const yearStart = `${filters.year}-01-01`;
        const yearEnd = `${filters.year}-12-31`;
        filterParts.push(`(date >= "${yearStart}" && date <= "${yearEnd}")`);
      }

      return pb.collection("obligations").getFullList<ObligationWithExpand>({
        filter: filterParts.length > 0 ? filterParts.join(" && ") : undefined,
        sort: "-date",
        expand: "budget,project",
      });
    },
    60
  );
}

/**
 * Get obligations by budget ID for a specific year
 */
export async function getObligationsByBudget(
  pb: TypedPocketBase,
  budgetId: string,
  year?: number
): Promise<ObligationWithExpand[]> {
  return getObligations(pb, { budgetId, year });
}

/**
 * Get obligations by project ID
 */
export async function getObligationsByProject(
  pb: TypedPocketBase,
  projectId: string
): Promise<ObligationWithExpand[]> {
  return getObligations(pb, { projectId });
}

/**
 * Filter obligations by year (for client-side filtering)
 */
export function filterObligationsByYear(
  obligations: ObligationsResponse[],
  year: number
): ObligationsResponse[] {
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
export function calculateObligationTotals(obligations: ObligationsResponse[]): {
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
