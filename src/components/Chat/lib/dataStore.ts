import type { DashboardData } from "@/lib/data/dashboard";

export interface ProjectEntity {
  id: string;
  name: string;
  ref: string;
  phase: string;
  phaseId: string;
  total: number;
  assignees: string[];
  assigneeIds: string[];
  active: boolean;
  startDate?: string;
  endDate?: string;
  description?: string;
  obligationIds: string[];
}

export interface BudgetEntity {
  id: string;
  name: string;
  cash: number;
  cost: number;
  year: number;
  note?: string;
  transferInCash: number;
  transferInCost: number;
  transferOutCash: number;
  transferOutCost: number;
}

export interface ObligationEntity {
  id: string;
  name: string;
  ref: string;
  projectId: string;
  projectName: string;
  budgetId: string;
  budgetName: string;
  date: string;
  cash: number;
  cost: number;
  note?: string;
  paymentIds: string[];
}

export interface PaymentEntity {
  id: string;
  name: string;
  ref: string;
  projectId: string;
  projectName: string;
  obligationId: string;
  obligationName: string;
  amount: number;
  status: string;
  dueDate?: string;
  isPlanned: boolean;
}

export interface TransferEntity {
  id: string;
  fromId?: string;
  fromName: string;
  toId?: string;
  toName: string;
  cash: number;
  cost: number;
  date?: string;
  note?: string;
}

export interface BudgetSummary {
  totalCash: number;
  totalCost: number;
  obligatedCash: number;
  obligatedCost: number;
  remainingCash: number;
  remainingCost: number;
}

export interface PaymentSummary {
  totalPaid: number;
  totalPlanned: number;
  cashInTransfers: number;
  cashOutTransfers: number;
  updatedCash: number;
}

export interface ProjectSummary {
  totalCount: number;
  activeCount: number;
  totalValue: number;
  byPhase: Record<string, number>;
}

export interface StructuredStore {
  version: number;
  lastSynced: number;
  entities: {
    projects: Map<string, ProjectEntity>;
    budgets: Map<string, BudgetEntity>;
    obligations: Map<string, ObligationEntity>;
    payments: Map<string, PaymentEntity>;
    transfers: Map<string, TransferEntity>;
  };
  indexes: {
    projectsByPhase: Map<string, string[]>;
    paymentsByStatus: Map<string, string[]>;
    obligationsByProject: Map<string, string[]>;
    paymentsByProject: Map<string, string[]>;
    paymentsByObligation: Map<string, string[]>;
  };
  summaries: {
    budget: BudgetSummary;
    payments: PaymentSummary;
    projects: ProjectSummary;
  };
}

const CURRENT_VERSION = 1;

export function createStructuredStore(data: DashboardData): StructuredStore {
  const store: StructuredStore = {
    version: CURRENT_VERSION,
    lastSynced: Date.now(),
    entities: {
      projects: new Map(),
      budgets: new Map(),
      obligations: new Map(),
      payments: new Map(),
      transfers: new Map(),
    },
    indexes: {
      projectsByPhase: new Map(),
      paymentsByStatus: new Map(),
      obligationsByProject: new Map(),
      paymentsByProject: new Map(),
      paymentsByObligation: new Map(),
    },
    summaries: {
      budget: {
        totalCash: data.totalBudgetCash,
        totalCost: data.totalBudgetCost,
        obligatedCash: data.totalObligatedCash,
        obligatedCost: data.totalObligatedCost,
        remainingCash: data.budgetRemainingCash,
        remainingCost: data.budgetRemainingCost,
      },
      payments: {
        totalPaid: data.totalPaid,
        totalPlanned: data.totalPlanned,
        cashInTransfers: data.cashInTransfers,
        cashOutTransfers: data.cashOutTransfers,
        updatedCash: data.updatedCash ?? data.totalBudgetCash - data.cashOutTransfers + data.cashInTransfers,
      },
      projects: {
        totalCount: data.projects.length,
        activeCount: data.projects.filter(p => p.active).length,
        totalValue: data.totalProjectValue,
        byPhase: {},
      },
    },
  };

  // Process budgets (budget items don't have names, they reference budgets)
  for (const item of data.budgetItems) {
    const budget: BudgetEntity = {
      id: item.id,
      name: `Budget ${item.year}`,
      cash: item.cash ?? 0,
      cost: item.cost ?? 0,
      year: item.year,
      note: item.note,
      transferInCash: 0,
      transferInCost: 0,
      transferOutCash: 0,
      transferOutCost: 0,
    };
    store.entities.budgets.set(item.id, budget);
  }

  // Process transfers and update budget transfer amounts
  for (const tr of data.yearTransfers) {
    const transfer: TransferEntity = {
      id: tr.id,
      fromId: tr.from,
      fromName: tr.expand?.from?.name ?? "(external)",
      toId: tr.to,
      toName: tr.expand?.to?.name ?? "(external)",
      cash: tr.cash,
      cost: tr.cost,
      date: tr.date,
      note: tr.note,
    };
    store.entities.transfers.set(tr.id, transfer);

    // Update budget transfer amounts
    if (tr.from) {
      const fromBudget = store.entities.budgets.get(tr.from);
      if (fromBudget) {
        fromBudget.transferOutCash += tr.cash;
        fromBudget.transferOutCost += tr.cost;
      }
    }
    if (tr.to) {
      const toBudget = store.entities.budgets.get(tr.to);
      if (toBudget) {
        toBudget.transferInCash += tr.cash;
        toBudget.transferInCost += tr.cost;
      }
    }
  }

  // Process projects
  for (const proj of data.projects) {
    const project: ProjectEntity = {
      id: proj.id,
      name: proj.name || "Unnamed Project",
      ref: proj.ref || "N/A",
      phase: proj.expand?.phase?.name ?? "Unknown",
      phaseId: proj.phase ?? "",
      total: proj.total,
      assignees: proj.expand?.assignee?.map(a => a.name || a.email) || [],
      assigneeIds: proj.assignee || [],
      active: proj.active ?? false,
      startDate: proj.start_date,
      endDate: proj.end_date,
      description: proj.description,
      obligationIds: [],
    };
    store.entities.projects.set(proj.id, project);

    // Index by phase
    const phaseProjects = store.indexes.projectsByPhase.get(project.phase) || [];
    phaseProjects.push(proj.id);
    store.indexes.projectsByPhase.set(project.phase, phaseProjects);

    // Update project summary by phase
    store.summaries.projects.byPhase[project.phase] = (store.summaries.projects.byPhase[project.phase] || 0) + 1;
  }

  // Process obligations
  for (const obl of data.yearObligations) {
    const project = store.entities.projects.get(obl.project);
    const budget = store.entities.budgets.get(obl.budget);

    const obligation: ObligationEntity = {
      id: obl.id,
      name: obl.name || "Unnamed Obligation",
      ref: obl.ref || "N/A",
      projectId: obl.project,
      projectName: project?.name ?? obl.expand?.project?.name ?? "Unknown Project",
      budgetId: obl.budget,
      budgetName: budget?.name ?? obl.expand?.budget?.name ?? "Unknown Budget",
      date: obl.date,
      cash: obl.cash,
      cost: obl.cost,
      note: obl.note,
      paymentIds: [],
    };
    store.entities.obligations.set(obl.id, obligation);

    // Index by project
    const projectObligations = store.indexes.obligationsByProject.get(obl.project) || [];
    projectObligations.push(obl.id);
    store.indexes.obligationsByProject.set(obl.project, projectObligations);

    // Update project's obligation list
    if (project) {
      project.obligationIds.push(obl.id);
    }
  }

  // Process payments
  for (const pay of data.yearPayments) {
    const project = store.entities.projects.get(pay.project);
    const obligation = store.entities.obligations.get(pay.obligation);

    const payment: PaymentEntity = {
      id: pay.id,
      name: pay.name || "Unnamed Payment",
      ref: pay.ref || "N/A",
      projectId: pay.project,
      projectName: project?.name ?? pay.expand?.project?.name ?? "Unknown Project",
      obligationId: pay.obligation,
      obligationName: obligation?.name ?? pay.expand?.obligation?.name ?? "Unknown Obligation",
      amount: pay.amount,
      status: pay.status || "unknown",
      dueDate: pay.due_date,
      isPlanned: false,
    };
    store.entities.payments.set(pay.id, payment);

    // Index by status
    const statusPayments = store.indexes.paymentsByStatus.get(payment.status) || [];
    statusPayments.push(pay.id);
    store.indexes.paymentsByStatus.set(payment.status, statusPayments);

    // Index by project
    const projectPayments = store.indexes.paymentsByProject.get(pay.project) || [];
    projectPayments.push(pay.id);
    store.indexes.paymentsByProject.set(pay.project, projectPayments);

    // Index by obligation
    const obligationPayments = store.indexes.paymentsByObligation.get(pay.obligation) || [];
    obligationPayments.push(pay.id);
    store.indexes.paymentsByObligation.set(pay.obligation, obligationPayments);

    // Update obligation's payment list
    if (obligation) {
      obligation.paymentIds.push(pay.id);
    }
  }

  // Process planned payments
  for (const pay of data.plannedPayments) {
    const project = store.entities.projects.get(pay.project);

    const payment: PaymentEntity = {
      id: pay.id,
      name: pay.name || "Unnamed Planned Payment",
      ref: pay.ref || "N/A",
      projectId: pay.project,
      projectName: project?.name ?? pay.expand?.project?.name ?? "Unknown Project",
      obligationId: pay.obligation,
      obligationName: pay.expand?.obligation?.name ?? "Unknown Obligation",
      amount: pay.amount,
      status: pay.status || "planned",
      dueDate: pay.due_date,
      isPlanned: true,
    };
    store.entities.payments.set(pay.id, payment);

    // Index by status
    const statusPayments = store.indexes.paymentsByStatus.get(payment.status) || [];
    statusPayments.push(pay.id);
    store.indexes.paymentsByStatus.set(payment.status, statusPayments);

    // Index by project
    const projectPayments = store.indexes.paymentsByProject.get(pay.project) || [];
    projectPayments.push(pay.id);
    store.indexes.paymentsByProject.set(pay.project, projectPayments);

    // Index by obligation
    if (pay.obligation) {
      const obligationPayments = store.indexes.paymentsByObligation.get(pay.obligation) || [];
      obligationPayments.push(pay.id);
      store.indexes.paymentsByObligation.set(pay.obligation, obligationPayments);

      const obligation = store.entities.obligations.get(pay.obligation);
      if (obligation) {
        obligation.paymentIds.push(pay.id);
      }
    }
  }

  return store;
}

// Query helpers
export function getProjectWithRelations(
  store: StructuredStore,
  projectId: string,
): { project: ProjectEntity; obligations: ObligationEntity[]; payments: PaymentEntity[] } | null {
  const project = store.entities.projects.get(projectId);
  if (!project) return null;

  const obligations = project.obligationIds
    .map(id => store.entities.obligations.get(id))
    .filter((o): o is ObligationEntity => o !== undefined);

  const payments = obligations.flatMap(o =>
    o.paymentIds.map(id => store.entities.payments.get(id)).filter((p): p is PaymentEntity => p !== undefined)
  );

  return { project, obligations, payments };
}

export function getBudgetWithTransfers(
  store: StructuredStore,
  budgetId: string,
): { budget: BudgetEntity; incoming: TransferEntity[]; outgoing: TransferEntity[] } | null {
  const budget = store.entities.budgets.get(budgetId);
  if (!budget) return null;

  const incoming = Array.from(store.entities.transfers.values())
    .filter(t => t.toId === budgetId);

  const outgoing = Array.from(store.entities.transfers.values())
    .filter(t => t.fromId === budgetId);

  return { budget, incoming, outgoing };
}

export function getObligationWithPayments(
  store: StructuredStore,
  obligationId: string,
): { obligation: ObligationEntity; payments: PaymentEntity[] } | null {
  const obligation = store.entities.obligations.get(obligationId);
  if (!obligation) return null;

  const payments = obligation.paymentIds
    .map(id => store.entities.payments.get(id))
    .filter((p): p is PaymentEntity => p !== undefined);

  return { obligation, payments };
}

// Serialize/Deserialize for IndexedDB storage
export function serializeStore(store: StructuredStore): string {
  return JSON.stringify({
    version: store.version,
    lastSynced: store.lastSynced,
    entities: {
      projects: Array.from(store.entities.projects.entries()),
      budgets: Array.from(store.entities.budgets.entries()),
      obligations: Array.from(store.entities.obligations.entries()),
      payments: Array.from(store.entities.payments.entries()),
      transfers: Array.from(store.entities.transfers.entries()),
    },
    indexes: {
      projectsByPhase: Array.from(store.indexes.projectsByPhase.entries()),
      paymentsByStatus: Array.from(store.indexes.paymentsByStatus.entries()),
      obligationsByProject: Array.from(store.indexes.obligationsByProject.entries()),
      paymentsByProject: Array.from(store.indexes.paymentsByProject.entries()),
      paymentsByObligation: Array.from(store.indexes.paymentsByObligation.entries()),
    },
    summaries: store.summaries,
  });
}

export function deserializeStore(data: string): StructuredStore {
  const parsed = JSON.parse(data);

  return {
    version: parsed.version,
    lastSynced: parsed.lastSynced,
    entities: {
      projects: new Map(parsed.entities.projects),
      budgets: new Map(parsed.entities.budgets),
      obligations: new Map(parsed.entities.obligations),
      payments: new Map(parsed.entities.payments),
      transfers: new Map(parsed.entities.transfers),
    },
    indexes: {
      projectsByPhase: new Map(parsed.indexes.projectsByPhase),
      paymentsByStatus: new Map(parsed.indexes.paymentsByStatus),
      obligationsByProject: new Map(parsed.indexes.obligationsByProject),
      paymentsByProject: new Map(parsed.indexes.paymentsByProject),
      paymentsByObligation: new Map(parsed.indexes.paymentsByObligation),
    },
    summaries: parsed.summaries,
  };
}
