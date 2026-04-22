import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

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

  let q = supabase.from("calendar_events").select("*").eq("workspace_id", m.workspace_id);

  if (from) {
    q = q.gte("start_at", from);
  }
  if (to) {
    q = q.lte("end_at", to);
  }

  const { data, error } = await q.order("start_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}

const postSchema = z.object({
  title: z.string().min(1),
  start_at: z.string(),
  end_at: z.string(),
  all_day: z.boolean().optional(),
  category: z.enum(["personal", "work", "project"]).optional(),
  project_id: z.string().uuid().nullable().optional(),
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
    .from("calendar_events")
    .insert({
      workspace_id: m.workspace_id,
      project_id: body.project_id ?? null,
      title: body.title,
      start_at: body.start_at,
      end_at: body.end_at,
      all_day: body.all_day ?? false,
      category: body.category ?? "work",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}
