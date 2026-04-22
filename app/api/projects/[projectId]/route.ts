import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(["active", "paused", "completed", "archived"]).optional(),
  description: z.string().nullable().optional(),
  briefing_json: z.unknown().nullable().optional(),
  client_name: z.string().nullable().optional(),
  client_email: z.string().email().nullable().optional().or(z.literal("")),
  area_m2: z.number().nullable().optional(),
  location: z.string().nullable().optional(),
  style: z.string().nullable().optional(),
  budget_estimated: z.number().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  cover_image_url: z.string().url().nullable().optional().or(z.literal("")),
});

async function assertProjectAccess(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, projectId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) };

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, workspace_id")
    .eq("id", projectId)
    .maybeSingle();

  if (error || !project) {
    return { error: NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 }) };
  }

  const { data: mem } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mem) {
    return { error: NextResponse.json({ error: "Sem permissão" }, { status: 403 }) };
  }

  return { user, project };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const supabase = await createServerSupabaseClient();
  const gate = await assertProjectAccess(supabase, projectId);
  if ("error" in gate && gate.error) return gate.error;

  const { data, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      project_phases (*),
      kanban_columns (*, kanban_cards (*)),
      drive_files (*),
      project_links (*)
    `,
    )
    .eq("id", projectId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ project: data });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message : "Dados inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const gate = await assertProjectAccess(supabase, projectId);
  if ("error" in gate && gate.error) return gate.error;

  const { data, error } = await supabase
    .from("projects")
    .update(body)
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const supabase = await createServerSupabaseClient();
  const gate = await assertProjectAccess(supabase, projectId);
  if ("error" in gate && gate.error) return gate.error;

  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
