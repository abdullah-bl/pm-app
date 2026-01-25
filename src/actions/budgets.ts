import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";

/**
 * Budget Actions - Use for mutations (create, update, delete)
 * For data fetching, use @/lib/data instead
 */
export const budgets = {
  // Example: Create a budget item
  // createItem: defineAction({
  //   input: z.object({
  //     budget: z.string(),
  //     year: z.number(),
  //     cash: z.number(),
  //     cost: z.number(),
  //     note: z.string().optional(),
  //   }),
  //   handler: async (input, { locals }) => {
  //     const { pb } = locals;
  //     return await pb.collection("budget_items").create(input);
  //   },
  // }),

  // Example: Create a transfer
  // createTransfer: defineAction({
  //   input: z.object({
  //     from: z.string(),
  //     to: z.string(),
  //     cash: z.number(),
  //     cost: z.number().optional(),
  //     note: z.string().optional(),
  //   }),
  //   handler: async (input, { locals }) => {
  //     const { pb } = locals;
  //     return await pb.collection("transfers").create(input);
  //   },
  // }),
};
