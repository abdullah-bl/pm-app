import type {
  TypedPocketBase,
  Project,
  Bill,
  BudgetItem,
  Obligation,
  Payment,
} from "@/types";

export interface DashboardData {
  projects: Project[];
  bills: Bill[];
  budgetItems: BudgetItem[];
  obligations: Obligation[];
  payments: Payment[];
  upcomingBills: Bill[];
  yearObligations: Obligation[];
  yearPayments: Payment[];
  // Calculated values
  totalBudgetCash: number;
  totalBudgetCost: number;
  totalObligatedCash: number;
  totalObligatedCost: number;
  totalPaid: number;
  totalBills: number;
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
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const [projects, bills, budgetItems, obligations, payments] = await Promise.all([
    pb.collection("projects").getFullList<Project>({
      sort: "-created",
      filter: "active=true",
      expand: "phase",
    }),
    pb.collection("bills").getFullList<Bill>({
      sort: "due_date",
    }),
    pb.collection("budget_items").getFullList<BudgetItem>({
      filter: `year=${year}`,
    }),
    pb.collection("obligations").getFullList<Obligation>({
      sort: "-date",
    }),
    pb.collection("payments").getFullList<Payment>({
      sort: "-created",
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
  const upcomingBills = bills.filter(
    (b) => b.due_date && new Date(b.due_date) >= now
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
  const totalPaid = yearPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalBills = upcomingBills.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalProjectValue = projects.reduce((sum, p) => sum + (p.total || 0), 0);
  const budgetRemainingCash = totalBudgetCash - totalObligatedCash;
  const budgetRemainingCost = totalBudgetCost - totalObligatedCost;

  return {
    projects,
    bills,
    budgetItems,
    obligations,
    payments,
    upcomingBills,
    yearObligations,
    yearPayments,
    totalBudgetCash,
    totalBudgetCost,
    totalObligatedCash,
    totalObligatedCost,
    totalPaid,
    totalBills,
    totalProjectValue,
    budgetRemainingCash,
    budgetRemainingCost,
  };
}
