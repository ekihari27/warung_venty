import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Providers } from "@/components/providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <Providers>
      <div className="min-h-screen bg-background">
        <Sidebar user={user} />
        <DashboardShell>
          <Header user={user} />
          <main className="flex-1 overflow-auto px-4 py-5 lg:px-6 lg:py-6">
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </main>
        </DashboardShell>
      </div>
    </Providers>
  );
}
