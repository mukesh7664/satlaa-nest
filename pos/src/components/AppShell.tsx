"use client";

import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

// Routes that render without the POS shell (no sidebar/header/auth chrome).
const BARE_ROUTES = ["/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBare = BARE_ROUTES.some((r) => pathname.startsWith(r));

  if (isBare) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="ml-52 flex h-screen flex-1 flex-col overflow-hidden 2xl:ml-60">
          <Header />
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
