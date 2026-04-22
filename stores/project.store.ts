import { create } from "zustand";
import type { ProjectRow } from "@/types/app.types";

interface ProjectState {
  current: ProjectRow | null;
  setCurrent: (p: ProjectRow | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  current: null,
  setCurrent: (current) => set({ current }),
}));
