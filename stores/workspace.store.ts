import { create } from "zustand";
import type { WorkspacePlan } from "@/types/database.types";

interface WorkspaceState {
  workspaceId: string | null;
  workspaceName: string | null;
  plan: WorkspacePlan | null;
  setWorkspace: (id: string, name: string, plan: WorkspacePlan) => void;
  clear: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaceId: null,
  workspaceName: null,
  plan: null,
  setWorkspace: (workspaceId, workspaceName, plan) =>
    set({ workspaceId, workspaceName, plan }),
  clear: () => set({ workspaceId: null, workspaceName: null, plan: null }),
}));
