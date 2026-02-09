import type { TypedPocketBase, PhasesResponse } from "@/pocketbase-types";
import { cache, cacheKey } from "@/lib/cache";

/**
 * Get all phases sorted by order
 */
export async function getPhases(pb: TypedPocketBase): Promise<PhasesResponse[]> {
  return cache.getOrFetch(
    cacheKey(pb, "phases", "list"),
    () =>
      pb.collection("phases").getFullList<PhasesResponse>({
        sort: "order",
      }),
    60
  );
}

/**
 * Get a single phase by ID
 */
export async function getPhaseById(
  pb: TypedPocketBase,
  id: string
): Promise<PhasesResponse | null> {
  return cache.getOrFetch(
    cacheKey(pb, "phase", id),
    async () => {
      try {
        return await pb.collection("phases").getOne<PhasesResponse>(id);
      } catch {
        return null;
      }
    },
    60
  );
}
