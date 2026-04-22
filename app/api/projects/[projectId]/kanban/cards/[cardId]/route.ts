import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function gateProject(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, projectId: string) {
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
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  due_date: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  column_id: z.string().uuid().optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string; cardId: string }> },
) {
  const { projectId, cardId } = await context.params;
  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message : "Dados inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const g = await gateProject(supabase, projectId);
  if (g.err) return g.err;

  const { data, error } = await supabase
    .from("kanban_cards")
    .update(body)
    .eq("id", cardId)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ card: data });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectId: string; cardId: string }> },
) {
  const { projectId, cardId } = await context.params;
  const supabase = await createServerSupabaseClient();
  const g = await gateProject(supabase, projectId);
  if (g.err) return g.err;

  const { error } = await supabase
    .from("kanban_cards")
    .delete()
    .eq("id", cardId)
    .eq("project_id", projectId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
