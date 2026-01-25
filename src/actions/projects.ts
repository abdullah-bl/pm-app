import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";

/**
 * Project Actions - Use for mutations (create, update, delete)
 * For data fetching, use @/lib/data instead
 */
export const projects = {
  // Example: Create a new project
  // create: defineAction({
  //   input: z.object({
  //     name: z.string(),
  //     ref: z.string(),
  //     // ... other fields
  //   }),
  //   handler: async (input, { locals }) => {
  //     const { pb } = locals;
  //     return await pb.collection("projects").create(input);
  //   },
  // }),

  // Example: Update a project
  // update: defineAction({
  //   input: z.object({
  //     id: z.string(),
  //     name: z.string().optional(),
  //     // ... other fields
  //   }),
  //   handler: async ({ id, ...data }, { locals }) => {
  //     const { pb } = locals;
  //     return await pb.collection("projects").update(id, data);
  //   },
  // }),

  // Example: Delete a project
  // delete: defineAction({
  //   input: z.object({
  //     id: z.string(),
  //   }),
  //   handler: async ({ id }, { locals }) => {
  //     const { pb } = locals;
  //     await pb.collection("projects").delete(id);
  //     return { success: true };
  //   },
  // }),
};
