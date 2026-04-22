"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import type { Database } from "@/types/database.types";

type DriveFile = Database["public"]["Tables"]["drive_files"]["Row"];

function iconForMime(mime: string | null) {
  if (!mime) return "draft";
  if (mime.includes("pdf")) return "picture_as_pdf";
  if (mime.includes("word") || mime.includes("document")) return "description";
  if (mime.includes("sheet") || mime.includes("excel")) return "table_chart";
  return "insert_drive_file";
}

function colorForMime(mime: string | null) {
  if (!mime) return "text-on-surface-variant";
  if (mime.includes("pdf")) return "text-red-500";
  if (mime.includes("word") || mime.includes("document")) return "text-blue-500";
  if (mime.includes("sheet") || mime.includes("excel")) return "text-green-600";
  return "text-on-surface-variant";
}

export function DriveFileList({
  projectId,
  initialFiles,
  compact,
}: {
  projectId: string;
  initialFiles: DriveFile[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [files, setFiles] = useState(initialFiles);

  async function toggle(id: string, visible: boolean) {
    const res = await fetch(`/api/projects/${projectId}/files`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, visible_in_portal: visible }),
    });
    if (!res.ok) {
      toast.error("Erro ao atualizar visibilidade");
      return;
    }
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, visible_in_portal: visible } : f)));
    toast.success(visible ? "Visível no portal" : "Oculto no portal");
    router.refresh();
  }

  if (files.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">
        Nenhum arquivo vinculado. Use &quot;Buscar no Drive&quot; na aba Arquivos.
      </p>
    );
  }

  return (
    <ul className={compact ? "space-y-2" : "space-y-3"}>
      {files.map((f) => (
        <li
          key={f.id}
          className="flex items-center gap-3 rounded-lg border border-outline-variant/20 p-3 transition-all hover:bg-surface-container-low"
        >
          <span className={`material-symbols-outlined ${colorForMime(f.mime_type)}`}>
            {iconForMime(f.mime_type)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-on-surface">{f.name}</p>
            <p className="text-xs text-on-surface-variant">
              Sincronizado em{" "}
              {new Date(f.synced_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
            </p>
          </div>
          {!compact ? (
            <label className="flex items-center gap-2 text-xs text-on-surface-variant">
              <input
                type="checkbox"
                checked={f.visible_in_portal}
                onChange={(e) => void toggle(f.id, e.target.checked)}
              />
              Portal
            </label>
          ) : null}
          <a
            href={`https://drive.google.com/file/d/${f.drive_file_id}/view`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            aria-label="Abrir no Google Drive"
          >
            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
