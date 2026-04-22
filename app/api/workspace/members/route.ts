import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

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

  if (!m || !["owner", "admin"].includes(m.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const admin = createServiceSupabaseClient();
  const { data: members, error } = await admin
    .from("workspace_members")
    .select("id, user_id, role, created_at")
    .eq("workspace_id", m.workspace_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ members: members ?? [] });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("id");
  if (!memberId) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!me || !["owner", "admin"].includes(me.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { data: target } = await supabase
    .from("workspace_members")
    .select("user_id, role")
    .eq("id", memberId)
    .eq("workspace_id", me.workspace_id)
    .maybeSingle();

  if (!target) {
    return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
  }

  if (target.role === "owner") {
    return NextResponse.json({ error: "Não é possível remover o proprietário" }, { status: 400 });
  }

  const { error } = await supabase.from("workspace_members").delete().eq("id", memberId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
