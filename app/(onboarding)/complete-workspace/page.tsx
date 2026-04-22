import { redirect } from "next/navigation";
import { CompleteWorkspaceForm } from "./CompleteWorkspaceForm";
import { getUserWorkspace } from "@/lib/workspace/get-user-workspace";

export default async function CompleteWorkspacePage() {
  const ctx = await getUserWorkspace();
  if (ctx) {
    redirect("/dashboard");
  }
  return <CompleteWorkspaceForm />;
}
