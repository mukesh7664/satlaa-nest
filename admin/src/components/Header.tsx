"use client";

import React, { useState, useRef, useEffect } from 'react'
import { Search, Globe, Moon, Bell, Maximize, Grid, Settings, User, LogOut, AlertTriangle, ArrowLeft, ChevronRight, HelpCircle } from 'lucide-react'
import Image from 'next/image'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { useRouter, usePathname } from 'next/navigation'
import NotificationBell from './NotificationBell'
import { dashboardApiService, SetupStatus } from '@/services/dashboard.api'

// Map of route segments to human-readable labels
const SEGMENT_LABELS: Record<string, string> = {
  "dashboard": "Dashboard",
  "notifications": "Notifications",
  "estimates": "Estimates",
  "create": "New",
  "edit": "Edit",
  "invoices": "Invoices",
  "invoice": "Invoices",
  "orders": "Orders",
  "payments": "Payments",
  "customers": "Customers",
  "inquiries": "Inquiries",
  "manage-products": "Products",
  "product-list": "Product List",
  "add-bundle": "Add Bundle",
  "create-product": "New Product",
  "discounts": "Discounts",
  "tags": "Tags",
  "flags": "Flags",
  "categories": "Categories",
  "pages": "Pages",
  "sections": "Sections",
  "themes": "Themes",
  "media": "Media",
  "admin-list": "Team",
  "reports": "Reports",
  "settings": "Settings",
  "general-settings": "General",
  "domain-management": "Domains",
  "theme-settings": "Theme",
  "payment-settings": "Payment",
  "shipping-settings": "Shipping",
  "seo-settings": "SEO",
  "audit-logs": "Audit Logs",
  "manage-subscription": "Subscription",
  "promo-popups": "Promo Popups",
  "email-config": "Email Config",
  "template": "Templates",
  "profile": "Profile",
};

// IDs (UUIDs / long strings) to show as short references
const isId = (seg: string) => /^[0-9a-f-]{8,}$/i.test(seg) || /^\d+$/.test(seg);
const shortId = (seg: string) => `#${seg.slice(-6).toUpperCase()}`;

function buildBreadcrumb(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let cumPath = '';
  for (const seg of segments) {
    cumPath += `/${seg}`;
    const label = isId(seg) ? shortId(seg) : (SEGMENT_LABELS[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
    const href = cumPath === "/manage-products" ? "/manage-products/product-list" : cumPath;
    crumbs.push({ label, href });
  }
  return crumbs;
}

export default function Header() {
  const { admin } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const breadcrumbs = buildBreadcrumb(pathname || '');
  const parentHref = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2].href : null;

  const [profileOpen, setProfileOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const warningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await dashboardApiService.getDashboardData();
        setSetupStatus(data.setupStatus);
      } catch (err) {
        console.error("Failed to fetch setup status", err);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (warningRef.current && !warningRef.current.contains(event.target as Node)) {
        setWarningOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const showPaymentWarning = setupStatus
    ? (setupStatus.paymentAllowed !== false && !setupStatus.paymentConfigured)
    : false;
  const showEmailWarning = setupStatus
    ? (setupStatus.emailAllowed !== false && !setupStatus.emailConfigured)
    : false;
  const showShippingWarning = setupStatus
    ? (setupStatus.shippingAllowed !== false && !setupStatus.shippingConfigured)
    : false;
  const warningCount = (showPaymentWarning ? 1 : 0) + (showEmailWarning ? 1 : 0) + (showShippingWarning ? 1 : 0);
  const hasWarnings = warningCount > 0;

  return (
    <header className="w-full bg-white border-b border-gray-100 h-[60px] 2xl:h-[72px] px-6 flex items-center justify-between sticky top-0 z-40">

      {/* Left side: Back button + Breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">

        <nav className="flex items-center gap-1.5 text-sm min-w-0">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                {i > 0 && <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />}
                <span
                  onClick={() => !isLast && router.push(crumb.href)}
                  className={`truncate transition-colors ${isLast
                    ? 'text-slate-800 font-semibold'
                    : 'text-slate-400 hover:text-slate-600 cursor-pointer'
                    }`}
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right Side: Icons & Profile */}
      <div className="flex items-center space-x-1.5 2xl:space-x-2 ml-4">

        {/* Icons Group */}
        <div className="flex items-center space-x-1.5 2xl:space-x-2">

          {/* Help Center */}
          <button
            onClick={() => router.push('/settings/support-help')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Support & Help"
          >
            <HelpCircle size={18} />
          </button>

          {/* Notifications */}
          <NotificationBell collapsed={false} />

          {/* Warnings / Store Alerts */}
          {hasWarnings && (
            <div className="relative" ref={warningRef}>
              <button
                onClick={() => setWarningOpen(!warningOpen)}
                className="relative w-10 h-10 rounded-full bg-amber-50/50 flex items-center justify-center text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <AlertTriangle size={18} />
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {warningCount}
                </span>
              </button>

              {warningOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-50 transition-all">
                  <div className="px-4 pb-2 border-b border-gray-50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Store Alerts</h3>
                  </div>
                  <div className="mt-2">
                    {showPaymentWarning && (
                      <div className="px-4 py-3 hover:bg-gray-50 flex items-start gap-3 cursor-pointer group" onClick={() => { router.push('/settings/payment-settings'); setWarningOpen(false); }}>
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle size={14} className="text-amber-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">Payment Gateway Missing</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">Configure your payment methods to accept orders</div>
                        </div>
                      </div>
                    )}
                    {showEmailWarning && (
                      <div className="px-4 py-3 hover:bg-gray-50 flex items-start gap-3 cursor-pointer group" onClick={() => { router.push('/settings/email-config/settings'); setWarningOpen(false); }}>
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle size={14} className="text-amber-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">Email Config Pending</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">Setup SMTP settings for transactional emails</div>
                        </div>
                      </div>
                    )}
                    {showShippingWarning && (
                      <div className="px-4 py-3 hover:bg-gray-50 flex items-start gap-3 cursor-pointer group" onClick={() => { router.push('/settings/shipping-settings'); setWarningOpen(false); }}>
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle size={14} className="text-amber-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">Shipping Config Pending</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">Setup your Shiprocket credentials to push orders</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Divider */}
        <div className="w-px h-6 2xl:h-8 bg-gray-200 mx-1 2xl:mx-2 hidden sm:block"></div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div
            className="flex items-center space-x-2 2xl:space-x-3 cursor-pointer hover:bg-gray-50 p-1 pr-2 2xl:pr-3 rounded-full transition-colors"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500 font-bold text-sm 2xl:text-base">
              {admin?.avatar ? (
                <img src={admin.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                admin?.name?.charAt(0) || 'A'
              )}
            </div>
            <div className="hidden sm:block">
              <div className="text-[13px] 2xl:text-sm font-bold text-gray-900 leading-tight">{admin?.name || 'Admin User'}</div>
              <div className="text-[10px] 2xl:text-xs text-gray-500 font-medium">{admin?.role === 'admin' ? 'Admin' : 'Sub Admin'}</div>
            </div>
          </div>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 transition-all">
              <button
                onClick={() => {
                  router.push('/profile');
                  setProfileOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <User size={16} className="text-gray-900" />
                <span className="font-medium text-gray-900">Profile</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 flex items-center gap-3 mt-1"
              >
                <LogOut size={16} className="text-gray-900" />
                <span className="font-medium text-gray-900">Log out</span>
              </button>
            </div>
          )}
        </div>

        {/* Settings Gear */}
        <button
          onClick={() => router.push('/settings')}
          className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-1 cursor-pointer"
        >
          <Settings className="w-4.5 h-4.5 2xl:w-5 2xl:h-5" />
        </button>

      </div>
    </header>
  )
}

