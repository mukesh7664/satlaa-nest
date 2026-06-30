"use client";
import React from "react";
import {
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  QuestionAnswer as InquiriesIcon,
  Person as CustomersIcon,
  AdminPanelSettings as AdminListIcon,
  GridView as GridIcon,
  Settings as WebsiteSettingsIcon,
  Description as PagesIcon,
  Store as EcommerceSettingsIcon,
  LocationOn as LocationsIcon,
  Email as EmailConfigIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Settings as SettingsIcon,
  Public as SeoIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  ReceiptLong as TaxIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  ManageAccounts as RoleIcon,
  RequestQuote as EstimateIcon,
  Receipt as InvoiceIcon,
  Campaign as AdvertisementIcon,
  LocalOffer as TagIcon,
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Assessment as ReportsIcon,
  Subscriptions as SubscriptionsIcon,
  PermMedia as MediaIcon,
  ViewQuilt as ViewQuiltIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
  Article as ArticleIcon,
  AssignmentReturn as ReturnIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateAdmin } from "@/store/slices/authSlice";
import { useEffect } from "react";
import { IndentDecrease } from "lucide-react";


const menu = [
  {
    section: "",
    items: [
      {
        label: "Dashboard",
        icon: <DashboardIcon />,
        key: "dashboard",
        permission: "dashboard.view",
      },
    ],
  },
  {
    section: "Sales",
    items: [
      {
        label: "Orders",
        icon: <OrdersIcon />,
        key: "orders",
        permission: "orders.view",
        children: [
          { label: "Orders", key: "all-orders", href: "/orders" },
          { label: "Return & Replace", key: "return-requests", href: "/orders/return-requests" },
          { label: "Payments", key: "payments", href: "/payments" },
        ],
      },
      {
        label: "Estimates",
        icon: <EstimateIcon />,
        key: "estimates",
        permission: "estimates.view",
      },
      {
        label: "Invoices",
        icon: <InvoiceIcon />,
        key: "invoices",
        permission: "invoices.view",
      },
      {
        label: "Inquiries",
        icon: <InquiriesIcon />,
        key: "inquiries",
        permission: "inquiries.view",
      },
      {
        label: "Reports",
        icon: <ReportsIcon />,
        key: "reports",
        permission: "reports.view",
      },
    ],
  },
  {
    section: "People",
    items: [
      {
        label: "Customers",
        icon: <CustomersIcon />,
        key: "customers",
        permission: "customers.view",
      },
      {
        label: "Admin List",
        icon: <AdminListIcon />,
        key: "admin-list",
        permission: "admins.view",
      },
    ],
  },
  {
    section: "Inventory",
    items: [
      {
        label: "Products",
        icon: <OrdersIcon />,
        key: "manage-products/product-list",
        href: "/manage-products/product-list",
        permission: "products.view",
      },

      {
        label: "Manage Products",
        icon: <GridIcon />,
        key: "manage-products",
        permission: "products.manage",
        children: [
          { label: "Categories", key: "categories", href: "/manage-products/categories" },
          { label: "Collections", key: "collections" },
          { label: "Create Product", key: "create-product" },
          { label: "Discounts", key: "discounts", href: "/discounts" },
        ],
      },
      {
        label: "Tags & Flags",
        icon: <TagIcon />,
        key: "tags-flags",
        permission: "tags.manage",
        children: [
          { label: "Product Tags", key: "tags", href: "/manage-products/tags" },
          {
            label: "Product Flags",
            key: "flags",
            href: "/manage-products/flags",
          },
        ],
      },
    ],
  },
  {
    section: "Website",
    items: [
      {
        label: "Sections Library",
        icon: <ViewQuiltIcon />,
        key: "sections",
        href: "/sections",
        permission: "sections.view",
      },
      {
        label: "Pages",
        icon: <PagesIcon />,
        key: "pages",
        href: "/",
        permission: "pages.view",
      },
      {
        label: "Blog",
        icon: <ArticleIcon />,
        key: "blog",
        permission: "pages.view",
        children: [
          { label: "All Posts", key: "blog-post-list", href: "/blog/post-list" },
          { label: "Create Post", key: "blog-create-post", href: "/blog/create-post" },
          { label: "Categories", key: "blog-categories", href: "/blog/categories" },
        ],
      },
      {
        label: "Themes",
        icon: <ThemeIcon />,
        key: "themes",
        href: "/themes",
        permission: "pages.view", // Reusing pages.view for now or we can add a new one
      },
      {
        label: "Media",
        icon: <MediaIcon />,
        key: "media",
        href: "/media",
        permission: "media.view",
      },
    ],
  },
  {
    section: "Settings",
    items: [
      {
        label: "Settings",
        icon: <SettingsIcon />,
        key: "settings",
        permission: "settings.general",
      },
    ],
  },
];

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const [openDropdowns, setOpenDropdowns] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [overlayGroup, setOverlayGroup] = React.useState<string | null>(null);
  const [overlayPosition, setOverlayPosition] = React.useState<{
    [key: string]: { top: number; height: number };
  }>({});
  const hideOverlayWithDelay = React.useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((state) => state.auth);

  // Auto-refresh admin data to keep permissions in sync
  useEffect(() => {
    if (!admin) return;

    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1"
          }/admin/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const adminData = data.admin || data.data || data;
          if (adminData) {
            // Update Redux store with fresh data
            dispatch(updateAdmin(adminData));
          }
        }
      } catch (error) {
        console.error("Failed to refresh admin profile:", error);
      }
    };

    // Fetch immediately on mount
    fetchAdminProfile();

    // Then poll every 30 seconds
    const intervalId = setInterval(fetchAdminProfile, 30000);

    return () => clearInterval(intervalId);
  }, [dispatch, admin?.role]); // Re-run if role changes, but mostly run on mount

  // Ensure permissions is at least an empty array to prevent issues
  useEffect(() => {
    if (admin && admin.role !== "admin" && !admin.permissions) {
      // Don't logout, just treat as empty and let the profile fetcher try to update it
      console.warn("Admin permissions missing in state.");
    }
  }, [admin]);



  const handleDropdown = (key: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
    if (collapsed) setOverlayGroup((prev) => (prev === key ? null : key));
  };

  const handleMouseEnterButton = (
    key: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (hideOverlayWithDelay.current)
      clearTimeout(hideOverlayWithDelay.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setOverlayPosition((prev) => ({
      ...prev,
      [key]: { top: rect.top, height: rect.height },
    }));
    setOverlayGroup(key);
  };

  const handleMouseLeaveOverlay = (key: string) => {
    hideOverlayWithDelay.current = setTimeout(() => {
      setOverlayGroup(null);
    }, 150); // small delay to prevent flicker
  };

  const handleMouseEnterOverlay = (key: string) => {
    if (hideOverlayWithDelay.current)
      clearTimeout(hideOverlayWithDelay.current);
    setOverlayGroup(key);
  };



  // Close overlay on click outside
  React.useEffect(() => {
    if (!collapsed || !overlayGroup) return;
    const handleClick = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (sidebar && !sidebar.contains(e.target as Node)) {
        setOverlayGroup(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [collapsed, overlayGroup]);

  // Permission check helper
  const hasPermission = (item: any) => {
    // Full admin has all permissions
    if (admin?.role === "admin") return true;

    // Settings is always visible
    if (item.key === "settings") {
      return true;
    }

    // If item has no permission key, it's public (or common)
    if (!item.permission) return true;

    // Check if admin has the required permission
    const permissions = admin?.permissions || [];
    if (permissions.includes('*')) return true;

    // If it's a .view permission (like most sidebar items), 
    // grant access if they have .view OR .edit OR .manage OR .create for that base module
    if (item.permission.endsWith('.view')) {
      const base = item.permission.split('.')[0];
      return permissions.some(p =>
        p === item.permission ||
        p === `${base}.edit` ||
        p === `${base}.manage` ||
        p.startsWith(`${base}.`) // Any permission in this module
      );
    }

    return permissions.includes(item.permission);
  };

  // Zoho-like colors & Dimensions
  const bgColor = "bg-white";
  const borderColor = "border-gray-100";
  const textColor = "text-slate-600";
  const hoverBgColor = "hover:bg-slate-200";
  const activeBgColor = "bg-[#408dfb]"; // Solid Blue
  const expandedBgColor = "bg-blue-50"; // Light blue for expanded parent
  const expandedBorderColor = "border-blue-500"; // Blue border for expanded parent

  return (
    <aside
      id="sidebar"
      className={`fixed left-0 top-0 h-screen z-50 ${bgColor} border-r ${borderColor} flex flex-col overflow-visible transition-all duration-300 ease-in-out font-sans ${collapsed ? "w-16" : "w-52 2xl:w-60"
        }`}
    >
      {/* Sidebar Header */}
      <div
        className={`relative z-20 flex items-center justify-between px-4 h-[60px] 2xl:h-[72px] border-b ${borderColor} ${collapsed ? "justify-center px-0" : ""
          }`}
      >
        <div
          className={`flex items-center gap-3 ${collapsed ? "cursor-pointer" : ""
            }`}
          onClick={() => collapsed && setCollapsed(false)}
        >
          {!collapsed ? (
            <>
              <div className="relative w-32 h-10 flex items-center">
                <span className="text-xl font-bold text-[#408dfb] truncate">
                  Satlaa
                </span>
              </div>
            </>
          ) : (
            <div className="relative group">
              <span className="w-8 h-8 rounded-lg bg-[#408dfb]  text-white flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-105 transition-transform">
                S
              </span>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1">
            <button
              className={`p-1.5 rounded-lg hover:bg-slate-200 transition-all duration-200 group cursor-pointer`}
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Collapse sidebar"
              type="button"
            >
              <IndentDecrease size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Menu */}
      <nav className="flex-1 flex flex-col gap-0.5 py-2 relative overflow-y-auto no-scrollbar">
        {menu.map((section, idx) => (
          <div key={idx} className="mb-1 relative px-2">
            {section.section &&
              !collapsed &&
              section.items.some((item) => hasPermission(item)) && (
                <div className="uppercase text-[9px] 2xl:text-[10px] font-bold text-slate-400 px-2 py-1.5 2xl:py-2 tracking-widest mt-1 2xl:mt-2">
                  {section.section}
                </div>
              )}
            <ul>
              {section.items
                .filter((item) => hasPermission(item))
                .map((item) =>
                  "children" in item && item.children ? (
                    <li key={item.key} className="relative group mb-0.5 2xl:mb-1">
                      {/* Parent Item */}
                      <button
                        className={`flex items-center w-full px-2 py-1 2xl:py-1.5 rounded-lg transition-all duration-200 cursor-pointer group relative border ${openDropdowns[item.key] && !collapsed
                          ? `bg-transparent border-transparent text-slate-800 hover:bg-slate-100`
                          : `border-transparent ${textColor} hover:bg-slate-100 hover:text-slate-800`
                          } ${collapsed ? "justify-center" : ""}`}
                        onClick={() => handleDropdown(item.key)}
                        onMouseEnter={(e) =>
                          collapsed && handleMouseEnterButton(item.key, e)
                        }
                        onMouseLeave={() =>
                          collapsed && handleMouseLeaveOverlay(item.key)
                        }
                      >
                        {/* Chevron on LEFT */}
                        {!collapsed && (
                          <span
                            className={`mr-1 transition-transform duration-200 text-slate-400 ${openDropdowns[item.key]
                              ? "rotate-0"
                              : "-rotate-90"
                              }`}
                          >
                            <ArrowDownIcon sx={{ fontSize: 16 }} />
                          </span>
                        )}

                        <span
                          className={`flex-shrink-0 transition-transform duration-200 ${collapsed ? "mr-0" : "mr-2.5 2xl:mr-3"
                            } ${openDropdowns[item.key]
                              ? "text-slate-700"
                              : "text-slate-500"
                            }`}
                        >
                          {React.cloneElement(item.icon as any, {
                            sx: { fontSize: { xs: 17, '2xl': 18 } },
                          })}
                        </span>
                        <span
                          className={`text-left text-[13px] 2xl:text-[14px] font-normal transition-all duration-200 ${collapsed
                            ? "opacity-0 w-0 overflow-hidden"
                            : "flex-1 opacity-100 w-auto"
                            }`}
                        >
                          {item.label}
                        </span>

                        {!collapsed && openDropdowns[item.key] && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#408dfb] flex-shrink-0" />
                        )}
                      </button>

                      {/* Expanded Submenu */}
                      <ul
                        className={`transition-all duration-300 overflow-hidden ${openDropdowns[item.key] && !collapsed
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                          }`}
                      >
                        {item.children.map((child: any, childIdx) => (
                          <li key={child.key} className="relative mt-0.5">
                            <Link
                              href={child.href || `/${item.key}/${child.key}`}
                            >
                              <button
                                className={`w-full text-left pl-10 pr-3 py-1 2xl:py-1.5 rounded-lg text-[12px] 2xl:text-[13px] transition-all duration-200 flex items-center gap-2 group cursor-pointer ${pathname ===
                                  (child.href || `/${item.key}/${child.key}`)
                                  ? `${activeBgColor} text-white font-medium shadow-sm`
                                  : `${textColor} hover:text-slate-900 hover:bg-slate-100`
                                  }`}
                              >
                                {child.label}
                              </button>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      {/* Collapsed Overlay */}
                      {collapsed && overlayGroup === item.key && (
                        <div
                          className={`fixed min-w-[200px] max-h-[80vh] overflow-auto ${bgColor} shadow-xl border ${borderColor} z-50 flex flex-col transition-all duration-200 ease-in-out rounded-r-xl`}
                          style={{
                            top: overlayPosition[item.key]?.top ?? 0,
                            left: 64,
                            opacity: overlayGroup === item.key ? 1 : 0,
                          }}
                          role="menu"
                          onMouseEnter={() => handleMouseEnterOverlay(item.key)}
                          onMouseLeave={() => handleMouseLeaveOverlay(item.key)}
                        >
                          <div
                            className={`font-bold text-[11px] px-4 py-3 border-b ${borderColor} text-slate-500 uppercase tracking-wider bg-slate-50`}
                          >
                            {item.label}
                          </div>
                          <ul className="p-1">
                            {item.children.map((child: any) => (
                              <li key={child.key}>
                                <Link
                                  href={
                                    child.href || `/${item.key}/${child.key}`
                                  }
                                >
                                  <button
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[12px] transition-all duration-200 flex items-center gap-2 group cursor-pointer ${pathname ===
                                      (child.href ||
                                        `/${item.key}/${child.key}`)
                                      ? "bg-[#408dfb] text-white font-medium"
                                      : `${textColor} hover:bg-slate-100 hover:text-slate-800`
                                      }`}
                                    role="menuitem"
                                    onClick={() => setOverlayGroup(null)}
                                  >
                                    {child.label}
                                  </button>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ) : (
                    <li key={item.key} className="mb-0.5 2xl:mb-1">
                      <Link href={`/${item.key}`}>
                        <button
                          className={`flex items-center w-full px-2 py-1 2xl:py-1.5 rounded-lg transition-all duration-200 cursor-pointer group relative ${pathname.startsWith(`/${item.key}`)
                            ? `${activeBgColor} text-white shadow-sm`
                            : `${textColor} hover:bg-slate-100 hover:text-slate-800`
                            } ${collapsed ? "justify-center" : ""}`}
                        >
                          {/* Spacer for alignment if needed, or just icon */}
                          {!collapsed && <span className="w-5 mr-1"></span>}

                          <span
                            className={`flex-shrink-0 transition-transform duration-200 ${collapsed ? "mr-0" : "mr-2.5 2xl:mr-3"
                              } ${pathname.startsWith(`/${item.key}`)
                                ? "scale-105"
                                : "group-hover:scale-105"
                              }`}
                          >
                            {React.cloneElement(item.icon as any, {
                              sx: { fontSize: { xs: 17, '2xl': 18 } },
                            })}
                          </span>
                          <span
                            className={`text-left text-[13px] 2xl:text-[14px] font-normal transition-all duration-200 ${collapsed
                              ? "opacity-0 w-0 overflow-hidden"
                              : "flex-1 opacity-100 w-auto"
                              }`}
                          >
                            {item.label}
                          </span>
                        </button>
                      </Link>
                    </li>
                  )
                )}
            </ul>
          </div>
        ))}
      </nav>



      {/* Sidebar Footer / Collapse Button */}
      {collapsed && (
        <div className={`p-2 border-t ${borderColor} flex justify-center`}>
          <button
            className={`p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all duration-00 group cursor-pointer`}
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            type="button"
          >
            <ArrowRightIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
