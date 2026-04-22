import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from "date-fns";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { getUserWorkspace } from "@/lib/workspace/get-user-workspace";
import type { ProjectRow } from "@/types/app.types";

export default async function DashboardPage() {
  const ctx = await getUserWorkspace();
  if (!ctx) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data: projectsData } = await supabase
    .from("projects")
    .select("*, project_phases(id, name, status, order)")
    .eq("workspace_id", ctx.workspace.id)
    .order("created_at", { ascending: false });

  const projects = (projectsData ?? []) as unknown as (ProjectRow & {
    project_phases?: { id: string; name: string; status: string; order: number }[];
  })[];

  const activeCount =
    projects?.filter((p) => p.status === "active").length ?? 0;

  const now = new Date();
  const newProjectsThisMonth =
    projects?.filter((p) => {
      if (!p.created_at) return false;
      return isWithinInterval(parseISO(p.created_at), { start: startOfMonth(now), end: endOfMonth(now) });
    }).length ?? 0;

  const projectIds = projects?.map((p) => p.id) ?? [];
  const today = format(new Date(), "yyyy-MM-dd");

  let tasksToday = 0;
  if (projectIds.length > 0) {
    const { count } = await supabase
      .from("kanban_cards")
      .select("id", { count: "exact", head: true })
      .in("project_id", projectIds)
      .eq("due_date", today);
    tasksToday = count ?? 0;
  }

  return (
    <DashboardView
      projects={projects ?? []}
      activeCount={activeCount}
      newProjectsThisMonth={newProjectsThisMonth}
      tasksToday={tasksToday}
      pendingApprovals={0}
    />
  );
}
