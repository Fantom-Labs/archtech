import type { Database } from "./database.types";

export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectPhaseRow = Database["public"]["Tables"]["project_phases"]["Row"];
export type KanbanColumnRow = Database["public"]["Tables"]["kanban_columns"]["Row"];
export type KanbanCardRow = Database["public"]["Tables"]["kanban_cards"]["Row"];
export type WorkspaceRow = Database["public"]["Tables"]["workspaces"]["Row"];

export type ProjectWithPhases = ProjectRow & {
  project_phases: ProjectPhaseRow[];
};

export type KanbanColumnWithCards = KanbanColumnRow & {
  kanban_cards: KanbanCardRow[];
};
