import type { TypedPocketBase, PhasesResponse } from "@/pocketbase-types";
import { cache, cacheKey } from "@/lib/cache";

/** Phases without `track` (or `track: workflow`) follow the main sequence; `outcome` is for statuses like delayed / cancelled / done. */
export function isWorkflowPhase(phase: PhasesResponse): boolean {
	return phase.track !== "outcome";
}

export type PhaseTimelineTriple = {
	prev: PhasesResponse | null;
	current: PhasesResponse | null;
	next: PhasesResponse | null;
};

/**
 * Previous / current / next for the project header strip.
 * `next` is only the next *workflow* phase (skips outcomes). If the project is on an outcome phase, `next` is null.
 */
export function getPhaseTimelineTriple(
	allPhases: PhasesResponse[],
	currentPhaseId: string | undefined,
): PhaseTimelineTriple {
	if (!currentPhaseId || allPhases.length === 0) {
		return { prev: null, current: null, next: null };
	}
	const sorted = [...allPhases].sort(
		(a, b) => (a.order ?? 0) - (b.order ?? 0),
	);
	const currentIndex = sorted.findIndex((p) => p.id === currentPhaseId);
	if (currentIndex < 0) {
		return { prev: null, current: null, next: null };
	}
	const current = sorted[currentIndex]!;

	let prev: PhasesResponse | null = null;
	for (let i = currentIndex - 1; i >= 0; i--) {
		const p = sorted[i]!;
		if (isWorkflowPhase(p)) {
			prev = p;
			break;
		}
	}

	let next: PhasesResponse | null = null;
	if (isWorkflowPhase(current)) {
		for (let i = currentIndex + 1; i < sorted.length; i++) {
			const p = sorted[i]!;
			if (isWorkflowPhase(p)) {
				next = p;
				break;
			}
		}
	}

	return { prev, current, next };
}

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
