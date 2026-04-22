import { NextResponse } from "next/server";
import { verifyPortalToken } from "@/lib/jwt/portal-token";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectSlug: string }> },
) {
  const { projectSlug } = await context.params;
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const secret = process.env.PORTAL_JWT_SECRET;

  if (!token || !secret) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let payload;
  try {
    payload = await verifyPortalToken(token, secret);
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  if (payload.projectSlug !== projectSlug) {
    return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
  }

  const admin = createServiceSupabaseClient();

  const { data: link } = await admin
    .from("project_links")
    .select("active, expires_at")
    .eq("id", payload.linkId)
    .maybeSingle();

  if (!link?.active) {
    return NextResponse.json({ error: "Link revogado" }, { status: 403 });
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: "Link expirado" }, { status: 403 });
  }

  const { data: project } = await admin
    .from("projects")
    .select("*")
    .eq("id", payload.projectId)
    .eq("slug", projectSlug)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
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

  return NextResponse.json({
    project,
    phases: phases ?? [],
    files: files ?? [],
    workspace: ws,
  });
}
