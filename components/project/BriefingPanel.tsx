"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { Json } from "@/types/database.types";
import type { ProjectRow } from "@/types/app.types";

interface BriefingPanelProps {
  project: ProjectRow;
}

export function BriefingPanel({ project }: BriefingPanelProps) {
  const [meta, setMeta] = useState({
    area_m2: project.area_m2?.toString() ?? "",
    location: project.location ?? "",
    style: project.style ?? "",
    budget_estimated: project.budget_estimated?.toString() ?? "",
  });
  const [savingMeta, setSavingMeta] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Escreva o briefing do projeto...",
      }),
    ],
    content: (project.briefing_json as object | null) ?? { type: "doc", content: [] },
    editorProps: {
      attributes: {
        class:
          "max-w-none min-h-[160px] rounded-lg border border-outline-variant/20 bg-surface-container-high/50 p-4 text-sm leading-relaxed focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  const saveBriefing = useCallback(async () => {
    if (!editor) return;
    const json = editor.getJSON() as Json;
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefing_json: json }),
    });
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      toast.error(j.error ?? "Erro ao salvar briefing");
      return;
    }
    toast.success("Briefing salvo");
  }, [editor, project.id]);

  useEffect(() => {
    if (editor && project.briefing_json) {
      editor.commands.setContent(project.briefing_json as object);
    }
  }, [editor, project.briefing_json]);

  async function saveMeta() {
    setSavingMeta(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area_m2: meta.area_m2 ? Number(meta.area_m2) : null,
          location: meta.location || null,
          style: meta.style || null,
          budget_estimated: meta.budget_estimated ? Number(meta.budget_estimated) : null,
        }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        toast.error(j.error ?? "Erro ao salvar");
        return;
      }
      toast.success("Dados atualizados");
    } finally {
      setSavingMeta(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-headline text-lg font-bold text-on-surface">Briefing</h2>
          <Button type="button" size="sm" onClick={() => void saveBriefing()}>
            Salvar briefing
          </Button>
        </div>
        <div className="mt-4">
          <EditorContent editor={editor} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-headline text-lg font-bold text-on-surface">Dados do projeto</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Metragem (m²)"
            value={meta.area_m2}
            onChange={(e) => setMeta((m) => ({ ...m, area_m2: e.target.value }))}
          />
          <Input
            label="Localização"
            value={meta.location}
            onChange={(e) => setMeta((m) => ({ ...m, location: e.target.value }))}
          />
          <Input
            label="Estilo"
            value={meta.style}
            onChange={(e) => setMeta((m) => ({ ...m, style: e.target.value }))}
          />
          <Input
            label="Orçamento est."
            value={meta.budget_estimated}
            onChange={(e) => setMeta((m) => ({ ...m, budget_estimated: e.target.value }))}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="secondary" disabled={savingMeta} onClick={() => void saveMeta()}>
            {savingMeta ? "Salvando..." : "Salvar dados"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
