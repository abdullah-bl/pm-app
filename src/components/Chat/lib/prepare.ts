import type { DataChunk } from "./types";
import type { DashboardData } from "@/lib/data/dashboard";

function fmt(n: number | undefined): string {
  if (n == null) return "0";
  return n.toLocaleString("en-US");
}

function fmtDate(d: string | undefined): string {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function prepareDashboardChunks(data: DashboardData): DataChunk[] {
  const chunks: DataChunk[] = [];
  let idx = 0;
  const id = () => `chunk-${idx++}`;

  // --- Summary chunks (pre-computed totals) ---
  chunks.push({
    id: id(),
    text: `Budget summary for this year: Total budget cash is ${fmt(data.totalBudgetCash)}, total budget cost is ${fmt(data.totalBudgetCost)}. Obligated cash is ${fmt(data.totalObligatedCash)}, obligated cost is ${fmt(data.totalObligatedCost)}. Remaining cash is ${fmt(data.budgetRemainingCash)}, remaining cost is ${fmt(data.budgetRemainingCost)}.`,
    category: "summary",
  });

  chunks.push({
    id: id(),
    text: `Payment summary: Total paid this year is ${fmt(data.totalPaid)}. Total planned (upcoming) payments amount to ${fmt(data.totalPlanned)}. Cash transferred out of budget system: ${fmt(data.cashOutTransfers)}. Cash transferred into budget system: ${fmt(data.cashInTransfers)}.`,
    category: "summary",
  });

  chunks.push({
    id: id(),
    text: `Project portfolio: There are ${data.projects.length} active projects with a total value of ${fmt(data.totalProjectValue)}.`,
    category: "summary",
  });

  if (data.updatedCash != null) {
    chunks.push({
      id: id(),
      text: `Updated cash after transfers: ${fmt(data.updatedCash)} (Budget cash ${fmt(data.totalBudgetCash)} minus transfers out ${fmt(data.cashOutTransfers)} minus transfers in ${fmt(data.cashInTransfers)}).`,
      category: "summary",
    });
  }

  // --- Budget items ---
  for (const item of data.budgetItems) {
    chunks.push({
      id: id(),
      text: `Budget item (ID: ${item.id}): cash allocation ${fmt(item.cash)}, cost allocation ${fmt(item.cost)} for year ${item.year}.${item.note ? ` Note: ${item.note}` : ""}`,
      category: "budget",
      sourceId: item.id,
    });
  }

  // --- Projects ---
  for (const proj of data.projects) {
    const phase = proj.expand?.phase?.name ?? "Unknown";
    const assignees =
      proj.expand?.assignee?.map((a) => a.name || a.email).join(", ") ||
      "Unassigned";
    chunks.push({
      id: id(),
      text: `Project "${proj.name || "Unnamed"}" (ref: ${proj.ref || "N/A"}): phase is ${phase}, total value ${fmt(proj.total)}, assigned to ${assignees}. Active: ${proj.active ? "yes" : "no"}.${proj.start_date ? ` Start: ${fmtDate(proj.start_date)}.` : ""}${proj.end_date ? ` End: ${fmtDate(proj.end_date)}.` : ""}${proj.description ? ` Description: ${proj.description}` : ""}`,
      category: "project",
      sourceId: proj.id,
    });
  }

  // --- Obligations (year-filtered) ---
  for (const obl of data.yearObligations) {
    const budgetName = obl.expand?.budget?.name ?? "Unknown budget";
    const projName = obl.expand?.project?.name ?? "Unknown project";
    chunks.push({
      id: id(),
      text: `Obligation "${obl.name || "Unnamed"}" (ref: ${obl.ref || "N/A"}) for project "${projName}", budget "${budgetName}". Date: ${fmtDate(obl.date)}. Cash: ${fmt(obl.cash)}, Cost: ${fmt(obl.cost)}.${obl.note ? ` Note: ${obl.note}` : ""}`,
      category: "obligation",
      sourceId: obl.id,
    });
  }

  // --- Payments (year-filtered) ---
  for (const pay of data.yearPayments) {
    const projName = pay.expand?.project?.name ?? "Unknown project";
    const oblName = pay.expand?.obligation?.name ?? "Unknown obligation";
    chunks.push({
      id: id(),
      text: `Payment "${pay.name || "Unnamed"}" (ref: ${pay.ref || "N/A"}) for project "${projName}", obligation "${oblName}". Amount: ${fmt(pay.amount)}, status: ${pay.status || "unknown"}.${pay.due_date ? ` Due: ${fmtDate(pay.due_date)}.` : ""}`,
      category: "payment",
      sourceId: pay.id,
    });
  }

  // --- Planned payments ---
  for (const pay of data.plannedPayments) {
    const projName = pay.expand?.project?.name ?? "Unknown project";
    chunks.push({
      id: id(),
      text: `Upcoming planned payment "${pay.name || "Unnamed"}" for project "${projName}". Amount: ${fmt(pay.amount)}, due: ${fmtDate(pay.due_date)}.`,
      category: "payment",
      sourceId: pay.id,
    });
  }

  // --- Transfers (year-filtered) ---
  for (const tr of data.yearTransfers) {
    const fromName = tr.expand?.from?.name ?? "(external)";
    const toName = tr.expand?.to?.name ?? "(external)";
    chunks.push({
      id: id(),
      text: `Transfer from "${fromName}" to "${toName}": cash ${fmt(tr.cash)}, cost ${fmt(tr.cost)}.${tr.note ? ` Note: ${tr.note}` : ""}${tr.date ? ` Date: ${fmtDate(tr.date)}.` : ""}`,
      category: "transfer",
      sourceId: tr.id,
    });
  }

  return chunks;
}
