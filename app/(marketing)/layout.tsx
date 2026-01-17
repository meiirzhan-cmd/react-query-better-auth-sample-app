import { getSession } from "@/lib/session";
import { MarketingNav } from "./_components/MarketingNav";
import { Footer } from "./_components/Footer";

interface Props {
  children: React.ReactNode;
}

export default async function MarketingLayout({ children }: Readonly<Props>) {
  const session = await getSession();

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-zinc-950">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] left-1/2 h-800px w-800px -translate-x-1/2 rounded-full bg-linear-to-b from-violet-200/40 via-blue-100/20 to-transparent blur-3xl dark:from-violet-900/20 dark:via-blue-900/10" />
        <div className="absolute right-0 top-[20%] h-600px w-600px rounded-full bg-linear-to-b from-amber-100/30 to-transparent blur-3xl dark:from-amber-900/10" />
      </div>

      <MarketingNav
        isAuthenticated={!!session}
        userName={session?.user?.name}
      />

      <main className="relative">{children}</main>

      <Footer />
    </div>
  );
}
