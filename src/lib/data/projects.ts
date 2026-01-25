import type { TypedPocketBase, Project, Phase, Obligation, Payment, ProjectLog } from "@/types";

export interface ProjectFilters {
  phase?: string;
  active?: boolean | null;
  year?: number;
}

export interface ProjectWithDetails {
  project: Project;
  allPhases: Phase[];
  obligations: Obligation[];
  payments: Payment[];
  logs: ProjectLog[];
}

/**
 * Get all projects with optional filters
 */
export async function getProjects(
  pb: TypedPocketBase,
  filters?: ProjectFilters
): Promise<{ projects: Project[]; phases: Phase[] }> {
  const [projects, phases] = await Promise.all([
    pb.collection("projects").getFullList<Project>({
      sort: "-ref",
      expand: "phase,assignee",
    }),
    pb.collection("phases").getFullList<Phase>({
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
}

/**
 * Get a single project by ID
 */
export async function getProjectById(
  pb: TypedPocketBase,
  id: string
): Promise<Project | null> {
  try {
    return await pb.collection("projects").getOne<Project>(id, {
      expand: "phase,assignee",
    });
  } catch {
    return null;
  }
}

/**
 * Get a project with all its related details (phases, obligations, payments, logs)
 */
export async function getProjectWithDetails(
  pb: TypedPocketBase,
  id: string
): Promise<ProjectWithDetails | null> {
  try {
    const [project, allPhases, obligations, payments, logs] = await Promise.all([
      pb.collection("projects").getOne<Project>(id, {
        expand: "phase,assignee",
      }),
      pb.collection("phases").getFullList<Phase>({
        sort: "order",
      }),
      pb.collection("obligations").getFullList<Obligation>({
        filter: `project = "${id}"`,
        sort: "-date",
        expand: "budget,bill,project",
      }),
      pb.collection("payments").getFullList<Payment>({
        filter: `project = "${id}"`,
        sort: "-created",
        expand: "budget,bill,project",
      }),
      pb.collection("project_logs").getFullList<ProjectLog>({
        filter: `project = "${id}"`,
        sort: "-created",
        expand: "phase,previous_phase,by",
      }),
    ]);

    return { project, allPhases, obligations, payments, logs };
  } catch {
    return null;
  }
}

/**
 * Get active projects (for dashboard)
 */
export async function getActiveProjects(
  pb: TypedPocketBase,
  limit?: number
): Promise<Project[]> {
  const projects = await pb.collection("projects").getFullList<Project>({
    sort: "-created",
    filter: "active=true",
    expand: "phase",
  });

  return limit ? projects.slice(0, limit) : projects;
}

/**
 * Get unique years from project dates
 */
export function getProjectYears(projects: Project[]): number[] {
  const years = new Set<number>();
  projects.forEach((p) => {
    if (p.start_date) years.add(new Date(p.start_date).getFullYear());
    if (p.end_date) years.add(new Date(p.end_date).getFullYear());
  });
  return [...years].sort((a, b) => b - a);
}
