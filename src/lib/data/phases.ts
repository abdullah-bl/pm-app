import type { TypedPocketBase, Phase } from "@/types";

/**
 * Get all phases sorted by order
 */
export async function getPhases(pb: TypedPocketBase): Promise<Phase[]> {
  return pb.collection("phases").getFullList<Phase>({
    sort: "order",
  });
}

/**
 * Get a single phase by ID
 */
export async function getPhaseById(
  pb: TypedPocketBase,
  id: string
): Promise<Phase | null> {
  try {
    return await pb.collection("phases").getOne<Phase>(id);
  } catch {
    return null;
  }
}
