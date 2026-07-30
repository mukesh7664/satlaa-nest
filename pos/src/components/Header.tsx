"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";

const TITLES: Record<string, string> = {
  "/billing": "Billing",
  "/sales": "Sales",
  "/couriers": "Couriers",
  "/reports/staff": "Staff Report",
  "/reports/courier": "Courier Report",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const title =
    Object.keys(TITLES).find((k) => pathname.startsWith(k))?.length
      ? TITLES[Object.keys(TITLES).find((k) => pathname.startsWith(k))!]
      : "POS";

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-[60px] w-full items-center justify-between border-b border-gray-100 bg-white px-6 2xl:h-[72px]">
      <h1 className="text-base font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium text-slate-700">
            {user?.name || "Operator"}
          </div>
          <div className="text-xs capitalize text-slate-400">
            {user?.role?.replace("_", " ") || ""}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-gray-50 hover:text-red-600"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
