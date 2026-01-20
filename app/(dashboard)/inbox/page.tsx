import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import InboxContent from "./_components/InboxContent";

export const metadata = {
  title: "Inbox",
  description: "Manage your emails with AI-powered insights",
};

export default async function InboxPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-full flex-col">
      <InboxContent />
    </div>
  );
}
