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

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const supabase = await createServerSupabaseClient();
  const g = await gateProject(supabase, projectId);
  if (g.err) return g.err;

  const { data: columns, error: colErr } = await supabase
    .from("kanban_columns")
    .select("*")
    .eq("project_id", projectId)
    .order("order", { ascending: true });

  if (colErr) {
    return NextResponse.json({ error: colErr.message }, { status: 500 });
  }

  const { data: cards, error: cardErr } = await supabase
    .from("kanban_cards")
    .select("*")
    .eq("project_id", projectId)
    .order("order", { ascending: true });

  if (cardErr) {
    return NextResponse.json({ error: cardErr.message }, { status: 500 });
  }

  const withCards = (columns ?? []).map((col) => ({
    ...col,
    kanban_cards: (cards ?? []).filter((c) => c.column_id === col.id),
  }));

  return NextResponse.json({ columns: withCards });
}

const postSchema = z.object({ name: z.string().min(1) });

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

  const { data: maxRow } = await supabase
    .from("kanban_columns")
    .select("order")
    .eq("project_id", projectId)
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = maxRow ? maxRow.order + 1 : 0;

  const { data, error } = await supabase
    .from("kanban_columns")
    .insert({ project_id: projectId, name: body.name, order: nextOrder })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ column: data });
}

const reorderSchema = z.object({ orderedIds: z.array(z.string().uuid()) });

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  let body: z.infer<typeof reorderSchema>;
  try {
    body = reorderSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Lista inválida" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const g = await gateProject(supabase, projectId);
  if (g.err) return g.err;

  for (let i = 0; i < body.orderedIds.length; i++) {
    const { error } = await supabase
      .from("kanban_columns")
      .update({ order: i })
      .eq("id", body.orderedIds[i])
      .eq("project_id", projectId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
