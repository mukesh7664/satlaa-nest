"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings as SettingsIcon,
  Palette as ThemeIcon,
  Payment as PaymentIcon,
  Public as SeoIcon,
  Campaign as AdvertisementIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  LocalShipping as LocalShippingIcon,
  HelpOutline as HelpIcon,
} from "@mui/icons-material";

import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  key: string;
  children?: { label: string; href: string; }[];
}

const settingsMenu: MenuItem[] = [
  {
    label: "General Settings",
    icon: <SettingsIcon />,
    href: "/settings/general-settings",
    key: "settings/general-settings",
  },
  {
    label: "Theme Settings",
    icon: <ThemeIcon />,
    href: "/settings/theme-settings",
    key: "settings/theme-settings",
  },
  {
    label: "Payment Settings",
    icon: <PaymentIcon />,
    href: "/settings/payment-settings",
    key: "settings/payment-settings",
  },
  {
    label: "Shipping Settings",
    icon: <LocalShippingIcon />,
    href: "/settings/shipping-settings",
    key: "settings/shipping-settings",
  },
  {
    label: "SEO Settings",
    icon: <SeoIcon />,
    href: "/settings/seo-settings",
    key: "settings/seo-settings",
  },
  {
    label: "Promo Popups",
    icon: <AdvertisementIcon />,
    href: "/settings/promo-popups",
    key: "settings/advertisement",
  },
  {
    label: "Email Settings",
    icon: <EmailIcon />,
    href: "/settings/email-config/settings",
    key: "settings/email-config/settings",
  },
  {
    label: "Email Template",
    icon: <EmailIcon />,
    href: "/settings/email-config/template",
    key: "settings/email-config/template",
  },
  {
    label: "Audit Logs",
    icon: <SecurityIcon />,
    href: "/settings/audit-logs",
    key: "settings/audit-logs",
  },
  {
    label: "Support & Help",
    icon: <HelpIcon />,
    href: "/settings/support-help",
    key: "settings/support-help",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin } = useAppSelector((state) => state.auth);
  const allowedPages = admin?.allowedPages || [];
  const isSuperAdmin = admin?.role === "super_admin";

  // Prevent direct URL access to settings pages not allowed in the plan
  React.useEffect(() => {
    if (!admin) return;
    if (isSuperAdmin) return;

    const currentMenuItem = settingsMenu.find(item => pathname.startsWith(item.href));
    if (currentMenuItem && currentMenuItem.key !== "settings/support-help" && !allowedPages.includes(currentMenuItem.key)) {
      const firstAllowed = settingsMenu.find(item => allowedPages.includes(item.key));
      if (firstAllowed) {
        router.replace(firstAllowed.href);
      } else {
        router.replace("/");
      }
    }
  }, [admin, allowedPages, pathname, router, isSuperAdmin]);

  const filteredMenu = settingsMenu.filter(item => {
    if (isSuperAdmin) return true;
    if (item.key === "settings/support-help") return true;
    return allowedPages.includes(item.key);
  });

  return (
    <div className="flex h-[calc(100vh-3.75rem)] 2xl:h-[calc(100vh-4.5rem)] overflow-hidden">
      {/* Secondary Sidebar */}
      <aside className="w-56 2xl:w-72 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto no-scrollbar">
        <div className="p-4 2xl:p-6">
          <h2 className="text-[10px] 2xl:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 2xl:mb-6 px-3 2xl:px-4">
            Settings
          </h2>
          <nav className="space-y-0.5 2xl:space-y-1">
            {filteredMenu.map((item) => {
              const isActive = pathname.startsWith(item.href) || (item.children?.some(child => pathname === child.href));

              return (
                <div key={item.label} className="flex flex-col gap-0.5 2xl:gap-1">
                  <Link href={item.href}>
                    <div
                      className={`flex items-center gap-2.5 2xl:gap-3 px-3 2xl:px-4 py-2 2xl:py-3 rounded-lg transition-all duration-200 group cursor-pointer relative ${isActive
                          ? "text-[#408dfb]"
                          : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      {/* Active Indicator Underline */}
                      {isActive && (
                        <div className="absolute bottom-1 left-3 right-3 h-0.5 bg-[#408dfb] rounded-full" />
                      )}
                      
                      <span
                        className={`flex-shrink-0 transition-transform duration-200 ${isActive ? "text-[#408dfb]" : "text-slate-400 group-hover:text-slate-600"
                          }`}
                      >
                        {React.cloneElement(item.icon as any, {
                          sx: { fontSize: { xs: 18, '2xl': 20 } },
                        })}
                      </span>
                      <span className={`text-[13px] 2xl:text-sm font-medium ${isActive ? "font-semibold" : ""}`}>
                        {item.label}
                      </span>
                    </div>
                  </Link>

                  {/* Children / Sub-menu */}
                  {item.children && isActive && (
                    <div className="ml-10 2xl:ml-11 flex flex-col gap-0.5 2xl:gap-1 mb-1.5 2xl:mb-2">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}>
                          <div
                            className={`px-3 py-1.5 2xl:py-2 rounded-lg text-[11px] 2xl:text-xs transition-all duration-200 cursor-pointer relative ${pathname === child.href
                                ? "text-[#408dfb] font-semibold"
                                : "text-slate-500 hover:text-slate-900"
                              }`}
                          >
                             {pathname === child.href && (
                              <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#408dfb] rounded-full" />
                            )}
                            {child.label}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
