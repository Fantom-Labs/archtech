import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function gate(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  projectId: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { err: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) };

  const { data: project } = await supabase
    .from("projects")
    .select("workspace_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) {
    return { err: NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 }) };
  }

  const { data: mem } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", project.workspace_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mem) {
    return { err: NextResponse.json({ error: "Sem permissão" }, { status: 403 }) };
  }

  return {};
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["pending", "active", "completed"]).optional(),
  description: z.string().nullable().optional(),
  visible_in_portal: z.boolean().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string; phaseId: string }> },
) {
  const { projectId, phaseId } = await context.params;
  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message : "Dados inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const g = await gate(supabase, projectId);
  if (g.err) return g.err;

  const { data, error } = await supabase
    .from("project_phases")
    .update(body)
    .eq("id", phaseId)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ phase: data });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectId: string; phaseId: string }> },
) {
  const { projectId, phaseId } = await context.params;
  const supabase = await createServerSupabaseClient();
  const g = await gate(supabase, projectId);
  if (g.err) return g.err;

  const { error } = await supabase
    .from("project_phases")
    .delete()
    .eq("id", phaseId)
    .eq("project_id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
