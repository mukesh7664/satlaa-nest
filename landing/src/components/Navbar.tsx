"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    ChevronDown,
    Globe,
    Menu,
    X,
    ShoppingCart,
    Layout,
    Zap,
    Boxes,
    Milestone,
    History,
    BookOpen,
    MessageSquare,
    Users,
    Target,
    Newspaper,
    LifeBuoy,
    Handshake,
    ArrowRight
} from "lucide-react";

type NavLink = {
    name: string;
    href: string;
    hasDropdown: boolean;
};

const productContent = [
    { title: "E-commerce Platform", desc: "Launch and manage multi-store empires with ease.", icon: <ShoppingCart className="w-5 h-5 text-indigo-600" />, href: "#ecommerce" },
    { title: "Page Builder", desc: "Drag-and-drop builder for stunning storefronts.", icon: <Layout className="w-5 h-5 text-violet-600" />, href: "#builder" },
    { title: "Integrations", desc: "Connect with Stripe, Razorpay, and top tools.", icon: <Zap className="w-5 h-5 text-amber-500" />, href: "#integrations" },
    { title: "Advanced Features", desc: "Explore the full suite of e-commerce tools.", icon: <Boxes className="w-5 h-5 text-emerald-500" />, href: "#features" },
    { title: "Product Roadmap", desc: "See what's coming next for EPxWEB.", icon: <Milestone className="w-5 h-5 text-blue-500" />, href: "#roadmap" },
    { title: "Changelog", desc: "Stay updated with our latest releases.", icon: <History className="w-5 h-5 text-gray-500" />, href: "#changelog" },
];

const useCasesContent = {
    categories: [
        { name: "Fashion & Apparel", href: "#fashion" },
        { name: "Electronics & Gadgets", href: "#electronics" },
        { name: "Home & Living", href: "#home" },
        { name: "SaaS & Software", href: "#saas" },
        { name: "Digital Agencies", href: "#agencies" },
        { name: "Personal Portfolios", href: "#portfolios" },
    ],
    roles: [
        { name: "Business Owners", href: "#owners" },
        { name: "Web Developers", href: "#developers" },
        { name: "UI/UX Designers", href: "#designers" },
        { name: "Growth Marketers", href: "#marketers" },
    ]
};

const resourcesContent = [
    { title: "Docs", desc: "API documentation and SDKs.", icon: <BookOpen className="w-5 h-5 text-orange-500" />, href: "/docs" },
    { title: "Help Center", desc: "Comprehensive guides and FAQs.", icon: <LifeBuoy className="w-5 h-5 text-rose-500" />, href: "#help" },
    { title: "Industry Blog", desc: "Insights and success stories.", icon: <Newspaper className="w-5 h-5 text-sky-500" />, href: "#blog" },
    { title: "Discord Community", desc: "Join 10k+ builders on Discord.", icon: <MessageSquare className="w-5 h-5 text-indigo-500" />, href: "#discord" },
    { title: "Hire a Partner", desc: "Find experts to build your store.", icon: <Handshake className="w-5 h-5 text-teal-500" />, href: "#partners" },
];

export default function Navbar() {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mobileActiveDropdown, setMobileActiveDropdown] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleMouseEnter = (name: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveDropdown(name);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 150);
    };

    const toggleMobileDropdown = (name: string) => {
        setMobileActiveDropdown(mobileActiveDropdown === name ? null : name);
    };

    const navLinks: NavLink[] = [
        { name: "Product", href: "#features", hasDropdown: true },
        { name: "Use Cases", href: "#", hasDropdown: true },
        { name: "Resources", href: "#", hasDropdown: true },
        { name: "Pricing", href: "/pricing", hasDropdown: false },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2 md:py-6 flex justify-center pointer-events-none transition-all duration-300">
            <div
                className={`w-full max-w-[1400px] bg-white border border-[#E6E6E6] rounded-[100px] flex items-center justify-between px-4 md:px-6 py-1.5 md:py-2.5 transition-all duration-300 pointer-events-auto relative ${scrolled ? "shadow-md" : "shadow-sm"
                    }`}
                onMouseLeave={handleMouseLeave}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 shrink-0">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">E</span>
                    </div>
                    <span className="text-xl font-bold text-black tracking-tight">
                        EPxWEB
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center space-x-1">
                    {navLinks.map((link) => (
                        <div
                            key={link.name}
                            className="relative"
                            onMouseEnter={() => link.hasDropdown && handleMouseEnter(link.name)}
                        >
                            <Link
                                href={link.href}
                                className={`flex items-center space-x-1 px-4 py-2 text-[15px] font-medium transition-colors ${activeDropdown === link.name ? "text-indigo-600" : "text-black hover:text-indigo-600"
                                    }`}
                            >
                                <span>{link.name}</span>
                                {link.hasDropdown && (
                                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === link.name ? "rotate-180" : "opacity-50"
                                        }`} />
                                )}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-4 shrink-0">
                    <button className="hidden sm:flex items-center text-black opacity-60 hover:opacity-100 transition-opacity">
                        <Globe className="w-5 h-5" />
                    </button>

                    <Link
                        href={`${adminUrl}/login`}
                        className="hidden md:block text-[15px] font-medium text-black hover:text-indigo-600 transition-colors px-2"
                    >
                        Login
                    </Link>

                    <Link
                        href={`${adminUrl}/register`}
                        className="bg-[#EBFFB1] border border-[#ADE900] text-black px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold text-[14px] md:text-[15px] hover:bg-[#deff8f] transition-all whitespace-nowrap"
                    >
                        <span className="sm:hidden">Build</span>
                        <span className="hidden sm:inline">Start Building</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 text-black"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mega Menu Dropdowns */}
                {activeDropdown && (
                    <div
                        className="absolute top-[110%] left-0 right-0 bg-white border border-[#E6E6E6] rounded-[32px] shadow-2xl overflow-hidden p-8 animate-in fade-in slide-in-from-top-4 duration-200"
                        onMouseEnter={() => handleMouseEnter(activeDropdown)}
                    >
                        {activeDropdown === "Product" && (
                            <div className="grid grid-cols-3 gap-8">
                                {productContent.map((item) => (
                                    <Link key={item.title} href={item.href} className="group flex items-start space-x-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <div className="mt-1 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-black mb-1 flex items-center group-hover:text-indigo-600 transition-colors">
                                                {item.title}
                                                <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                            </div>
                                            <div className="text-[13px] text-gray-500 leading-snug">{item.desc}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {activeDropdown === "Use Cases" && (
                            <div className="flex">
                                <div className="w-1/2 pr-8 border-r border-gray-100">
                                    <div className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-6 px-3">Category</div>
                                    <div className="grid grid-cols-2 gap-y-1">
                                        {useCasesContent.categories.map((cat) => (
                                            <Link key={cat.name} href={cat.href} className="px-3 py-2 text-[15px] text-black hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-all">
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                    <Link href="#" className="mt-6 flex items-center space-x-2 px-3 py-2 text-indigo-600 font-semibold text-[15px] hover:translate-x-1 transition-transform">
                                        <span>See all categories</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="w-1/2 pl-8">
                                    <div className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-6 px-3">Roles</div>
                                    <div className="grid grid-cols-1 gap-y-1">
                                        {useCasesContent.roles.map((role) => (
                                            <Link key={role.name} href={role.href} className="px-3 py-2 text-[15px] text-black hover:text-indigo-600 hover:bg-gray-50 rounded-xl transition-all">
                                                {role.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeDropdown === "Resources" && (
                            <div className="grid grid-cols-3 gap-6">
                                {resourcesContent.map((item) => (
                                    <Link key={item.title} href={item.href} className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <div className="mt-0.5">{item.icon}</div>
                                        <div>
                                            <div className="font-semibold text-black mb-1 group-hover:text-indigo-600 transition-colors">{item.title}</div>
                                            <div className="text-[13px] text-gray-500 leading-normal">{item.desc}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Dropdown Menu */}
            <div className={`absolute top-20 left-4 right-4 bg-white border border-[#E6E6E6] rounded-3xl shadow-xl p-4 lg:hidden pointer-events-auto transition-all duration-300 ${isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                <div className="flex flex-col space-y-1 max-h-[70vh] overflow-y-auto">
                    {navLinks.map((link) => (
                        <div key={link.name} className="flex flex-col">
                            {link.hasDropdown ? (
                                <button
                                    onClick={() => toggleMobileDropdown(link.name)}
                                    className="flex items-center justify-between px-4 py-3 text-lg font-medium text-black"
                                >
                                    <span>{link.name}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileActiveDropdown === link.name ? "rotate-180" : "opacity-50"}`} />
                                </button>
                            ) : (
                                <Link
                                    href={link.href}
                                    className="px-4 py-3 text-lg font-medium text-black"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            )}

                            {link.hasDropdown && mobileActiveDropdown === link.name && (
                                <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    {link.name === "Product" && productContent.map((item) => (
                                        <Link key={item.title} href={item.href} onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center scale-90">{item.icon}</div>
                                            <div className="text-sm font-medium text-gray-700">{item.title}</div>
                                        </Link>
                                    ))}
                                    {link.name === "Use Cases" && (
                                        <div className="grid grid-cols-1 gap-2">
                                            {useCasesContent.categories.slice(0, 4).map((cat) => (
                                                <Link key={cat.name} href={cat.href} onClick={() => setIsMenuOpen(false)} className="text-sm text-gray-600 py-1">{cat.name}</Link>
                                            ))}
                                            <Link href="#" className="text-sm text-indigo-600 font-semibold py-1">See all</Link>
                                        </div>
                                    )}
                                    {link.name === "Resources" && resourcesContent.map((item) => (
                                        <Link key={item.title} href={item.href} onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3">
                                            <div className="scale-75">{item.icon}</div>
                                            <div className="text-sm font-medium text-gray-700">{item.title}</div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <Link
                        href={`${adminUrl}/login`}
                        className="px-4 py-3 text-lg font-medium text-black border-t border-gray-50 mt-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Login
                    </Link>
                </div>
            </div>
        </header>
    );
}
