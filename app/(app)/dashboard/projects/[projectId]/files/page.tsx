"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DriveFileList } from "@/components/drive/DriveFileList";
import { DrivePicker } from "@/components/drive/DrivePicker";
import type { Database } from "@/types/database.types";

type DriveFile = Database["public"]["Tables"]["drive_files"]["Row"];

export default function ProjectFilesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = String(params.projectId);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/files`);
    const j = (await res.json()) as { files?: DriveFile[] };
    if (j.files) setFiles(j.files);
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface">Arquivos do Drive</h2>
          <p className="text-sm text-on-surface-variant">
            Referências ao Google Drive — sem upload pelo ArqTech.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
          Buscar no Drive
        </Button>
      </div>
      <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-low/30 p-6">
        <DriveFileList projectId={projectId} initialFiles={files} />
      </div>
      <DrivePicker
        projectId={projectId}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onAdded={() => {
          void load();
          router.refresh();
        }}
      />
    </div>
  );
}
