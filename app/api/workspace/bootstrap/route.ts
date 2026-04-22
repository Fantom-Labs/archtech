import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const body = (await request.json()) as { workspaceName?: string };
  const name = body.workspaceName?.trim();
  if (!name) {
    return NextResponse.json({ error: "Nome do escritório é obrigatório" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const admin = createServiceSupabaseClient();
  const { data: existing } = await admin
    .from("workspace_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ ok: true, alreadyMember: true });
  }

  const baseSlug = slugify(name, { lower: true, strict: true }) || "escritorio";
  const slug = `${baseSlug}-${nanoid(6)}`;
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 14);

  const { data: ws, error: wsError } = await admin
    .from("workspaces")
    .insert({
      name,
      slug,
      plan: "trial",
      trial_ends_at: trialEnds.toISOString(),
    })
    .select("id")
    .single();

  if (wsError || !ws) {
    return NextResponse.json(
      { error: wsError?.message ?? "Erro ao criar workspace" },
      { status: 500 },
    );
  }

  const { error: memError } = await admin.from("workspace_members").insert({
    workspace_id: ws.id,
    user_id: user.id,
    role: "owner",
  });

  if (memError) {
    return NextResponse.json({ error: memError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, workspaceId: ws.id });
}
