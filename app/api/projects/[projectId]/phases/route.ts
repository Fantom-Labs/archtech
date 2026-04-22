import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getProjectWorkspace(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, projectId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) };

  const { data: project } = await supabase
    .from("projects")
    .select("workspace_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) {
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

  return { project };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const supabase = await createServerSupabaseClient();
  const gate = await getProjectWorkspace(supabase, projectId);
  if ("error" in gate && gate.error) return gate.error;

  const { data, error } = await supabase
    .from("project_phases")
    .select("*")
    .eq("project_id", projectId)
    .order("order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ phases: data ?? [] });
}

const postSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  visible_in_portal: z.boolean().optional(),
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
  const gate = await getProjectWorkspace(supabase, projectId);
  if ("error" in gate && gate.error) return gate.error;

  const { data: maxRow } = await supabase
    .from("project_phases")
    .select("order")
    .eq("project_id", projectId)
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = maxRow ? maxRow.order + 1 : 0;

  const { data, error } = await supabase
    .from("project_phases")
    .insert({
      project_id: projectId,
      name: body.name,
      description: body.description ?? null,
      visible_in_portal: body.visible_in_portal ?? true,
      order: nextOrder,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ phase: data });
}

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  let body: z.infer<typeof reorderSchema>;
  try {
    body = reorderSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Lista de IDs inválida" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const gate = await getProjectWorkspace(supabase, projectId);
  if ("error" in gate && gate.error) return gate.error;

  for (let i = 0; i < body.orderedIds.length; i++) {
    const id = body.orderedIds[i];
    const { error } = await supabase
      .from("project_phases")
      .update({ order: i })
      .eq("id", id)
      .eq("project_id", projectId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
