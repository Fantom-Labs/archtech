import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getUserWorkspace } from "@/lib/workspace/get-user-workspace";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getUserWorkspace();
  if (!ctx) {
    redirect("/complete-workspace");
  }

  return (
    <AppShell
      topHeaderProps={{
        userEmail: ctx.email,
        userName: ctx.displayName,
        userRoleLabel: ctx.userRoleLabel,
        avatarUrl: ctx.avatarUrl,
      }}
    >
      {children}
    </AppShell>
  );
}
