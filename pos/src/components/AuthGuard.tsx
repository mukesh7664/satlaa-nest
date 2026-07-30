"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginSuccess, logout, PosUser } from "@/store/authSlice";
import { isTokenExpired } from "@/utils/auth";

const PUBLIC_ROUTES = ["/login"];
const ALLOWED_ROLES = ["pos_user", "admin"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const rawUser = typeof window !== "undefined" ? localStorage.getItem("posUser") : null;

    const valid = token && !isTokenExpired(token);

    if (valid && rawUser) {
      try {
        const user: PosUser = JSON.parse(rawUser);
        if (!ALLOWED_ROLES.includes(user.role)) {
          dispatch(logout());
          if (!isPublic) router.replace("/login");
          setReady(true);
          return;
        }
        if (!isAuthenticated) dispatch(loginSuccess({ user, token: token! }));
        if (isPublic) router.replace("/billing");
      } catch {
        dispatch(logout());
        if (!isPublic) router.replace("/login");
      }
    } else {
      if (token) dispatch(logout());
      if (!isPublic) router.replace("/login");
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#408dfb]" />
      </div>
    );
  }

  return <>{children}</>;
}
