import type { TypedPocketBase, TransfersResponse } from "@/pocketbase-types";
import { cache, cacheKey } from "@/lib/cache";

export interface TransferFilters {
  budgetId?: string;
  year?: number;
}

/**
 * Get all transfers with optional filters
 */
export async function getTransfers(
  pb: TypedPocketBase,
  filters?: TransferFilters
): Promise<TransfersResponse[]> {
  const filterKey = filters
    ? [filters.budgetId ?? "", filters.year ?? ""].join(":")
    : "all";
  return cache.getOrFetch(
    cacheKey(pb, "transfers", filterKey),
    () => {
      const filterParts: string[] = [];

      if (filters?.budgetId) {
        filterParts.push(`(from = "${filters.budgetId}" || to = "${filters.budgetId}")`);
      }
      if (filters?.year) {
        const yearStart = `${filters.year}-01-01`;
        const yearEnd = `${filters.year}-12-31`;
        filterParts.push(`(created >= "${yearStart}" && created <= "${yearEnd}")`);
      }

      return pb.collection("transfers").getFullList<TransfersResponse>({
        filter: filterParts.length > 0 ? filterParts.join(" && ") : undefined,
        sort: "-created",
        expand: "from,to",
      });
    },
    60
  );
}

/**
 * Get transfers by budget ID for a specific year
 */
export async function getTransfersByBudget(
  pb: TypedPocketBase,
  budgetId: string,
  year?: number
): Promise<TransfersResponse[]> {
  return getTransfers(pb, { budgetId, year });
}

/**
 * Filter transfers by year (for client-side filtering)
 */
export function filterTransfersByYear(transfers: TransfersResponse[], year: number): TransfersResponse[] {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  return transfers.filter((t) => {
    const date = t.created;
    return date >= yearStart && date <= yearEnd;
  });
}

/**
 * Calculate transfers in/out for a budget
 */
export function calculateTransferTotals(
  transfers: TransfersResponse[],
  budgetId: string
): { transfersIn: number; transfersOut: number } {
  return transfers.reduce(
    (acc, t) => ({
      transfersIn: acc.transfersIn + (t.to === budgetId ? (t.cash || 0) : 0),
      transfersOut: acc.transfersOut + (t.from === budgetId ? (t.cash || 0) : 0),
    }),
    { transfersIn: 0, transfersOut: 0 }
  );
}
