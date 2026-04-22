import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

const schema = z.object({
  priceId: z.string().min(1),
});

export async function POST(request: Request) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "priceId obrigatório" }, { status: 400 });
  }

  const allowed = [
    process.env.STRIPE_STARTER_PRICE_ID,
    process.env.STRIPE_PRO_PRICE_ID,
    process.env.STRIPE_STUDIO_PRICE_ID,
  ].filter(Boolean);
  if (!allowed.includes(body.priceId)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: m } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(stripe_customer_id)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!m || m.role !== "owner") {
    return NextResponse.json({ error: "Apenas o proprietário pode assinar" }, { status: 403 });
  }

  const wsRaw = m.workspaces as unknown;
  const ws = Array.isArray(wsRaw)
    ? (wsRaw[0] as { stripe_customer_id?: string | null } | undefined)
    : (wsRaw as { stripe_customer_id?: string | null } | null);
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let customerId = ws?.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { workspace_id: m.workspace_id },
    });
    customerId = customer.id;
    await supabase
      .from("workspaces")
      .update({ stripe_customer_id: customerId })
      .eq("id", m.workspace_id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: body.priceId, quantity: 1 }],
    success_url: `${appUrl}/settings/billing?checkout=success`,
    cancel_url: `${appUrl}/settings/billing?checkout=cancel`,
    metadata: { workspace_id: m.workspace_id },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Falha ao criar sessão" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
