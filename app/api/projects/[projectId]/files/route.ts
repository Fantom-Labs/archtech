import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function gate(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, projectId: string) {
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
  drive_file_id: z.string().min(1),
  name: z.string().min(1),
  mime_type: z.string().optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const supabase = await createServerSupabaseClient();
  const g = await gate(supabase, projectId);
  if ("err" in g && g.err) return g.err;

  const { data, error } = await supabase
    .from("drive_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ files: data ?? [] });
}

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
  const g = await gate(supabase, projectId);
  if ("err" in g && g.err) return g.err;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("drive_files")
    .insert({
      project_id: projectId,
      drive_file_id: body.drive_file_id,
      name: body.name,
      mime_type: body.mime_type ?? null,
      added_by: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ file: data });
}

const patchSchema = z.object({
  id: z.string().uuid(),
  visible_in_portal: z.boolean(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const g = await gate(supabase, projectId);
  if ("err" in g && g.err) return g.err;

  const { data, error } = await supabase
    .from("drive_files")
    .update({ visible_in_portal: body.visible_in_portal })
    .eq("id", body.id)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ file: data });
}
