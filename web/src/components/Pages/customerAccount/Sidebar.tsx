"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Package,
  Star,
  MapPin,
  Heart,
  LogOut,
  Settings,
  CreditCard,
  Bell
} from "lucide-react";

const menuItems = [
  { name: "Personal Info", href: "/profile", icon: User },
  { name: "My Orders", href: "/profile/orders", icon: Package },
  { name: "My Favorites", href: "/profile/favorites", icon: Heart },
  { name: "Saved Addresses", href: "/profile/addresses", icon: MapPin },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-80 flex-col lg:flex shrink-0 sticky top-28 self-start">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* User Profile Summary */}
        <div className="p-8 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center text-xl font-black text-white shadow-md shadow-blue-500/20">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-lg leading-tight truncate text-slate-900">{user?.fullName || "Welcome!"}</h3>
              <p className="text-xs font-medium text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-4">
          <div className="px-4 py-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account Menu</h4>
          </div>
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3.5 text-sm font-bold transition-all duration-300",
                      isActive
                        ? "bg-blue-600 text-white shadow-sm translate-x-1"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 pt-6 border-t border-slate-50">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
