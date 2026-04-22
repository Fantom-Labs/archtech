import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

const schema = z.object({ token: z.string().min(10) });

export async function POST(request: Request) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login para aceitar o convite" }, { status: 401 });
  }

  const admin = createServiceSupabaseClient();
  const { data: invite, error: invErr } = await admin
    .from("workspace_invites")
    .select("*")
    .eq("token", body.token)
    .is("accepted_at", null)
    .single();

  if (invErr || !invite) {
    return NextResponse.json({ error: "Convite inválido ou expirado" }, { status: 404 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Convite expirado" }, { status: 400 });
  }

  if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: "Este convite foi enviado para outro e-mail" },
      { status: 403 },
    );
  }

  const { error: memErr } = await admin.from("workspace_members").insert({
    workspace_id: invite.workspace_id,
    user_id: user.id,
    role: invite.role === "admin" ? "admin" : "member",
  });

  if (memErr) {
    return NextResponse.json({ error: memErr.message }, { status: 500 });
  }

  await admin
    .from("workspace_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return NextResponse.json({ ok: true, workspaceId: invite.workspace_id });
}
