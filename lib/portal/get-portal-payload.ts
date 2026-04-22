import { cookies } from "next/headers";
import { verifyPortalToken } from "@/lib/jwt/portal-token";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export async function getPortalPayload(
  projectSlug: string,
  tokenFromQuery?: string | null,
) {
  const secret = process.env.PORTAL_JWT_SECRET;
  if (!secret || secret.length < 32) {
    return { error: "config" as const };
  }

  const jar = await cookies();
  const token = tokenFromQuery ?? jar.get("portal_token")?.value ?? null;

  if (!token) {
    return { error: "no_token" as const };
  }

  let payload;
  try {
    payload = await verifyPortalToken(token, secret);
  } catch {
    return { error: "invalid" as const };
  }

  if (payload.projectSlug !== projectSlug) {
    return { error: "slug" as const };
  }

  const admin = createServiceSupabaseClient();

  const { data: link } = await admin
    .from("project_links")
    .select("active, expires_at")
    .eq("id", payload.linkId)
    .maybeSingle();

  if (!link?.active) {
    return { error: "revoked" as const };
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return { error: "expired" as const };
  }

  const { data: project } = await admin
    .from("projects")
    .select("*")
    .eq("id", payload.projectId)
    .eq("slug", projectSlug)
    .maybeSingle();

  if (!project) {
    return { error: "not_found" as const };
  }

  const { data: phases } = await admin
    .from("project_phases")
    .select("*")
    .eq("project_id", project.id)
    .eq("visible_in_portal", true)
    .order("order", { ascending: true });

  const { data: files } = await admin
    .from("drive_files")
    .select("id, name, mime_type, drive_file_id, synced_at")
    .eq("project_id", project.id)
    .eq("visible_in_portal", true);

  const { data: ws } = await admin
    .from("workspaces")
    .select("name, logo_url, portal_primary_color, white_label")
    .eq("id", project.workspace_id)
    .maybeSingle();

  return {
    project,
    phases: phases ?? [],
    files: files ?? [],
    workspace: ws,
  };
}
