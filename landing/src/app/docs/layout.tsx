import React from "react";
import Link from "next/link";
import { Book, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import DocsSidebar from "./DocsSidebar";

export const dynamic = "force-dynamic";

async function getDocumentations() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api/v1'}/documentation`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error loading docs", error);
    return [];
  }
}

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const docs = await getDocumentations();

  // Group by category, then by sectioTitle
  const groupedDocs: Record<string, any[]> = {};
  docs.forEach((doc: any) => {
    const cat = doc.category || "General";
    if (!groupedDocs[cat]) groupedDocs[cat] = [];
    groupedDocs[cat].push(doc);
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* We assume Navbar exists and provides the standard header */}
      <Navbar />

      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <DocsSidebar groupedDocs={groupedDocs} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
