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

const postSchema = z.object({
  column_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  assignee_id: z.string().uuid().nullable().optional(),
  due_date: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  let body: z.infer<typeof postSchema>;
  try {
    body = postSchema.parse(await request.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message : "Dados inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const g = await gateProject(supabase, projectId);
  if (g.err) return g.err;

  const { count } = await supabase
    .from("kanban_cards")
    .select("id", { count: "exact", head: true })
    .eq("column_id", body.column_id);

  const nextOrder = count ?? 0;

  const { data, error } = await supabase
    .from("kanban_cards")
    .insert({
      project_id: projectId,
      column_id: body.column_id,
      title: body.title,
      description: body.description ?? null,
      assignee_id: body.assignee_id ?? null,
      due_date: body.due_date ?? null,
      tags: body.tags ?? [],
      priority: body.priority ?? "normal",
      order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ card: data });
}

const moveSchema = z.object({
  card_id: z.string().uuid(),
  column_id: z.string().uuid(),
  order: z.number().int().min(0),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  let body: z.infer<typeof moveSchema>;
  try {
    body = moveSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const g = await gateProject(supabase, projectId);
  if (g.err) return g.err;

  const { data, error } = await supabase
    .from("kanban_cards")
    .update({ column_id: body.column_id, order: body.order })
    .eq("id", body.card_id)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ card: data });
}
