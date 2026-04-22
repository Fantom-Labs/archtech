import { google } from "googleapis";
import { NextResponse } from "next/server";
import { createDriveClient } from "@/lib/drive/client";
import { decryptToken, encryptToken } from "@/lib/drive/tokens";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const pageToken = searchParams.get("pageToken") ?? undefined;

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

  if (!m || !["owner", "admin", "member"].includes(m.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const admin = createServiceSupabaseClient();
  const { data: row } = await admin
    .from("drive_tokens")
    .select("*")
    .eq("workspace_id", m.workspace_id)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "Google Drive não conectado" }, { status: 400 });
  }

  let access: string;
  try {
    access = decryptToken(row.access_token_encrypted);
  } catch {
    return NextResponse.json({ error: "Falha ao ler token" }, { status: 500 });
  }

  const drive = createDriveClient(access);

  try {
    const res = await drive.files.list({
      pageSize: 30,
      pageToken: pageToken ?? undefined,
      q: q ? `name contains '${q.replace(/'/g, "\\'")}' and trashed = false` : "trashed = false",
      fields: "nextPageToken, files(id, name, mimeType, modifiedTime, size)",
    });

    return NextResponse.json({
      files: res.data.files ?? [],
      nextPageToken: res.data.nextPageToken,
    });
  } catch {
    /* tentar refresh */
    try {
      const refresh = decryptToken(row.refresh_token_encrypted);
      const clientId = process.env.GOOGLE_CLIENT_ID!;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
      const redirectUri =
        process.env.GOOGLE_REDIRECT_URI ??
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-drive/callback`;
      const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      oauth2.setCredentials({ refresh_token: refresh });
      const { credentials } = await oauth2.refreshAccessToken();
      if (!credentials.access_token) {
        throw new Error("refresh failed");
      }
      const newAccess = encryptToken(credentials.access_token);
      await admin
        .from("drive_tokens")
        .update({
          access_token_encrypted: newAccess,
          expires_at: credentials.expiry_date
            ? new Date(credentials.expiry_date).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("workspace_id", m.workspace_id);

      const drive2 = createDriveClient(credentials.access_token);
      const res2 = await drive2.files.list({
        pageSize: 30,
        pageToken: pageToken ?? undefined,
        q: q ? `name contains '${q.replace(/'/g, "\\'")}' and trashed = false` : "trashed = false",
        fields: "nextPageToken, files(id, name, mimeType, modifiedTime, size)",
      });
      return NextResponse.json({
        files: res2.data.files ?? [],
        nextPageToken: res2.data.nextPageToken,
      });
    } catch {
      return NextResponse.json({ error: "Falha ao acessar o Drive" }, { status: 502 });
    }
  }
}
