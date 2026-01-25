import type { TypedPocketBase, Bill, Obligation, Payment } from "@/types";

export interface BillWithDetails {
  bill: Bill;
  obligations: Obligation[];
  payments: Payment[];
}

/**
 * Get all bills
 */
export async function getBills(pb: TypedPocketBase): Promise<Bill[]> {
  return pb.collection("bills").getFullList<Bill>({
    sort: "due_date",
    expand: "budget",
  });
}

/**
 * Get a single bill by ID
 */
export async function getBillById(
  pb: TypedPocketBase,
  id: string
): Promise<Bill | null> {
  try {
    return await pb.collection("bills").getOne<Bill>(id, {
      expand: "budget",
    });
  } catch {
    return null;
  }
}

/**
 * Get a bill with all its related details (obligations, payments)
 */
export async function getBillWithDetails(
  pb: TypedPocketBase,
  id: string
): Promise<BillWithDetails | null> {
  try {
    const [bill, obligations, payments] = await Promise.all([
      pb.collection("bills").getOne<Bill>(id, {
        expand: "budget",
      }),
      pb.collection("obligations").getFullList<Obligation>({
        filter: `bill = "${id}"`,
        sort: "-date",
        expand: "budget,bill,project",
      }),
      pb.collection("payments").getFullList<Payment>({
        filter: `bill = "${id}"`,
        sort: "-created",
        expand: "budget,bill,project",
      }),
    ]);

    return { bill, obligations, payments };
  } catch {
    return null;
  }
}

/**
 * Get upcoming bills (due date >= today)
 */
export async function getUpcomingBills(
  pb: TypedPocketBase,
  limit?: number
): Promise<Bill[]> {
  const bills = await getBills(pb);
  const now = new Date();
  const upcoming = bills.filter((b) => b.due_date && new Date(b.due_date) >= now);
  return limit ? upcoming.slice(0, limit) : upcoming;
}

/**
 * Get overdue bills (due date < today)
 */
export async function getOverdueBills(pb: TypedPocketBase): Promise<Bill[]> {
  const bills = await getBills(pb);
  const now = new Date();
  return bills.filter((b) => b.due_date && new Date(b.due_date) < now);
}
