import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/client";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 500 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  const admin = createServiceSupabaseClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const workspaceId = session.metadata?.workspace_id;
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    if (workspaceId && subId) {
      await admin
        .from("workspaces")
        .update({
          stripe_subscription_id: subId,
          plan: "pro",
        })
        .eq("id", workspaceId);
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const { data: ws } = await admin
      .from("workspaces")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (ws) {
      const active = sub.status === "active" || sub.status === "trialing";
      await admin
        .from("workspaces")
        .update({
          stripe_subscription_id: active ? sub.id : null,
          plan: active ? "pro" : "trial",
        })
        .eq("id", ws.id);
    }
  }

  return NextResponse.json({ received: true });
}
