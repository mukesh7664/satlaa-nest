"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import { apiService } from "@/services/api";
import { CircularProgress, Box } from "@mui/material";
import { isTokenExpired } from "@/utils/auth";

export default function StoreAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isCollapsedPage = (pathname.startsWith("/pages/") && pathname !== "/pages") || pathname.startsWith("/settings");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isCollapsedPage);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (token && isTokenExpired(token)) {
        dispatch(logout());
        setIsInitialized(true);
        router.push('/login');
        return;
      }

      if (token && !isAuthenticated) {
        try {
          const response = await apiService.getCurrentAdmin(token);
          dispatch(loginSuccess({ admin: response.admin, token }));
        } catch (error) {
          console.error("Session restoration failed:", error);
          dispatch(logout());
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isCollapsedPage) {
      setSidebarCollapsed(true);
    }
  }, [pathname, isCollapsedPage]);

  if (!isInitialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main
          className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 relative z-0 ${sidebarCollapsed ? "ml-16" : "ml-52 2xl:ml-60"
            }`}
        >
          <Header />
          {pathname.startsWith("/pages/") && pathname !== "/pages" ? (
            children
          ) : (
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
