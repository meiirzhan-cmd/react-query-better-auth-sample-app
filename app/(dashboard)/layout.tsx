import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Header } from "./_components/Header";
import { CommandPalette } from "./_components/CommandPalette";
import Sidebar from "./_components/Sidebar";

interface Props {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: Readonly<Props>) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <Sidebar user={session.user} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header user={session.user} />

        {/* Main content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Command Palette (global) */}
      <CommandPalette />
    </div>
  );
}
