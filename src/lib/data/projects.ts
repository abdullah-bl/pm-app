import type {
  TypedPocketBase,
  ProjectsResponse,
  PhasesResponse,
} from "@/pocketbase-types";
import { cache, cacheKey } from "@/lib/cache";
import type {
  ObligationWithExpand,
  PaymentWithExpand,
  ProjectLogWithExpand,
  ProjectWithExpand,
} from "./expand-types";

export interface ProjectFilters {
  phase?: string;
  active?: boolean | null;
  year?: number;
}

export interface ProjectWithDetails {
  project: ProjectWithExpand;
  allPhases: PhasesResponse[];
  obligations: ObligationWithExpand[];
  payments: PaymentWithExpand[];
  logs: ProjectLogWithExpand[];
}

/**
 * Get all projects with optional filters
 */
export async function getProjects(
  pb: TypedPocketBase,
  filters?: ProjectFilters
): Promise<{ projects: ProjectsResponse[]; phases: PhasesResponse[] }> {
  const filterKey = filters
    ? [filters.phase ?? "", filters.active ?? "", filters.year ?? ""].join(":")
    : "all";
  return cache.getOrFetch(
    cacheKey(pb, "projects", filterKey),
    async () => {
      const [projects, phases] = await Promise.all([
        pb.collection("projects").getFullList<ProjectsResponse>({
          sort: "-ref",
          expand: "phase,assignee",
        }),
        pb.collection("phases").getFullList<PhasesResponse>({
          sort: "order",
        }),
      ]);

      let filteredProjects = projects;

      if (filters?.phase) {
        filteredProjects = filteredProjects.filter((p) => p.phase === filters.phase);
      }

      if (filters?.active === true) {
        filteredProjects = filteredProjects.filter((p) => p.active);
      } else if (filters?.active === false) {
        filteredProjects = filteredProjects.filter((p) => !p.active);
      }

      if (filters?.year) {
        const year = filters.year;
        filteredProjects = filteredProjects.filter((p) => {
          const startYear = p.start_date ? new Date(p.start_date).getFullYear() : null;
          const endYear = p.end_date ? new Date(p.end_date).getFullYear() : null;
          if (startYear && endYear) {
            return startYear <= year && year <= endYear;
          } else if (startYear) {
            return startYear <= year;
          } else if (endYear) {
            return year <= endYear;
          }
          return true;
        });
      }

      return { projects: filteredProjects, phases };
    },
    60
  );
}

/**
 * Get a single project by ID
 */
export async function getProjectById(
  pb: TypedPocketBase,
  id: string
): Promise<ProjectsResponse | null> {
  return cache.getOrFetch(
    cacheKey(pb, "project", id),
    async () => {
      try {
        return await pb.collection("projects").getOne<ProjectsResponse>(id, {
          expand: "phase,assignee",
        });
      } catch {
        return null;
      }
    },
    60
  );
}

/**
 * Get a project with all its related details (phases, obligations, payments, logs)
 */
export async function getProjectWithDetails(
  pb: TypedPocketBase,
  id: string
): Promise<ProjectWithDetails | null> {
  return cache.getOrFetch(
    cacheKey(pb, "project", id, "details"),
    async () => {
      try {
        const [project, allPhases, obligations, payments, logs] = await Promise.all([
          pb.collection("projects").getOne<ProjectWithExpand>(id, {
            expand: "phase,assignee",
          }),
          pb.collection("phases").getFullList<PhasesResponse>({
            sort: "order",
          }),
          pb.collection("obligations").getFullList<ObligationWithExpand>({
            filter: `project = "${id}"`,
            sort: "-date",
            expand: "budget,project",
          }),
          pb.collection("payments").getFullList<PaymentWithExpand>({
            filter: `project = "${id}"`,
            sort: "-created",
            expand: "project,obligation",
          }),
          pb.collection("project_logs").getFullList<ProjectLogWithExpand>({
            filter: `project = "${id}"`,
            sort: "-created",
            expand: "phase,previous_phase,by",
          }),
        ]);

        return { project, allPhases, obligations, payments, logs };
      } catch {
        return null;
      }
    },
    60
  );
}

/**
 * Get active projects (for dashboard)
 */
export async function getActiveProjects(
  pb: TypedPocketBase,
  limit?: number
): Promise<ProjectsResponse[]> {
  return cache.getOrFetch(
    cacheKey(pb, "projects", "active", String(limit ?? "all")),
    async () => {
      const projects = await pb.collection("projects").getFullList<ProjectsResponse>({
        sort: "-created",
        filter: "active=true",
        expand: "phase",
      });

      return limit ? projects.slice(0, limit) : projects;
    },
    60
  );
}

/**
 * Get unique years from project dates
 */
export function getProjectYears(projects: ProjectsResponse[]): number[] {
  const years = new Set<number>();
  projects.forEach((p) => {
    if (p.start_date) years.add(new Date(p.start_date).getFullYear());
    if (p.end_date) years.add(new Date(p.end_date).getFullYear());
  });
  return [...years].sort((a, b) => b - a);
}
