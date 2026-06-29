"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import { apiService } from "@/services/api";
import { CircularProgress, Box, Typography } from "@mui/material";
import { isTokenExpired } from "@/utils/auth";

const ROUTE_PERMISSIONS = [
  { key: "dashboard", routes: ["/dashboard"], label: "Dashboard" },
  { key: "reports", routes: ["/reports"], label: "Reports & Analytics" },
  { key: "orders", routes: ["/orders", "/payments"], label: "Orders Management" },
  { key: "estimates", routes: ["/estimates"], label: "Estimates" },
  { key: "invoices", routes: ["/invoices", "/invoice"], label: "Invoices" },
  { key: "customers", routes: ["/customers"], label: "Customers Directory" },
  { key: "inquiries", routes: ["/inquiries"], label: "Inquiries & Leads" },
  { key: "manage-products/product-list", routes: ["/manage-products/product-list"], label: "Products List" },
  { key: "manage-products", routes: ["/manage-products", "/discounts"], label: "Product Catalog" },
  { key: "tags-flags", routes: ["/manage-products/tags", "/manage-products/flags"], label: "Product Tags & Flags" },
  { key: "pages", routes: ["/pages"], label: "Pages Builder" },
  { key: "sections", routes: ["/sections"], label: "Sections Library" },
  { key: "themes", routes: ["/themes"], label: "Themes Customization" },
  { key: "media", routes: ["/media"], label: "Media Manager" },
  { key: "admin-list", routes: ["/admin-list"], label: "Store Admins & Team" },
  { key: "settings/general-settings", routes: ["/settings/general-settings"], label: "General Settings" },
  { key: "settings/theme-settings", routes: ["/settings/theme-settings"], label: "Theme Settings" },
  { key: "settings/payment-settings", routes: ["/settings/payment-settings"], label: "Payment Settings" },
  { key: "settings/shipping-settings", routes: ["/settings/shipping-settings"], label: "Shipping Settings" },
  { key: "settings/seo-settings", routes: ["/settings/seo-settings"], label: "SEO Settings" },
  { key: "settings/advertisement", routes: ["/settings/promo-popups"], label: "Promo Popups" },
  { key: "settings/email-config/settings", routes: ["/settings/email-config/settings"], label: "Email Settings" },
  { key: "settings/email-config/template", routes: ["/settings/email-config/template"], label: "Email Template" },
  { key: "settings/audit-logs", routes: ["/settings/audit-logs"], label: "Audit Logs" },
];

const checkRouteAccess = (pathname: string, admin: any) => {
  if (!admin) return { hasAccess: true, label: "" };
  if (admin.role === "super_admin") return { hasAccess: true, label: "" };

  const sortedPermissions = [...ROUTE_PERMISSIONS].sort((a, b) => {
    const maxA = Math.max(...a.routes.map(r => r.length));
    const maxB = Math.max(...b.routes.map(r => r.length));
    return maxB - maxA;
  });

  let matchedConfig = null;
  for (const config of sortedPermissions) {
    if (config.routes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
      matchedConfig = config;
      break;
    }
  }

  if (!matchedConfig) return { hasAccess: true, label: "" };

  const allowedPages = admin.allowedPages || [];
  return {
    hasAccess: allowedPages.includes(matchedConfig.key),
    label: matchedConfig.label
  };
};

const UpgradeRequiredView = ({ moduleName }: { moduleName: string }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        p: 4,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          bgcolor: '#fef2f2',
          color: '#ef4444',
          p: 3,
          borderRadius: '50%',
          mb: 3,
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.15)',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '48px', height: '48px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#1e293b' }}>
        Access Restricted
      </Typography>
      <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 480, mb: 4 }}>
        The <strong>{moduleName}</strong> module is not included in your current subscription plan. Please contact your store administrator to upgrade and unlock this feature.
      </Typography>
    </Box>
  );
};

export default function StoreAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isCollapsedPage = (pathname.startsWith("/pages/") && pathname !== "/pages") || pathname.startsWith("/settings");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isCollapsedPage);
  const { admin, isAuthenticated } = useAppSelector((state) => state.auth);
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

  const { hasAccess, label } = checkRouteAccess(pathname, admin);

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
          {!hasAccess ? (
            <div className="flex-1 overflow-y-auto">
              <UpgradeRequiredView moduleName={label} />
            </div>
          ) : pathname.startsWith("/pages/") && pathname !== "/pages" ? (
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
