import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: m } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!m) {
    return NextResponse.json({ error: "Workspace não encontrado" }, { status: 404 });
  }

  const { data: ws, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", m.workspace_id)
    .single();

  if (error || !ws) {
    return NextResponse.json({ error: error?.message ?? "Erro" }, { status: 500 });
  }

  return NextResponse.json({ workspace: ws, role: m.role });
}

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  logo_url: z.string().url().nullable().optional(),
  portal_primary_color: z.string().optional(),
  white_label: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
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
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!m || !["owner", "admin"].includes(m.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("workspaces")
    .update(body)
    .eq("id", m.workspace_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ workspace: data });
}
