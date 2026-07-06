import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const newMessages = await db.query.contactMessages.findMany({
    where: eq(contactMessages.status, "new"),
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar newMessageCount={newMessages.length} />
      {/* pt-14 on mobile clears the fixed top bar; on md+ the sidebar is visible and there's no top bar */}
      <div className="flex-1 p-4 md:p-8 overflow-x-hidden min-w-0 pt-[calc(3.5rem+1rem)] md:pt-8">
        {children}
      </div>
    </div>
  );
}
