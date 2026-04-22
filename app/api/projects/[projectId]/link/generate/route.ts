import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { signPortalToken } from "@/lib/jwt/portal-token";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const secret = process.env.PORTAL_JWT_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.json({ error: "PORTAL_JWT_SECRET não configurado" }, { status: 500 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, slug, workspace_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 });
  }

  const { data: mem } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mem) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const dbToken = nanoid(48);

  await supabase.from("project_links").update({ active: false }).eq("project_id", projectId);

  const { data: linkRow, error } = await supabase
    .from("project_links")
    .insert({
      project_id: projectId,
      token: dbToken,
      active: true,
    })
    .select("id")
    .single();

  if (error || !linkRow) {
    return NextResponse.json({ error: error?.message ?? "Erro ao salvar link" }, { status: 500 });
  }

  const jwt = await signPortalToken(
    {
      projectId: project.id,
      projectSlug: project.slug,
      workspaceId: project.workspace_id,
      linkId: linkRow.id,
    },
    secret,
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${appUrl}/p/${project.slug}?token=${encodeURIComponent(jwt)}`;

  return NextResponse.json({ url, token: jwt });
}
