import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import type { WorkspaceRow } from "@/types/app.types";

function memberRoleLabel(role: string): string {
  switch (role) {
    case "owner":
      return "Lead Architect";
    case "admin":
      return "Project Lead";
    case "member":
    default:
      return "Architect";
  }
}

export async function getUserWorkspace(): Promise<{
  userId: string;
  email: string | undefined;
  workspace: WorkspaceRow;
  role: string;
  displayName: string;
  userRoleLabel: string;
  avatarUrl: string | null;
} | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  let supabase;
  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const rawName = user.user_metadata?.full_name;
  const displayName =
    typeof rawName === "string" && rawName.trim()
      ? rawName.trim()
      : (user.email?.split("@")[0] ?? "Usuário");
  const rawAvatar = user.user_metadata?.avatar_url;
  const avatarUrl = typeof rawAvatar === "string" && rawAvatar ? rawAvatar : null;

  // Usa service role para evitar bloqueios de RLS no bootstrap inicial do workspace.
  const admin = createServiceSupabaseClient();
  const { data: row, error } = await admin
    .from("workspace_members")
    .select("role, workspaces(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error || !row || !row.workspaces) {
    return null;
  }

  const ws = row.workspaces as unknown as WorkspaceRow;
  return {
    userId: user.id,
    email: user.email ?? undefined,
    workspace: ws,
    role: row.role,
    displayName,
    userRoleLabel: memberRoleLabel(row.role as string),
    avatarUrl,
  };
}
