import type { TypedPocketBase, PaymentsResponse, PaymentsStatusOptions } from "@/pocketbase-types";
import { cache, cacheKey } from "@/lib/cache";
import type { PaymentWithExpand } from "./expand-types";

export interface PaymentFilters {
  projectId?: string;
  obligationId?: string;
  status?: PaymentsStatusOptions;
  year?: number;
}

/**
 * Get all payments with optional filters
 */
export async function getPayments(
  pb: TypedPocketBase,
  filters?: PaymentFilters
): Promise<PaymentWithExpand[]> {
  const filterKey = filters
    ? [
        filters.projectId ?? "",
        filters.obligationId ?? "",
        filters.status ?? "",
        filters.year ?? "",
      ].join(":")
    : "all";
  return cache.getOrFetch(
    cacheKey(pb, "payments", filterKey),
    () => {
      const filterParts: string[] = [];

      if (filters?.projectId) {
        filterParts.push(`project = "${filters.projectId}"`);
      }
      if (filters?.obligationId) {
        filterParts.push(`obligation = "${filters.obligationId}"`);
      }
      if (filters?.status) {
        filterParts.push(`status = "${filters.status}"`);
      }
      if (filters?.year) {
        const yearStart = `${filters.year}-01-01`;
        const yearEnd = `${filters.year}-12-31`;
        filterParts.push(`(created >= "${yearStart}" && created <= "${yearEnd}")`);
      }

      return pb.collection("payments").getFullList<PaymentWithExpand>({
        filter: filterParts.length > 0 ? filterParts.join(" && ") : undefined,
        sort: "-created",
        expand: "project,obligation",
      });
    },
    60
  );
}

/**
 * Get a single payment by ID
 */
export async function getPaymentById(
  pb: TypedPocketBase,
  id: string
): Promise<PaymentWithExpand | null> {
  return cache.getOrFetch(
    cacheKey(pb, "payment", id),
    async () => {
      try {
        return await pb.collection("payments").getOne<PaymentWithExpand>(id, {
          expand: "project,obligation",
        });
      } catch {
        return null;
      }
    },
    60
  );
}

/**
 * Get payments by project ID
 */
export async function getPaymentsByProject(
  pb: TypedPocketBase,
  projectId: string
): Promise<PaymentWithExpand[]> {
  return getPayments(pb, { projectId });
}

/**
 * Get payments by status
 */
export async function getPaymentsByStatus(
  pb: TypedPocketBase,
  status: PaymentsStatusOptions
): Promise<PaymentWithExpand[]> {
  return getPayments(pb, { status });
}

/**
 * Get upcoming payments (status = planned, with due_date >= today)
 */
export async function getUpcomingPayments(
  pb: TypedPocketBase,
  limit?: number
): Promise<PaymentWithExpand[]> {
  return cache.getOrFetch(
    cacheKey(pb, "payments", "upcoming", String(limit ?? "all")),
    async () => {
      const allPayments = await pb.collection("payments").getFullList<PaymentWithExpand>({
        filter: `status = "planned"`,
        sort: "due_date",
        expand: "project,obligation",
      });
      const now = new Date();
      const upcoming = allPayments.filter(
        (p) => p.due_date && new Date(p.due_date) >= now
      );
      return limit ? upcoming.slice(0, limit) : upcoming;
    },
    60
  );
}

/**
 * Get overdue payments (status = planned, with due_date < today)
 */
export async function getOverduePayments(
  pb: TypedPocketBase
): Promise<PaymentWithExpand[]> {
  return cache.getOrFetch(
    cacheKey(pb, "payments", "overdue"),
    async () => {
      const allPayments = await pb.collection("payments").getFullList<PaymentWithExpand>({
        filter: `status = "planned"`,
        sort: "due_date",
        expand: "project,obligation",
      });
      const now = new Date();
      return allPayments.filter(
        (p) => p.due_date && new Date(p.due_date) < now
      );
    },
    60
  );
}

/**
 * Filter payments by year (for client-side filtering)
 */
export function filterPaymentsByYear(payments: PaymentsResponse[], year: number): PaymentsResponse[] {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  return payments.filter((p) => {
    const date = p.created;
    return date >= yearStart && date <= yearEnd;
  });
}

/**
 * Calculate total paid amount (only payments with status "paid")
 */
export function calculatePaidTotal(payments: PaymentsResponse[]): number {
  return payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
}

/**
 * Calculate total amount for all payments regardless of status
 */
export function calculatePaymentTotal(payments: PaymentsResponse[]): number {
  return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
}
