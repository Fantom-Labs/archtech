import { google } from "googleapis";
import { NextResponse } from "next/server";
import { encryptToken } from "@/lib/drive/tokens";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateUserId = searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!code || !stateUserId) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?drive=error`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ?? `${appUrl}/api/auth/google-drive/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?drive=error`);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== stateUserId) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?drive=error`);
  }

  const { data: m } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!m || !["owner", "admin"].includes(m.role)) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?drive=forbidden`);
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const { tokens } = await oauth2.getToken(code);
  if (!tokens.access_token || !tokens.refresh_token) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?drive=error`);
  }

  let accessEnc: string;
  let refreshEnc: string;
  try {
    accessEnc = encryptToken(tokens.access_token);
    refreshEnc = encryptToken(tokens.refresh_token);
  } catch {
    return NextResponse.redirect(`${appUrl}/settings/integrations?drive=no_key`);
  }

  const expiresAt = tokens.expiry_date
    ? new Date(tokens.expiry_date).toISOString()
    : null;

  const admin = createServiceSupabaseClient();
  const { error } = await admin.from("drive_tokens").upsert(
    {
      workspace_id: m.workspace_id,
      access_token_encrypted: accessEnc,
      refresh_token_encrypted: refreshEnc,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id" },
  );

  if (error) {
    return NextResponse.redirect(`${appUrl}/settings/integrations?drive=error`);
  }

  return NextResponse.redirect(`${appUrl}/settings/integrations?drive=ok`);
}
