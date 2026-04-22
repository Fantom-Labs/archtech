import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canCreateProject, planLimitMessage } from "@/lib/utils/plan-limits";

const createSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
});

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
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!m) {
    return NextResponse.json({ error: "Workspace não encontrado" }, { status: 404 });
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      project_phases ( id, name, status, "order" )
    `,
    )
    .eq("workspace_id", m.workspace_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: projects ?? [] });
}

export async function POST(request: Request) {
  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await request.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message : "Dados inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: m } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!m) {
    return NextResponse.json({ error: "Workspace não encontrado" }, { status: 404 });
  }

  const { data: ws } = await supabase
    .from("workspaces")
    .select("plan")
    .eq("id", m.workspace_id)
    .single();

  if (!ws) {
    return NextResponse.json({ error: "Workspace não encontrado" }, { status: 404 });
  }

  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", m.workspace_id)
    .eq("status", "active");

  const activeCount = count ?? 0;
  if (!canCreateProject(ws.plan, activeCount)) {
    return NextResponse.json({ error: planLimitMessage(ws.plan) }, { status: 403 });
  }

  const base = slugify(body.name, { lower: true, strict: true }) || "projeto";
  const slug = `${base}-${nanoid(6)}`;

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: m.workspace_id,
      name: body.name,
      slug,
      client_name: body.clientName ?? null,
      client_email: body.clientEmail || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const phases = [
    { name: "Estudo preliminar", order: 0 },
    { name: "Anteprojeto", order: 1 },
    { name: "Projeto executivo", order: 2 },
    { name: "Acompanhamento", order: 3 },
  ];

  await supabase.from("project_phases").insert(
    phases.map((p, i) => ({
      project_id: project.id,
      name: p.name,
      order: i,
      status: i === 0 ? "active" : "pending",
    })),
  );

  return NextResponse.json({ project });
}
