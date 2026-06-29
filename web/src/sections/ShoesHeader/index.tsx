"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { usePreview } from "@/contexts/PreviewContext";
import { 
  User, 
  Heart, 
  ShoppingBag, 
  Search, 
  ChevronDown, 
  Menu, 
  X,
  Facebook,
  Instagram,
  Youtube,
  Chrome
} from "lucide-react";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import { motion, AnimatePresence } from "motion/react";

interface DropdownItem {
  name: string;
  link: string;
}

interface MenuItem {
  name: string;
  link: string;
  dropdown?: DropdownItem[];
}

interface ShoesHeaderProps {
  data?: {
    logoText?: string;
    logoImage?: string;
    navMenu?: MenuItem[];
    profileLink?: string;
    favoritesLink?: string;
    showProfileIcon?: boolean;
    profileIconOrder?: number;
    showFavoritesIcon?: boolean;
    favoritesIconOrder?: number;
    showCartIcon?: boolean;
    cartIconOrder?: number;
    showSocialBar?: boolean;
    socialBarText?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      youtube?: string;
      website?: string;
    };
  };
  sectionIndex?: number;
}

export default function ShoesHeader({ data, sectionIndex }: ShoesHeaderProps) {
  const router = useRouter();
  const { itemCount, total } = useCart();
  const { isAuthenticated } = useAuth();
  const { isPreview } = usePreview();

  const logoText = data?.logoText ?? "MATE";
  const logoImage = data?.logoImage ?? "";
  
  const showProfileIcon = data?.showProfileIcon ?? true;
  const profileIconOrder = data?.profileIconOrder ?? 1;

  const showFavoritesIcon = data?.showFavoritesIcon ?? true;
  const favoritesIconOrder = data?.favoritesIconOrder ?? 2;

  const showCartIcon = data?.showCartIcon ?? true;
  const cartIconOrder = data?.cartIconOrder ?? 3;

  const showSocialBar = data?.showSocialBar ?? true;
  const socialBarText = data?.socialBarText ?? "FOLLOW US";

  const navMenu = data?.navMenu ?? [
    { name: "HOME", link: "/" },
    { name: "SHOP", link: "/shop" },
    { name: "PRODUCT", link: "/products" },
    {
      name: "PAGES",
      link: "#",
      dropdown: [
        { name: "About Us", link: "/pages/about" },
        { name: "FAQ", link: "/pages/faq" },
        { name: "Contact Us", link: "/pages/contact" }
      ]
    },
    { name: "BLOG", link: "/blog" }
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className={`w-full bg-white z-50 transition-all duration-300 ${isSticky ? "fixed top-0 left-0 right-0 shadow-md py-2" : "relative border-b border-slate-100 py-4"}`}>
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          
          {/* 1. Left Column: Navigation Menus */}
          <nav className="hidden lg:flex items-center gap-6 shrink-0">
            {navMenu.map((menu, i) => (
              <div key={i} className="relative group py-2">
                {menu.dropdown && menu.dropdown.length > 0 ? (
                  <button className="flex items-center gap-1 text-[13px] font-extrabold tracking-widest text-slate-800 hover:text-[#55eb0c] transition-colors uppercase cursor-pointer">
                    <span>{menu.name}</span>
                    <ChevronDown size={12} className="text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                ) : (
                  <Link 
                    href={menu.link}
                    className="block text-[13px] font-extrabold tracking-widest text-slate-800 hover:text-[#55eb0c] transition-colors uppercase"
                  >
                    {menu.name}
                  </Link>
                )}

                {/* Dropdown Menu */}
                {menu.dropdown && menu.dropdown.length > 0 && (
                  <div className="absolute left-0 top-full hidden group-hover:block w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                    {menu.dropdown.map((item, j) => (
                      <Link
                        key={j}
                        href={item.link}
                        className="block px-4 py-2 text-xs font-semibold text-slate-660 hover:bg-slate-50 hover:text-[#55eb0c] transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* 2. Middle Column: Typographic Center Logo */}
          <div className="flex items-center justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2 shrink-0">
            <Link href="/" className="group">
              {logoImage ? (
                <InlineImageEditable
                  src={logoImage}
                  alt={logoText}
                  width={150}
                  height={40}
                  fieldPath="logoImage"
                  sectionIndex={sectionIndex}
                  className="max-h-8 md:max-h-10 object-contain"
                />
              ) : (
                <span className="text-3xl font-black text-black tracking-[0.2em] leading-none font-sans group-hover:text-[#55eb0c] transition-colors duration-300">
                  <InlineEditable tag="span" value={logoText || ""} fieldPath="logoText" sectionIndex={sectionIndex} />
                </span>
              )}
            </Link>
          </div>

          {/* 3. Right Column: Rounded Search Pill + Icons */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Search Pill */}
            <form 
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center bg-[#f2f5fa] rounded-[30px] px-3 py-1.5 border border-slate-100 max-w-[200px] lg:max-w-[240px]"
            >
              <Search size={14} className="text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-[#222222] placeholder-slate-400 font-semibold focus:outline-none"
              />
            </form>

            {/* Profile */}
            {showProfileIcon && (
              <Link 
                href={data?.profileLink ?? (isAuthenticated ? "/profile" : "/auth/login")}
                style={{ order: profileIconOrder }}
                className="w-9 h-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-700 hover:text-[#55eb0c] transition-colors relative border border-slate-100"
              >
                <User size={16} />
              </Link>
            )}

            {/* Wishlist Icon */}
            {showFavoritesIcon && (
              <Link 
                href={data?.favoritesLink ?? "/profile"}
                style={{ order: favoritesIconOrder }}
                className="w-9 h-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-700 hover:text-[#55eb0c] transition-colors relative border border-slate-100"
              >
                <Heart size={16} />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#55eb0c] text-black text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                  0
                </span>
              </Link>
            )}

            {/* Cart Dropdown wrapper */}
            {showCartIcon && (
              <Link
                href="/cart"
                style={{ order: cartIconOrder }}
                className="flex items-center gap-2 cursor-pointer group decoration-0"
              >
                <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 group-hover:text-black group-hover:bg-slate-100 transition-colors relative border border-slate-100">
                  <ShoppingBag size={16} />
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#55eb0c] text-black text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                    {itemCount}
                  </span>
                </div>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:text-[#55eb0c] border border-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation sheet */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-slate-50 border-t border-slate-100 overflow-hidden"
            >
              {/* Mobile Search block */}
              <div className="p-4 border-b border-slate-200/50">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#55eb0c]"
                  />
                  <button
                    type="submit"
                    className="bg-[#55eb0c] text-black p-2.5 rounded-xl flex items-center justify-center shrink-0"
                  >
                    <Search size={16} />
                  </button>
                </form>
              </div>

              <nav className="p-4 flex flex-col space-y-1">
                {navMenu.map((menu, i) => (
                  <div key={i} className="flex flex-col">
                    {menu.dropdown && menu.dropdown.length > 0 ? (
                      <>
                        <button
                          onClick={() => setActiveMobileDropdown(activeMobileDropdown === menu.name ? null : menu.name)}
                          className="flex items-center justify-between py-3 text-sm font-bold text-slate-700 border-b border-slate-200/30 uppercase"
                        >
                          <span>{menu.name}</span>
                          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${activeMobileDropdown === menu.name ? "rotate-180" : ""}`} />
                        </button>
                        
                        {activeMobileDropdown === menu.name && (
                          <div className="bg-white/80 rounded-xl pl-4 py-2 space-y-2 mt-1">
                            {menu.dropdown.map((item, j) => (
                              <Link
                                key={j}
                                href={item.link}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-2 text-xs font-semibold text-slate-600 hover:text-[#55eb0c]"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={menu.link}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-3 text-sm font-bold text-slate-700 border-b border-slate-200/30 uppercase"
                      >
                        {menu.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Sticky Right-Side Vertical Floating Social Bar */}
      {showSocialBar && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-5 py-5 px-3 bg-black text-white rounded-l-2xl shadow-xl border-l border-y border-white/10">
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-white/40 -rotate-90 origin-center mb-8 shrink-0 select-none whitespace-nowrap">
            <InlineEditable tag="span" value={socialBarText || ""} fieldPath="socialBarText" sectionIndex={sectionIndex} />
          </span>
          <a href={data?.socialLinks?.facebook ?? "#"} className="text-white hover:text-[#55eb0c] transition-colors duration-300">
            <Facebook size={15} />
          </a>
          <a href={data?.socialLinks?.instagram ?? "#"} className="text-white hover:text-[#55eb0c] transition-colors duration-300">
            <Instagram size={15} />
          </a>
          <a href={data?.socialLinks?.youtube ?? "#"} className="text-white hover:text-[#55eb0c] transition-colors duration-300">
            <Youtube size={15} />
          </a>
          <a href={data?.socialLinks?.website ?? "#"} className="text-white hover:text-[#55eb0c] transition-colors duration-300">
            <Chrome size={15} />
          </a>
        </div>
      )}
    </>
  );
}
