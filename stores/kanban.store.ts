import { create } from "zustand";
import type { KanbanColumnWithCards } from "@/types/app.types";

interface KanbanState {
  board: KanbanColumnWithCards[];
  setBoard: (b: KanbanColumnWithCards[]) => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  board: [],
  setBoard: (board) => set({ board }),
}));
