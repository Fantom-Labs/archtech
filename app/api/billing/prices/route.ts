import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    starter: process.env.STRIPE_STARTER_PRICE_ID ?? null,
    pro: process.env.STRIPE_PRO_PRICE_ID ?? null,
    studio: process.env.STRIPE_STUDIO_PRICE_ID ?? null,
  });
}
