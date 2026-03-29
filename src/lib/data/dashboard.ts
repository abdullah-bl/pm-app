import type {
  TypedPocketBase,
  BudgetItemsResponse,
} from "@/pocketbase-types";
import { cache, cacheKey } from "@/lib/cache";
import type {
  ObligationWithExpand,
  PaymentWithExpand,
  ProjectWithExpand,
  TransferWithExpand,
} from "./expand-types";

export interface DashboardData {
  projects: ProjectWithExpand[];
  budgetItems: BudgetItemsResponse[];
  obligations: ObligationWithExpand[];
  payments: PaymentWithExpand[];
  transfers: TransferWithExpand[];
  plannedPayments: PaymentWithExpand[];
  yearObligations: ObligationWithExpand[];
  yearPayments: PaymentWithExpand[];
  yearTransfers: TransferWithExpand[];
  // Calculated values
  totalBudgetCash: number;
  totalBudgetCost: number;
  totalObligatedCash: number;
  totalObligatedCost: number;
  totalPaid: number;
  totalPlanned: number;
  totalProjectValue: number;
  /** Transfers where `to` is undefined — cash that physically exited the budget system */
  cashOutTransfers: number;
  /** Transfers where `from` is undefined — cash that physically entered the budget system */
  cashInTransfers: number;
  /** Updated cash: Budget − Transfers Out − Transfers In */
  updatedCash?: number;
  /** Remaining cash: Updated Cash − Obligated − Paid */
  budgetRemainingCash: number;
  budgetRemainingCost: number;
}

/**
 * Get all dashboard data for a specific year
 */
export async function getDashboardData(
  pb: TypedPocketBase,
  year: number = new Date().getFullYear()
): Promise<DashboardData> {
  return cache.getOrFetch(
    cacheKey(pb, "dashboard_v2", String(year)),
    async () => {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;

      const [projects, budgetItems, obligations, payments, transfers] = await Promise.all([
        pb.collection("projects").getFullList<ProjectWithExpand>({
          sort: "-created",
          filter: "active=true",
          expand: "phase,assignee",
        }),
        pb.collection("budget_items").getFullList<BudgetItemsResponse>({
          filter: `year=${year}`,
        }),
        pb.collection("obligations").getFullList<ObligationWithExpand>({
          sort: "-date",
          expand: "budget,project",
        }),
        pb.collection("payments").getFullList<PaymentWithExpand>({
          sort: "-created",
          expand: "project,obligation",
        }),
        pb.collection("transfers").getFullList<TransferWithExpand>({
          sort: "-created",
          expand: "from,to",
        }),
      ]);

      // Filter data for current year
      const yearObligations = obligations.filter((o) => {
        const date = o.date || o.created;
        return date >= yearStart && date <= yearEnd;
      });

      const yearPayments = payments.filter((p) => {
        const date = p.created;
        return date >= yearStart && date <= yearEnd;
      });

      const yearTransfers = transfers.filter((t) => {
        const date = t.created;
        return date >= yearStart && date <= yearEnd;
      });

      const now = new Date();
      const plannedPayments = payments.filter(
        (p) => p.status === "planned" && p.due_date && new Date(p.due_date) >= now
      );

      // Calculate totals
      const totalBudgetCash = budgetItems.reduce(
        (sum, item) => sum + (item.cash || 0),
        0
      );
      const totalBudgetCost = budgetItems.reduce(
        (sum, item) => sum + (item.cost || 0),
        0
      );
      const totalObligatedCash = yearObligations.reduce(
        (sum, o) => sum + (o.cash || 0),
        0
      );
      const totalObligatedCost = yearObligations.reduce(
        (sum, o) => sum + (o.cost || 0),
        0
      );
      // Only count payments with status "paid" as spent
      const totalPaid = yearPayments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalPlanned = plannedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalProjectValue = projects.reduce((sum, p) => sum + (p.total || 0), 0);
      const budgetRemainingCost = totalBudgetCost - totalObligatedCost;

      // Transfers where `to` is undefined/empty = cash that physically left the budget system
      const cashOutTransfers = yearTransfers
        .filter(t => !t.to)
        .reduce((sum, t) => sum + (t.cash || 0), 0);

      // Transfers where `from` is undefined/empty = cash that physically entered the budget system
      const cashInTransfers = yearTransfers
        .filter(t => !t.from)
        .reduce((sum, t) => sum + (t.cash || 0), 0);

      // Step 1: Updated Cash = Budget − all transfers (both in and out are budget movements)
      // Step 2: Remaining Cash = Updated Cash − (Obligated − Paid)
      // Paid is already included in obligations, so subtract only unpaid portion
      const updatedCash = totalBudgetCash - cashOutTransfers - cashInTransfers;
      const budgetRemainingCash = updatedCash - totalObligatedCash + totalPaid;

      return {
        projects,
        budgetItems,
        obligations,
        payments,
        transfers,
        plannedPayments,
        yearObligations,
        yearPayments,
        yearTransfers,
        totalBudgetCash,
        totalBudgetCost,
        totalObligatedCash,
        totalObligatedCost,
        totalPaid,
        totalPlanned,
        totalProjectValue,
        cashOutTransfers,
        cashInTransfers,
        budgetRemainingCash,
        budgetRemainingCost,
      };
    },
    60
  );
}
