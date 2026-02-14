import type {
  TypedPocketBase,
  BudgetItemsResponse,
} from "@/pocketbase-types";
import { cache, cacheKey } from "@/lib/cache";
import type {
  ObligationWithExpand,
  PaymentWithExpand,
  ProjectWithExpand,
} from "./expand-types";

export interface DashboardData {
  projects: ProjectWithExpand[];
  budgetItems: BudgetItemsResponse[];
  obligations: ObligationWithExpand[];
  payments: PaymentWithExpand[];
  plannedPayments: PaymentWithExpand[];
  yearObligations: ObligationWithExpand[];
  yearPayments: PaymentWithExpand[];
  // Calculated values
  totalBudgetCash: number;
  totalBudgetCost: number;
  totalObligatedCash: number;
  totalObligatedCost: number;
  totalPaid: number;
  totalPlanned: number;
  totalProjectValue: number;
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
    cacheKey(pb, "dashboard", String(year)),
    async () => {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;

      const [projects, budgetItems, obligations, payments] = await Promise.all([
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
      const budgetRemainingCash = totalBudgetCash - totalObligatedCash;
      const budgetRemainingCost = totalBudgetCost - totalObligatedCost;

      return {
        projects,
        budgetItems,
        obligations,
        payments,
        plannedPayments,
        yearObligations,
        yearPayments,
        totalBudgetCash,
        totalBudgetCost,
        totalObligatedCash,
        totalObligatedCost,
        totalPaid,
        totalPlanned,
        totalProjectValue,
        budgetRemainingCash,
        budgetRemainingCost,
      };
    },
    60
  );
}
