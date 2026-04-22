import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendWorkspaceInviteEmail } from "@/lib/resend/emails";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["member", "admin"]).default("member"),
});

export async function POST(request: Request) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const workspaceId = membership.workspace_id;
  const admin = createServiceSupabaseClient();
  const { data: ws } = await admin
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .single();

  const token = nanoid(32);
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  const { error } = await admin.from("workspace_invites").insert({
    workspace_id: workspaceId,
    email: body.email.toLowerCase(),
    token,
    role: body.role,
    expires_at: expires.toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteLink = `${appUrl}/invite/${token}`;

  try {
    await sendWorkspaceInviteEmail({
      to: body.email,
      workspaceName: ws?.name ?? "ArqTech",
      inviteLink,
    });
  } catch {
    /* Resend pode falhar em dev sem API key — convite já está no banco */
  }

  return NextResponse.json({ ok: true });
}
