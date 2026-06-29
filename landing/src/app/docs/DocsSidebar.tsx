"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DocsSidebar({ groupedDocs }: { groupedDocs: Record<string, any[]> }) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-[260px] flex-shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar font-sans pr-6">

      <div className="mb-6">
        <Link href="/docs" className="text-[14px] font-bold text-gray-900 transition-colors hover:text-gray-600">
          EPxWEB Documentation
        </Link>
      </div>

      <nav className="flex flex-col gap-8 pb-10">
        {Object.entries(groupedDocs).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-[13px] font-semibold text-gray-900 mb-2 tracking-tight">
              {category}
            </h4>
            <ul className="flex flex-col border-l border-gray-100">
              {items.map((item) => {
                const isActive = pathname === `/docs/${item.slug}`;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/docs/${item.slug}`}
                      className={`block pl-4 py-1.5 text-[14px] transition-all duration-200 border-l ${isActive
                          ? "text-blue-600 font-medium border-blue-600 -ml-[1px]"
                          : "text-gray-500 font-normal border-transparent hover:text-gray-900 hover:border-gray-300 -ml-[1px]"
                        }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
