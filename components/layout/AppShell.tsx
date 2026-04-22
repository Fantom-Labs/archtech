import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

interface AppShellProps {
  children: React.ReactNode;
  topHeaderProps?: React.ComponentProps<typeof TopHeader>;
}

export function AppShell({ children, topHeaderProps }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <TopHeader {...topHeaderProps} />
      <main className="ml-64 min-h-screen bg-surface pt-[72px]">
        <div className="mx-auto max-w-[1600px] px-6 py-8 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
