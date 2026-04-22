import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("project_id");

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: m } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!m) {
    return NextResponse.json({ error: "Workspace não encontrado" }, { status: 404 });
  }

  let q = supabase
    .from("messages")
    .select("*")
    .eq("workspace_id", m.workspace_id)
    .order("created_at", { ascending: true })
    .limit(200);

  if (projectId) {
    q = q.eq("project_id", projectId);
  }

  const { data, error } = await q;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data ?? [] });
}

const postSchema = z.object({
  project_id: z.string().uuid().nullable().optional(),
  content: z.string().min(1),
  file_url: z.string().url().optional(),
  file_name: z.string().optional(),
  file_size_bytes: z.number().optional(),
});

export async function POST(request: Request) {
  let body: z.infer<typeof postSchema>;
  try {
    body = postSchema.parse(await request.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message : "Dados inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: m } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!m) {
    return NextResponse.json({ error: "Workspace não encontrado" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      workspace_id: m.workspace_id,
      project_id: body.project_id ?? null,
      sender_id: user.id,
      content: body.content,
      file_url: body.file_url ?? null,
      file_name: body.file_name ?? null,
      file_size_bytes: body.file_size_bytes ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data });
}
