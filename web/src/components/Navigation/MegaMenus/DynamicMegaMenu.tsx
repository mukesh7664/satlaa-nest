"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
export interface MegaMenuLink {
  name: string;
  description?: string;
  icon?: string;
  href?: string;
}

export interface MegaMenuColumn {
  title: string;
  items: MegaMenuLink[];
  icon?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  icon?: string;
  isHot?: boolean;
  menuType: string;
  columns?: MegaMenuColumn[];
  link?: string;
}
interface DynamicMegaMenuProps {
  data: MenuItem | null;
}

export default function DynamicMegaMenu({ data }: DynamicMegaMenuProps) {
  if (!data || !data.columns || data.columns.length === 0) {
    return null;
  }

  // Determine grid columns based on number of columns in data
  const gridCols = data.columns.length === 1 ? "lg:grid-cols-1" :
                  data.columns.length === 2 ? "lg:grid-cols-2" :
                  data.columns.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-8 p-6 lg:p-10 bg-white`}>
      {data.columns.map((column, colIdx) => (
        <div key={`${column.title}-${colIdx}`} className="flex flex-col gap-4">
          {/* Column Heading */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            {column.icon && (
              <div className="w-6 h-6 relative hidden lg:block">
                <Image src={column.icon} alt={column.title} fill className="object-contain" />
              </div>
            )}
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              {column.title}
            </h3>
          </div>

          {/* Column Items */}
          <ul className="flex flex-col gap-1.5">
            {column.items.map((item, itemIdx) => (
              <li key={`${item.name}-${itemIdx}`}>
                <Link
                  href={item.href ? (item.href.startsWith("/") || item.href.startsWith("http") ? item.href : `/${item.href}`) : "#"}
                  className="group flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                >
                  {item.icon && (
                    <div className="w-8 h-8 relative flex-shrink-0 mt-0.5 rounded bg-white shadow-sm overflow-hidden border border-gray-50">
                      <Image src={item.icon} alt={item.name} fill className="object-contain p-1" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </span>
                    {item.description && (
                      <span className="text-[12px] text-gray-400 line-clamp-1 group-hover:text-gray-500 transition-colors">
                        {item.description}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
