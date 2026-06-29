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
  GitCompare, 
  ShoppingBag, 
  Search, 
  ChevronDown, 
  Menu, 
  X,
  Truck,
  MapPin,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface DropdownItem {
  name: string;
  link: string;
}

interface MenuItem {
  name: string;
  link: string;
  dropdown?: DropdownItem[];
}

interface DentalHeaderProps {
  data?: {
    logoText?: string;
    logoSubtext?: string;
    logoImage?: string;
    navMenu?: MenuItem[];
    showFreeShipping?: boolean;
    freeShippingText?: string;
    freeShippingLink?: string;
    showTrackOrder?: boolean;
    trackOrderText?: string;
    trackOrderLink?: string;
    showNewsletter?: boolean;
    newsletterText?: string;
    newsletterLink?: string;
    searchCategories?: string[];
    profileLink?: string;
    compareLink?: string;
    favoritesLink?: string;
    showProfileIcon?: boolean;
    profileIconOrder?: number;
    showCompareIcon?: boolean;
    compareIconOrder?: number;
    showFavoritesIcon?: boolean;
    favoritesIconOrder?: number;
    showCartIcon?: boolean;
    cartIconOrder?: number;
  };
}

export default function DentalHeader({ data, sectionIndex }: DentalHeaderProps & { sectionIndex?: number }) {
  const router = useRouter();
  const { itemCount, total, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isPreview } = usePreview();

  const logoText = data?.logoText ?? "STEPDENT";
  const logoSubtext = data?.logoSubtext ?? "CLINIC & SUPPLIES";
  const logoImage = data?.logoImage ?? "";
  
  const showFreeShipping = data?.showFreeShipping ?? true;
  const freeShippingText = data?.freeShippingText ?? "FREE SHIPPING";
  const freeShippingLink = data?.freeShippingLink ?? "#";

  const showTrackOrder = data?.showTrackOrder ?? true;
  const trackOrderText = data?.trackOrderText ?? "TRACK ORDER";
  const trackOrderLink = data?.trackOrderLink ?? "/profile";

  const showNewsletter = data?.showNewsletter ?? true;
  const newsletterText = data?.newsletterText ?? "NEWSLETTER";
  const newsletterLink = data?.newsletterLink ?? "#";

  const showProfileIcon = data?.showProfileIcon ?? true;
  const profileIconOrder = data?.profileIconOrder ?? 1;

  const showCompareIcon = data?.showCompareIcon ?? true;
  const compareIconOrder = data?.compareIconOrder ?? 2;

  const showFavoritesIcon = data?.showFavoritesIcon ?? true;
  const favoritesIconOrder = data?.favoritesIconOrder ?? 3;

  const showCartIcon = data?.showCartIcon ?? true;
  const cartIconOrder = data?.cartIconOrder ?? 4;

  const searchCategories = data?.searchCategories ?? ["All Categories", "Chairs", "Handpieces", "Imaging", "Instruments", "Consumables"];

  const navMenu = data?.navMenu ?? [
    {
      name: "HOME",
      link: "/",
      dropdown: [
        { name: "Dental Supplies", link: "/shop?category=supplies" },
        { name: "Surgical Equipment", link: "/shop?category=equipment" }
      ]
    },
    {
      name: "PAGES",
      link: "#",
      dropdown: [
        { name: "About Us", link: "/pages/about" },
        { name: "Clinical Reviews", link: "/pages/reviews" },
        { name: "Contact Us", link: "/pages/contact" }
      ]
    },
    { name: "DENTAL TOOLS", link: "/shop?category=tools" },
    {
      name: "CLINIC NEWS",
      link: "#",
      dropdown: [
        { name: "New Dental Tech", link: "/blog" },
        { name: "Maintenance Guides", link: "/blog" }
      ]
    },
    { name: "CONTACT", link: "/pages/contact" }
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
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
      let queryStr = `search=${encodeURIComponent(searchQuery.trim())}`;
      if (selectedCategory && selectedCategory !== "All Categories") {
        queryStr += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      router.push(`/products?${queryStr}`);
    }
  };

  const toggleMobileDropdown = (name: string) => {
    setActiveMobileDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <header className="w-full bg-white font-sans border-b border-slate-100 z-50">
      
      {/* 1. Main Header Top Row */}
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-6 shrink-0 h-12">
          <Link href="/" className="flex items-center gap-3 group">
            {logoImage ? (
              <InlineImageEditable 
                src={logoImage} 
                alt={logoText} 
                width={150}
                height={40}
                fieldPath="logoImage"
                sectionIndex={sectionIndex}
                className="h-10 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="w-full h-full text-[#4c80fa] group-hover:scale-105 transition-transform duration-300"
                  stroke="currentColor" 
                  strokeWidth="1.5"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  <path d="M12 9v6M9 12h6" className="stroke-[2px]" />
                </svg>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#222222] tracking-wider leading-none font-sans group-hover:text-[#4c80fa] transition-colors">
                <InlineEditable tag="span" value={logoText} fieldPath="logoText" sectionIndex={sectionIndex} />
              </span>
              {logoSubtext && (
                <span className="text-[8px] font-extrabold tracking-[0.3em] text-[#4c80fa] mt-1 uppercase">
                  <InlineEditable tag="span" value={logoSubtext} fieldPath="logoSubtext" sectionIndex={sectionIndex} />
                </span>
              )}
            </div>
          </Link>

          {/* Left Vertical Divider line */}
          <div className="hidden lg:block w-[1px] h-8 bg-slate-200" />
        </div>

        {/* Middle: Search Pill */}
        <form 
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-2xl items-center bg-[#f2f5fa] rounded-[30px] p-1.5 border border-slate-100 relative"
        >
          <div className="flex items-center gap-2 px-4 flex-1">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search Anything You Want..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[#222222] placeholder-slate-400 font-semibold focus:outline-none"
            />
          </div>
          
          <div className="w-[1px] h-6 bg-slate-300" />

          {/* Dynamic Categories Dropdown inside Search Bar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-[#4c80fa] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{selectedCategory}</span>
              <ChevronDown size={12} className={`transition-transform duration-300 ${showCategoryDropdown ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 text-slate-700"
                >
                  {searchCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 hover:text-[#4c80fa] transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Blue Pill Search Action Button */}
          <button
            type="submit"
            className="bg-[#4c80fa] hover:bg-blue-600 text-white font-bold text-xs tracking-wider uppercase px-8 py-3 rounded-[30px] shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Right Side: utility icons */}
        <div className="flex items-center gap-4 lg:gap-6">
          
          {/* User Profile */}
          {showProfileIcon && (
            <Link 
              href={data?.profileLink ?? (isAuthenticated ? "/profile" : "/auth/login")}
              style={{ order: profileIconOrder }}
              className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-700 hover:text-[#4c80fa] transition-colors relative border border-slate-100"
            >
              <User size={18} />
            </Link>
          )}

          {/* Compare scale icon */}
          {showCompareIcon && (
            <Link 
              href={data?.compareLink ?? "/shop"}
              style={{ order: compareIconOrder }}
              className="hidden sm:flex w-10 h-10 rounded-full hover:bg-slate-50 items-center justify-center text-slate-700 hover:text-[#4c80fa] transition-colors relative border border-slate-100"
            >
              <GitCompare size={18} />
            </Link>
          )}

          {/* Favorites Heart */}
          {showFavoritesIcon && (
            <Link 
              href={data?.favoritesLink ?? "/profile"}
              style={{ order: favoritesIconOrder }}
              className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-700 hover:text-[#4c80fa] transition-colors relative border border-slate-100"
            >
              <Heart size={18} />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#4c80fa] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                0
              </span>
            </Link>
          )}

          {/* My Cart */}
          {showCartIcon && (
            <Link
              href="/cart"
              style={{ order: cartIconOrder }}
              className="flex items-center gap-3 p-1 pl-3 md:border-l border-slate-100 text-left cursor-pointer group decoration-0"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 group-hover:text-[#4c80fa] group-hover:bg-blue-50 transition-colors relative">
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e4573d] text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                  My cart
                </span>
                <span className="text-xs font-extrabold text-[#222222] group-hover:text-[#4c80fa] transition-colors flex items-center gap-1">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  <ChevronDown size={10} className="text-slate-400" />
                </span>
              </div>
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:text-[#4c80fa] border border-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

      </div>

      {/* 2. Main Navigation Bottom Row (Desktop ONLY) */}
      <div className="hidden md:block bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* Left Side: Dynamic Navigation Links */}
          <nav className="flex items-center gap-7">
            {navMenu.map((menu, i) => (
              <div key={i} className="relative group py-4">
                {menu.dropdown && menu.dropdown.length > 0 ? (
                  <button className="flex items-center gap-1 text-[13px] font-extrabold tracking-widest text-slate-700 hover:text-[#4c80fa] transition-colors uppercase cursor-pointer">
                    <span><InlineEditable tag="span" value={menu.name || ""} fieldPath={`navMenu.${i}.name`} sectionIndex={sectionIndex} /></span>
                    <ChevronDown size={12} className="text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                ) : (
                  <Link 
                    href={menu.link || "#"}
                    className="block text-[13px] font-extrabold tracking-widest text-slate-700 hover:text-[#4c80fa] transition-colors uppercase"
                  >
                    <InlineEditable tag="span" value={menu.name || ""} fieldPath={`navMenu.${i}.name`} sectionIndex={sectionIndex} />
                  </Link>
                )}

                {/* Hover dropdown list */}
                {menu.dropdown && menu.dropdown.length > 0 && (
                  <div className="absolute left-0 top-full hidden group-hover:block w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                    {menu.dropdown.map((item, j) => (
                      <Link
                        key={j}
                        href={item.link || "#"}
                        className="block px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#4c80fa] transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side: Highlights with dynamic separators */}
          <div className="flex items-center gap-6 text-[11px] font-extrabold tracking-widest text-slate-400">
            {showFreeShipping && (
              <a href={freeShippingLink} className="flex items-center gap-1.5 hover:text-[#4c80fa] transition-colors decoration-0">
                <Truck size={12} className="text-[#4c80fa]" />
                <InlineEditable tag="span" value={freeShippingText} fieldPath="freeShippingText" sectionIndex={sectionIndex} />
              </a>
            )}
            
            {showFreeShipping && showTrackOrder && <span className="w-[1px] h-3 bg-slate-200" />}

            {showTrackOrder && (
              <Link href={trackOrderLink} className="flex items-center gap-1.5 hover:text-[#4c80fa] transition-colors">
                <MapPin size={12} className="text-[#4c80fa]" />
                <InlineEditable tag="span" value={trackOrderText} fieldPath="trackOrderText" sectionIndex={sectionIndex} />
              </Link>
            )}

            {((showFreeShipping || showTrackOrder) && showNewsletter) && <span className="w-[1px] h-3 bg-slate-200" />}

            {showNewsletter && (
              <a href={newsletterLink} className="flex items-center gap-1.5 hover:text-[#4c80fa] transition-colors decoration-0">
                <Mail size={12} className="text-[#4c80fa]" />
                <InlineEditable tag="span" value={newsletterText} fieldPath="newsletterText" sectionIndex={sectionIndex} />
              </a>
            )}
          </div>

        </div>
      </div>

      {/* 3. Mobile Navigation Sheet Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-50 border-t border-slate-100 overflow-hidden"
          >
            {/* Mobile Search block */}
            <div className="p-4 border-b border-slate-200/50">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#4c80fa]"
                />
                <button
                  type="submit"
                  className="bg-[#4c80fa] text-white p-2.5 rounded-xl flex items-center justify-center shrink-0"
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
                        onClick={() => toggleMobileDropdown(menu.name)}
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
                              href={item.link || "#"}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-2 text-xs font-semibold text-slate-600 hover:text-[#4c80fa]"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={menu.link || "#"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-3 text-sm font-bold text-slate-700 border-b border-slate-200/30 uppercase"
                    >
                      {menu.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile shortcuts */}
            <div className="p-4 bg-white border-t border-slate-200/50 flex flex-col gap-3 text-xs font-bold text-slate-500">
              {showFreeShipping && (
                <a href={freeShippingLink} className="flex items-center gap-2 decoration-0">
                  <Truck size={14} className="text-[#4c80fa]" />
                  <span>{freeShippingText}</span>
                </a>
              )}
              {showTrackOrder && (
                <Link href={trackOrderLink} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#4c80fa]" />
                  <span>{trackOrderText}</span>
                </Link>
              )}
              {showNewsletter && (
                <a href={newsletterLink} className="flex items-center gap-2 decoration-0">
                  <Mail size={14} className="text-[#4c80fa]" />
                  <span>{newsletterText}</span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
