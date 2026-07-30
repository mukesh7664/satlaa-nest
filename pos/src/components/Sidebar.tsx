"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  ReceiptText,
  Truck,
  Users,
  BarChart3,
} from "lucide-react";

const NAV = [
  { label: "Billing", href: "/billing", icon: ShoppingCart },
  { label: "Sales", href: "/sales", icon: ReceiptText },
  { label: "Couriers", href: "/couriers", icon: Truck },
  { label: "Staff Report", href: "/reports/staff", icon: Users },
  { label: "Courier Report", href: "/reports/courier", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-52 flex-col border-r border-gray-100 bg-white 2xl:w-60">
      <div className="flex h-[60px] items-center gap-2 px-5 2xl:h-[72px]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#408dfb] text-sm font-bold text-white">
          F
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-800">
          Fanostyle POS
        </span>
      </div>

      <nav className="no-scrollbar mt-2 flex-1 overflow-y-auto px-3 pb-6">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#408dfb] text-white"
                  : "text-slate-600 hover:bg-gray-50 hover:text-slate-900"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
