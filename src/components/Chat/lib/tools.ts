import type { DataChunk } from "./types";
import type { ToolSchema } from "./toolParser";
import { embedSingle } from "./ai";
import { searchSimilar } from "./vector";
import type { StructuredStore } from "./dataStore";

export interface ToolContext {
  chunks: DataChunk[];
  embeddings: number[][];
  store: StructuredStore;
}

// Tool result types for structured responses
export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  summary?: string;
}

// -- JSON Schema Tool Definitions --

export const TOOL_SCHEMAS: ToolSchema[] = [
  {
    name: "search_data",
    description:
      "Search through all project management data using a natural language query. Returns relevant text snippets from budgets, projects, payments, obligations, and transfers. Use for finding specific items or when other tools don't provide the needed information.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query describing what to look for. Be specific about what you need.",
        },
        category: {
          type: "string",
          description: "Optional: filter by category - 'budget', 'project', 'obligation', 'payment', 'transfer', or 'summary'",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_budget_summary",
    description:
      "Get budget totals including: totalCash, totalCost, obligatedCash, obligatedCost, remainingCash, remainingCost. Also returns payment totals: totalPaid, totalPlanned. This is the primary tool for budget-related questions like 'how much remaining cash' or 'total obligated amount'.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "list_projects",
    description:
      "List projects with their name, phase, total value, assignees, and dates. Returns count, totalValue, and byPhase breakdown. Use for questions like 'what are my active projects' or 'how many projects in phase X'.",
    parameters: {
      type: "object",
      properties: {
        phase: {
          type: "string",
          description: "Optional: filter by phase name to get projects in a specific phase",
        },
        active_only: {
          type: "boolean",
          description: "Optional: if true, only return active projects (default: true)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_project_details",
    description:
      "Get full details for a specific project including: project info (name, phase, total, dates), obligations list (name, cash, cost), payments list (name, amount, status), and payment totals (paid, planned). Use when the user asks about a specific project by name.",
    parameters: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "The project ID to look up",
        },
        project_name: {
          type: "string",
          description: "The project name to look up (alternative to ID)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_payments",
    description:
      "Get payment records with name, amount, status, due date, and project. Returns count and totalAmount. Can filter by status ('paid', 'planned') or project. Use for questions like 'show me planned payments' or 'total paid amount'.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description: "Optional: filter by status - 'paid', 'planned', 'pending', etc.",
        },
        project_id: {
          type: "string",
          description: "Optional: filter by project ID",
        },
      },
      required: [],
    },
  },
  {
    name: "get_obligations",
    description:
      "Get obligation records with name, project, budget, cash, cost, and date. Returns count and totals (cash, cost). Use when the user asks about specific obligations. NOTE: For 'total obligated amount', use get_budget_summary instead which has pre-computed totals.",
    parameters: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "Optional: filter by project ID",
        },
      },
      required: [],
    },
  },
  {
    name: "get_transfers",
    description:
      "Get transfer records with from/to budget names, cash, cost, and date. Returns count and totals (cashIn, cashOut, netCash). Use for questions about money movements between budgets.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_budget_details",
    description:
      "Get detailed info for a specific budget including: budget details (name, cash, cost, year), incoming transfers, outgoing transfers, and adjusted totals. Use when user asks about a specific budget by name.",
    parameters: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID to look up",
        },
        budget_name: {
          type: "string",
          description: "The budget name to look up (alternative to ID)",
        },
      },
      required: [],
    },
  },
];

// -- Tool Implementations with Structured Data --

async function toolSearchData(
  ctx: ToolContext,
  args: { query: string; category?: string },
): Promise<ToolResult> {
  try {
    const qEmb = await embedSingle(args.query);
    let chunks = ctx.chunks;

    // Filter by category if specified
    if (args.category) {
      chunks = chunks.filter(c => c.category === args.category);
    }

    const embeddings = args.category
      ? chunks.map(c => ctx.embeddings[ctx.chunks.indexOf(c)])
      : ctx.embeddings;

    const results = searchSimilar(qEmb, chunks, embeddings, 5, 0.2);

    if (results.length === 0) {
      return {
        success: true,
        data: [],
        summary: "No relevant data found for this query.",
      };
    }

    return {
      success: true,
      data: results.map(r => ({
        text: r.chunk.text,
        category: r.chunk.category,
        score: r.score,
      })),
      summary: `Found ${results.length} relevant items`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Search failed",
    };
  }
}

function toolGetBudgetSummary(ctx: ToolContext): ToolResult {
  const summary = ctx.store.summaries.budget;
  const paymentSummary = ctx.store.summaries.payments;

  return {
    success: true,
    data: {
      budget: summary,
      payments: paymentSummary,
    },
    summary: `Budget: ${formatCurrency(summary.totalCash)} total cash, ${formatCurrency(summary.remainingCash)} remaining. Payments: ${formatCurrency(paymentSummary.totalPaid)} paid, ${formatCurrency(paymentSummary.totalPlanned)} planned.`,
  };
}

function toolListProjects(ctx: ToolContext, args: { phase?: string; active_only?: boolean }): ToolResult {
  const activeOnly = args.active_only !== false; // default true
  let projects = Array.from(ctx.store.entities.projects.values());

  if (activeOnly) {
    projects = projects.filter(p => p.active);
  }

  if (args.phase) {
    projects = projects.filter(p =>
      p.phase.toLowerCase().includes(args.phase!.toLowerCase())
    );
  }

  const summary = ctx.store.summaries.projects;

  return {
    success: true,
    data: {
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        ref: p.ref,
        phase: p.phase,
        total: p.total,
        assignees: p.assignees,
        active: p.active,
        description: p.description,
      })),
      count: projects.length,
      totalValue: projects.reduce((sum, p) => sum + p.total, 0),
      byPhase: summary.byPhase,
    },
    summary: `${projects.length} projects (${summary.activeCount} active), total value ${formatCurrency(projects.reduce((sum, p) => sum + p.total, 0))}`,
  };
}

function toolGetProjectDetails(ctx: ToolContext, args: { project_id?: string; project_name?: string }): ToolResult {
  let project = args.project_id
    ? ctx.store.entities.projects.get(args.project_id)
    : undefined;

  if (!project && args.project_name) {
    const nameLower = args.project_name.toLowerCase();
    project = Array.from(ctx.store.entities.projects.values()).find(p =>
      p.name.toLowerCase().includes(nameLower)
    );
  }

  if (!project) {
    return {
      success: false,
      error: args.project_id
        ? `Project with ID ${args.project_id} not found`
        : args.project_name
          ? `Project "${args.project_name}" not found`
          : "Please provide a project ID or name",
    };
  }

  // Get related obligations
  const obligationIds = ctx.store.indexes.obligationsByProject.get(project.id) || [];
  const obligations = obligationIds
    .map(id => ctx.store.entities.obligations.get(id))
    .filter(o => o !== undefined);

  // Get related payments
  const paymentIds = ctx.store.indexes.paymentsByProject.get(project.id) || [];
  const payments = paymentIds
    .map(id => ctx.store.entities.payments.get(id))
    .filter(p => p !== undefined);

  const totalPaid = payments
    .filter(p => p.status === "paid" || !p.isPlanned)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPlanned = payments
    .filter(p => p.isPlanned)
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    success: true,
    data: {
      project: {
        id: project.id,
        name: project.name,
        ref: project.ref,
        phase: project.phase,
        total: project.total,
        assignees: project.assignees,
        active: project.active,
        startDate: project.startDate,
        endDate: project.endDate,
        description: project.description,
      },
      obligations: obligations.map(o => ({
        id: o.id,
        name: o.name,
        ref: o.ref,
        cash: o.cash,
        cost: o.cost,
        date: o.date,
        budgetName: o.budgetName,
      })),
      payments: payments.map(p => ({
        id: p.id,
        name: p.name,
        amount: p.amount,
        status: p.status,
        dueDate: p.dueDate,
        isPlanned: p.isPlanned,
      })),
      totals: {
        paid: totalPaid,
        planned: totalPlanned,
      },
    },
    summary: `Project "${project.name}" (${project.phase}): ${formatCurrency(project.total)} total value, ${obligations.length} obligations, ${payments.length} payments (${formatCurrency(totalPaid)} paid, ${formatCurrency(totalPlanned)} planned)`,
  };
}

function toolGetPayments(ctx: ToolContext, args: { status?: string; project_id?: string }): ToolResult {
  let payments = Array.from(ctx.store.entities.payments.values());

  if (args.status) {
    const statusLower = args.status.toLowerCase();
    if (statusLower === "planned") {
      payments = payments.filter(p => p.isPlanned);
    } else if (statusLower === "paid") {
      payments = payments.filter(p => !p.isPlanned);
    } else {
      payments = payments.filter(p =>
        p.status.toLowerCase().includes(statusLower)
      );
    }
  }

  if (args.project_id) {
    const projectPayments = ctx.store.indexes.paymentsByProject.get(args.project_id) || [];
    const projectPaymentSet = new Set(projectPayments);
    payments = payments.filter(p => projectPaymentSet.has(p.id));
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    success: true,
    data: {
      payments: payments.map(p => ({
        id: p.id,
        name: p.name,
        ref: p.ref,
        projectName: p.projectName,
        obligationName: p.obligationName,
        amount: p.amount,
        status: p.status,
        dueDate: p.dueDate,
        isPlanned: p.isPlanned,
      })),
      count: payments.length,
      totalAmount,
    },
    summary: `${payments.length} payments totaling ${formatCurrency(totalAmount)}`,
  };
}

function toolGetObligations(ctx: ToolContext, args: { project_id?: string }): ToolResult {
  let obligations = Array.from(ctx.store.entities.obligations.values());

  if (args.project_id) {
    const projectObligations = ctx.store.indexes.obligationsByProject.get(args.project_id) || [];
    const projectObligationSet = new Set(projectObligations);
    obligations = obligations.filter(o => projectObligationSet.has(o.id));
  }

  const totalCash = obligations.reduce((sum, o) => sum + o.cash, 0);
  const totalCost = obligations.reduce((sum, o) => sum + o.cost, 0);

  return {
    success: true,
    data: {
      obligations: obligations.map(o => ({
        id: o.id,
        name: o.name,
        ref: o.ref,
        projectName: o.projectName,
        budgetName: o.budgetName,
        cash: o.cash,
        cost: o.cost,
        date: o.date,
        note: o.note,
        paymentCount: o.paymentIds.length,
      })),
      count: obligations.length,
      totals: {
        cash: totalCash,
        cost: totalCost,
      },
    },
    summary: `${obligations.length} obligations: ${formatCurrency(totalCash)} cash, ${formatCurrency(totalCost)} cost`,
  };
}

function toolGetTransfers(ctx: ToolContext): ToolResult {
  const transfers = Array.from(ctx.store.entities.transfers.values());

  const totalCashIn = transfers.reduce((sum, t) => sum + (t.toId ? t.cash : 0), 0);
  const totalCashOut = transfers.reduce((sum, t) => sum + (t.fromId ? t.cash : 0), 0);

  return {
    success: true,
    data: {
      transfers: transfers.map(t => ({
        id: t.id,
        from: t.fromName,
        to: t.toName,
        cash: t.cash,
        cost: t.cost,
        date: t.date,
        note: t.note,
      })),
      count: transfers.length,
      totals: {
        cashIn: totalCashIn,
        cashOut: totalCashOut,
        netCash: totalCashIn - totalCashOut,
      },
    },
    summary: `${transfers.length} transfers: ${formatCurrency(totalCashIn)} in, ${formatCurrency(totalCashOut)} out`,
  };
}

function toolGetBudgetDetails(ctx: ToolContext, args: { budget_id?: string; budget_name?: string }): ToolResult {
  let budget = args.budget_id
    ? ctx.store.entities.budgets.get(args.budget_id)
    : undefined;

  if (!budget && args.budget_name) {
    const nameLower = args.budget_name.toLowerCase();
    budget = Array.from(ctx.store.entities.budgets.values()).find(b =>
      b.name.toLowerCase().includes(nameLower)
    );
  }

  if (!budget) {
    return {
      success: false,
      error: args.budget_id
        ? `Budget with ID ${args.budget_id} not found`
        : args.budget_name
          ? `Budget "${args.budget_name}" not found`
          : "Please provide a budget ID or name",
    };
  }

  // Get related transfers
  const incoming = Array.from(ctx.store.entities.transfers.values())
    .filter(t => t.toId === budget.id)
    .map(t => ({
      id: t.id,
      from: t.fromName,
      cash: t.cash,
      cost: t.cost,
      date: t.date,
    }));

  const outgoing = Array.from(ctx.store.entities.transfers.values())
    .filter(t => t.fromId === budget.id)
    .map(t => ({
      id: t.id,
      to: t.toName,
      cash: t.cash,
      cost: t.cost,
      date: t.date,
    }));

  return {
    success: true,
    data: {
      budget: {
        id: budget.id,
        name: budget.name,
        cash: budget.cash,
        cost: budget.cost,
        year: budget.year,
        note: budget.note,
      },
      transfers: {
        incoming,
        outgoing,
      },
      adjustedTotals: {
        cash: budget.cash + budget.transferInCash - budget.transferOutCash,
        cost: budget.cost + budget.transferInCost - budget.transferOutCost,
      },
    },
    summary: `Budget "${budget.name}": ${formatCurrency(budget.cash)} cash, ${formatCurrency(budget.cost)} cost. Transfers: ${incoming.length} in, ${outgoing.length} out`,
  };
}

// Utility function for formatting currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// -- Tool Execution --

export async function executeTool(
  name: string,
  args: Record<string, any>,
  ctx: ToolContext,
): Promise<ToolResult> {
  switch (name) {
    case "search_data":
      return toolSearchData(ctx, { query: args.query, category: args.category });
    case "get_budget_summary":
      return toolGetBudgetSummary(ctx);
    case "list_projects":
      return toolListProjects(ctx, { phase: args.phase, active_only: args.active_only });
    case "get_project_details":
      return toolGetProjectDetails(ctx, { project_id: args.project_id, project_name: args.project_name });
    case "get_payments":
      return toolGetPayments(ctx, { status: args.status, project_id: args.project_id });
    case "get_obligations":
      return toolGetObligations(ctx, { project_id: args.project_id });
    case "get_transfers":
      return toolGetTransfers(ctx);
    case "get_budget_details":
      return toolGetBudgetDetails(ctx, { budget_id: args.budget_id, budget_name: args.budget_name });
    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

// Legacy string-based execute for backward compatibility
export async function executeToolLegacy(
  name: string,
  args: Record<string, any>,
  ctx: ToolContext,
): Promise<string> {
  const result = await executeTool(name, args, ctx);

  if (!result.success) {
    return `Error: ${result.error}`;
  }

  if (typeof result.data === "string") {
    return result.data;
  }

  return result.summary || JSON.stringify(result.data, null, 2);
}
