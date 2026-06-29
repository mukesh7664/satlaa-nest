"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    CardMembership as PlansIcon,
    Store as StoreIcon,
    Category as CategoryIcon,
    ViewQuilt as SectionsIcon,
    PermMedia as MediaIcon,
    Settings as SettingsIcon,
    MonetizationOn as PaymentsIcon,
    Article as ArticleIcon,
    Palette as ThemeIcon,
    ChevronRight as ChevronRightIcon,
    ChevronLeft as ChevronLeftIcon,
    SupportAgent as SupportIcon,
    HelpCenter as HelpCenterIcon,
    LocalOffer as CouponIcon,
} from "@mui/icons-material";
import {
    IndentDecrease,
    User,
    LogOut,
    Maximize,
    Grid,
} from "lucide-react";
import Link from "next/link";

export default function SuperAdminLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { admin } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login");
    };

    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon sx={{ fontSize: 18 }} />, path: "/sa-dashboard" },
        { text: "Admins", icon: <PeopleIcon sx={{ fontSize: 18 }} />, path: "/admins" },
        { text: "Stores", icon: <StoreIcon sx={{ fontSize: 18 }} />, path: "/stores" },
        { text: "Support Tickets", icon: <SupportIcon sx={{ fontSize: 18 }} />, path: "/support-tickets" },
        { text: "Help Center CMS", icon: <HelpCenterIcon sx={{ fontSize: 18 }} />, path: "/help-center" },
        { text: "Product Categories", icon: <CategoryIcon sx={{ fontSize: 18 }} />, path: "/product-categories" },
        { text: "Documentation", icon: <ArticleIcon sx={{ fontSize: 18 }} />, path: "/documentation" },
        { text: "Section Library", icon: <SectionsIcon sx={{ fontSize: 18 }} />, path: "/sa-sections" },
        { text: "Global Media", icon: <MediaIcon sx={{ fontSize: 18 }} />, path: "/sa-media" },
        { text: "Plans", icon: <PlansIcon sx={{ fontSize: 18 }} />, path: "/plans" },
        { text: "Coupons", icon: <CouponIcon sx={{ fontSize: 18 }} />, path: "/subscription-coupons" },
        { text: "Payments", icon: <PaymentsIcon sx={{ fontSize: 18 }} />, path: "/sa-payments" },
        { text: "System Payment Config", icon: <SettingsIcon sx={{ fontSize: 18 }} />, path: "/system-payment-config" },
        { text: "Theme Management", icon: <ThemeIcon sx={{ fontSize: 18 }} />, path: "/sa-themes" },
    ];

    const bgColor = "bg-white";
    const borderColor = "border-gray-100";
    const textColor = "text-slate-600";
    const activeBgColor = "bg-[#408dfb]"; // Premium blue color

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
            {/* Collapsible Sidebar */}
            <aside
                id="sidebar"
                className={`fixed left-0 top-0 h-screen z-50 ${bgColor} border-r ${borderColor} flex flex-col overflow-visible transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-56 2xl:w-64"
                    }`}
            >
                {/* Sidebar Header */}
                <div
                    className={`relative z-20 flex items-center justify-between px-4 h-[60px] 2xl:h-[72px] border-b ${borderColor} ${collapsed ? "justify-center px-0" : ""
                        }`}
                >
                    {!collapsed ? (
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-[#408dfb] tracking-wide truncate">
                                Super Admin
                            </span>
                        </div>
                    ) : (
                        <span
                            onClick={() => setCollapsed(false)}
                            className="w-8 h-8 rounded-lg bg-[#408dfb] text-white flex items-center justify-center text-sm font-bold shadow-sm cursor-pointer hover:scale-105 transition-transform"
                        >
                            SA
                        </span>
                    )}

                    {!collapsed && (
                        <button
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-all duration-200 group cursor-pointer"
                            onClick={() => setCollapsed(true)}
                            aria-label="Collapse sidebar"
                            type="button"
                        >
                            <IndentDecrease size={18} className="text-slate-400 group-hover:text-slate-600" />
                        </button>
                    )}
                </div>

                {/* Sidebar Menu Items */}
                <nav className="flex-1 flex flex-col gap-0.5 py-3 px-2 relative overflow-y-auto no-scrollbar">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.path} className="mb-0.5 2xl:mb-1">
                                <Link href={item.path}>
                                    <button
                                        className={`flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group relative ${pathname.startsWith(item.path)
                                                ? `${activeBgColor} text-white shadow-sm`
                                                : `${textColor} hover:bg-slate-50 hover:text-slate-900`
                                            } ${collapsed ? "justify-center px-0" : ""}`}
                                    >
                                        <span
                                            className={`flex-shrink-0 transition-transform duration-200 ${collapsed ? "mr-0" : "mr-3"
                                                } ${pathname.startsWith(item.path) ? "scale-105" : "group-hover:scale-105"}`}
                                        >
                                            {item.icon}
                                        </span>
                                        <span
                                            className={`text-left text-[13px] 2xl:text-[14px] font-medium transition-all duration-200 ${collapsed
                                                    ? "opacity-0 w-0 overflow-hidden"
                                                    : "flex-1 opacity-100 w-auto"
                                                }`}
                                        >
                                            {item.text}
                                        </span>
                                    </button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Expand Button for Collapsed State */}
                {collapsed && (
                    <div className={`p-2.5 border-t ${borderColor} flex justify-center`}>
                        <button
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer"
                            onClick={() => setCollapsed(false)}
                            aria-label="Expand sidebar"
                            type="button"
                        >
                            <ChevronRightIcon sx={{ fontSize: 20 }} />
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content Area */}
            <main
                className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 relative z-0 ${collapsed ? "ml-16" : "ml-56 2xl:ml-64"
                    }`}
            >
                {/* Header (Meticulously customized for Super Admin) */}
                <header className="w-full bg-white border-b border-gray-100 h-[60px] 2xl:h-[72px] px-6 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-semibold hidden sm:inline-block">
                            Super Admin Portal
                        </span>
                        <span className="text-gray-300 hidden sm:inline-block">/</span>
                        <span className="text-xs text-slate-800 font-bold capitalize">
                            {pathname.split("/").filter(Boolean).join(" ").replace("-", " ") || "Dashboard"}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2.5 ml-4">
                        {/* Control Icons */}
                        <div className="flex items-center space-x-1.5">
                            <button className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-full bg-slate-50 flex items-center justify-center text-gray-400 hover:bg-slate-100 hover:text-gray-600 transition-colors hidden sm:flex">
                                <Maximize className="w-4.5 h-4.5" />
                            </button>
                            <button className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-full bg-slate-50 flex items-center justify-center text-gray-400 hover:bg-slate-100 hover:text-gray-600 transition-colors hidden sm:flex">
                                <Grid className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

                        {/* Profile Menu */}
                        <div className="relative" ref={profileRef}>
                            <div
                                className="flex items-center space-x-2 2xl:space-x-3 cursor-pointer hover:bg-slate-50 p-1 pr-2 2xl:pr-3 rounded-full transition-colors"
                                onClick={() => setProfileOpen(!profileOpen)}
                            >
                                <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-600 font-bold text-sm">
                                    {admin?.avatar ? (
                                        <img src={admin.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        admin?.name?.charAt(0) || "S"
                                    )}
                                </div>
                                <div className="hidden sm:block">
                                    <div className="text-[13px] 2xl:text-sm font-bold text-slate-800 leading-tight">
                                        {admin?.name || "Super Admin"}
                                    </div>
                                    <div className="text-[10px] 2xl:text-xs text-slate-400 font-medium">
                                        Super Admin
                                    </div>
                                </div>
                            </div>

                            {/* Dropdown Card */}
                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 transition-all">




                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-semibold"
                                    >
                                        <LogOut size={15} className="text-red-500" />
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Sub-Page Content Container */}
                <div className={`flex-1 overflow-y-auto ${pathname === "/sa-media" ? "" : "p-6 2xl:p-8"}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
