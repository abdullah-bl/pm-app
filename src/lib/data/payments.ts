import type { TypedPocketBase, Payment } from "@/types";

export interface PaymentFilters {
  budgetId?: string;
  projectId?: string;
  billId?: string;
  year?: number;
}

/**
 * Get all payments with optional filters
 */
export async function getPayments(
  pb: TypedPocketBase,
  filters?: PaymentFilters
): Promise<Payment[]> {
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
    filterParts.push(`(created >= "${yearStart}" && created <= "${yearEnd}")`);
  }

  return pb.collection("payments").getFullList<Payment>({
    filter: filterParts.length > 0 ? filterParts.join(" && ") : undefined,
    sort: "-created",
    expand: "budget,bill,project",
  });
}

/**
 * Get payments by budget ID for a specific year
 */
export async function getPaymentsByBudget(
  pb: TypedPocketBase,
  budgetId: string,
  year?: number
): Promise<Payment[]> {
  return getPayments(pb, { budgetId, year });
}

/**
 * Get payments by project ID
 */
export async function getPaymentsByProject(
  pb: TypedPocketBase,
  projectId: string
): Promise<Payment[]> {
  return getPayments(pb, { projectId });
}

/**
 * Get payments by bill ID
 */
export async function getPaymentsByBill(
  pb: TypedPocketBase,
  billId: string
): Promise<Payment[]> {
  return getPayments(pb, { billId });
}

/**
 * Filter payments by year (for client-side filtering)
 */
export function filterPaymentsByYear(payments: Payment[], year: number): Payment[] {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  return payments.filter((p) => {
    const date = p.created;
    return date >= yearStart && date <= yearEnd;
  });
}

/**
 * Calculate total paid amount
 */
export function calculatePaymentTotal(payments: Payment[]): number {
  return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
}
