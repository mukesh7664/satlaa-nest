"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MobileProfileNav } from "@/components/Pages/customerAccount/MobileProfileNav";
import { ProfileSidebar } from "@/components/Pages/customerAccount/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Loading Profile...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen">
      <div className="container-xl px-4 sm:px-6 md:px-8 lg:px-10 mx-auto py-8">
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <h1 className="text-2xl font-bold">Profile settings</h1>
          <MobileProfileNav />
        </div>
        <div className="flex">
          <ProfileSidebar />
          <main className="flex-1 lg:pl-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
