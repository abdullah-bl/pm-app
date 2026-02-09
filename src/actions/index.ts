import { projects } from "./projects";
import { budgets } from "./budgets";

/**
 * Astro Actions - Use for form handling and mutations ONLY
 * 
 * For data fetching, use @/lib/data instead:
 * - getProjects, getProjectWithDetails, etc.
 * - getBudgets, getBudgetWithDetails, etc.
 * - getPayments, getPaymentById, etc.
 * 
 * Actions are called from the client-side via forms or JavaScript:
 * - import { actions } from "astro:actions";
 * - const result = await actions.projects.create({ name: "..." });
 */
export const server = {
  projects,
  budgets,
};
