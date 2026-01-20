import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Header } from "./_components/Header";
import { CommandPalette } from "./_components/CommandPalette";
import Sidebar from "./_components/Sidebar";
import { ComposeWindow } from "./_components/ComposeWindow";

interface Props {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: Readonly<Props>) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <Sidebar user={session.user} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header user={session.user} />

        {/* Main content - CHANGED: removed overflow-auto, added flex */}
        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>

      {/* Command Palette (global) */}
      <CommandPalette />

      {/* Compose Window (global) */}
      <ComposeWindow />
    </div>
  );
}
