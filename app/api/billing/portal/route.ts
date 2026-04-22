import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: m } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(stripe_customer_id)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!m || !["owner", "admin"].includes(m.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const wsRaw = m.workspaces as unknown;
  const ws = Array.isArray(wsRaw)
    ? (wsRaw[0] as { stripe_customer_id?: string | null } | undefined)
    : (wsRaw as { stripe_customer_id?: string | null } | null);
  if (!ws?.stripe_customer_id) {
    return NextResponse.json({ error: "Nenhuma assinatura encontrada" }, { status: 400 });
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: ws.stripe_customer_id,
    return_url: `${appUrl}/settings/billing`,
  });

  return NextResponse.json({ url: session.url });
}
