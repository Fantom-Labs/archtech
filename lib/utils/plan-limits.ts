import type { WorkspacePlan } from "@/types/database.types";

export const PLAN_MAX_ACTIVE_PROJECTS: Record<WorkspacePlan, number> = {
  trial: 3,
  starter: 5,
  pro: Number.POSITIVE_INFINITY,
  studio: Number.POSITIVE_INFINITY,
};

export const PLAN_MAX_MEMBERS: Record<WorkspacePlan, number> = {
  trial: 5,
  starter: 2,
  pro: 10,
  studio: Number.POSITIVE_INFINITY,
};

export function canCreateProject(plan: WorkspacePlan, activeProjectCount: number): boolean {
  const max = PLAN_MAX_ACTIVE_PROJECTS[plan];
  return activeProjectCount < max;
}

export function planLimitMessage(plan: WorkspacePlan): string {
  if (plan === "starter") {
    return "Você atingiu o limite de projetos do plano Starter. Faça upgrade para continuar.";
  }
  if (plan === "trial") {
    return "Você atingiu o limite de projetos do período de teste. Faça upgrade para continuar.";
  }
  return "Limite de projetos atingido para o seu plano.";
}
