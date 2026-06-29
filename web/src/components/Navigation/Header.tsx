"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePreview } from "@/contexts/PreviewContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

import { MdKeyboardArrowDown } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { HiShoppingBag } from "react-icons/hi2";
import { FaUser } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaChevronDown } from "react-icons/fa";
import { FaSortDown } from "react-icons/fa6";
import DynamicMegaMenu, { MenuItem } from "./MegaMenus/DynamicMegaMenu";
import { useCart } from "@/contexts/CartContext";
import { CartSidebar } from "@/components/Cart/CartSidebar";
import { CurrencySwitcher } from "@/components/common/CurrencySwitcher";
import { PriceDisplay } from "@/components/common/PriceDisplay";

import {
  getPublicSettings,
  TopBarSettings,
  PublicSettingsResponse,
} from "@/lib/api/settings";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/Auth/AuthModal";
import { SearchLoading } from "./SearchLoading";
import { InlineEditable } from "../InlineEditable";
import { InlineImageEditable } from "../InlineImageEditable";

const HotBadge = () => (
  <span className="absolute -top-2.5 -right-3 text-[14px] leading-none  drop-shadow-sm select-none">
    🔥
  </span>
);

const ensureAbsoluteHref = (href?: string) => {
  if (!href || href === "#") return "#";
  if (href.startsWith("/") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }
  return `/${href}`;
};

interface SearchProduct {
  _id: string;
  slug: string;
  name: string;
  images?: { url: string }[];
  productInfo?: { title: string };
  brand?: { name: string };
  price?: number;
  salePrice?: number;
}

export const Header = ({ data: propData, sectionIndex }: { data?: any, sectionIndex?: number }) => {
  const router = useRouter();
  const { headerSettings, isPreview } = usePreview();
  const { itemCount, isCartOpen, openCart, closeCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false); // Removed local state
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [lastActiveMenu, setLastActiveMenu] = useState<MenuItem | null>(null);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [menuAlignment, setMenuAlignment] = useState<string>("center");
  const [dynamicMenuData, setDynamicMenuData] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [topBarSettings, setTopBarSettings] = useState<TopBarSettings | null>(
    null
  );
  const [logo, setLogo] = useState<string | null>(null);
  const [sideImage1, setSideImage1] = useState<string | null>(null);
  const [sideImage2, setSideImage2] = useState<string | null>(null);

  const [searchHighlights, setSearchHighlights] = useState<
    PublicSettingsResponse["searchHighlights"] | null
  >(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [showCart, setShowCart] = useState(true);
  const [showUserAccount, setShowUserAccount] = useState(true);
  const [navLayout, setNavLayout] = useState<"row" | "main">("row");

  // Search handlers
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1"
            }/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`
          );
          const data = await res.json();
          setSearchResults(data.data || []);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isMegaOpen = !!activeMenu;

  // header settings fetch
  useEffect(() => {
    const fetchSettings = async () => {
      // If we have propData (rendering as a section), we prioritize it over global settings
      if (propData && Object.keys(propData).length > 0) return;

      try {
        const settings = await getPublicSettings();
        if (settings.topBar) {
          setTopBarSettings(settings.topBar);
        }
        if (settings.searchHighlights) {
          setSearchHighlights(settings.searchHighlights);
        }
        if (settings.siteLogo?.url) {
          setLogo(settings.siteLogo.url);
        }
        if (settings.menuAlignment) {
          setMenuAlignment(settings.menuAlignment);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
  }, [propData]);

  // Prop Data Sync (Direct overrides)
  useEffect(() => {
    if (propData) {
      console.log("Header received propData update:", !!propData);

      if (propData.topBar) {
        setTopBarSettings(propData.topBar);
      }
      if (propData.siteLogo?.url) {
        setLogo(propData.siteLogo.url);
      }

      if (propData.headerLogo) {
        setLogo(typeof propData.headerLogo === 'string' ? propData.headerLogo : propData.headerLogo.url);
      }

      if (propData.sideImage1) {
        setSideImage1(typeof propData.sideImage1 === 'string' ? propData.sideImage1 : propData.sideImage1.url);
      } else {
        setSideImage1(null);
      }

      if (propData.sideImage2) {
        setSideImage2(typeof propData.sideImage2 === 'string' ? propData.sideImage2 : propData.sideImage2.url);
      } else {
        setSideImage2(null);
      }

      if (propData.menus && Array.isArray(propData.menus)) {
        const mappedData = propData.menus.map((menu: any, idx: number) => ({
          ...(menu.menuData || {}),
          id: menu.id || menu._id || `menu-${idx}`,
          name: menu.name,
          icon: menu.icon,
          isHot: menu.isHot,
          menuType: menu.menuType,
          link: menu.link,
        })) as MenuItem[];
        setDynamicMenuData(mappedData);
      }

      if (propData.menuAlignment) {
        setMenuAlignment(propData.menuAlignment);
      }

      if (propData.showSearch !== undefined) {
        setShowSearch(propData.showSearch);
      }

      if (propData.showCart !== undefined) {
        setShowCart(propData.showCart);
      }

      if (propData.showUserAccount !== undefined) {
        setShowUserAccount(propData.showUserAccount);
      }

      if (propData.navLayout) {
        setNavLayout(propData.navLayout);
      }

      // Handle custom header logo
      if (propData.headerLogo) {
        setLogo(typeof propData.headerLogo === 'string' ? propData.headerLogo : propData.headerLogo.url);
      }
    }
  }, [propData]);

  // Preview override
  useEffect(() => {
    if (isPreview && headerSettings) {
      console.log("Header preview update received:", {
        hasMenus: !!headerSettings.menus,
        hasTopBar: !!headerSettings.topBar,
        hasLogo: !!headerSettings.siteLogo
      });

      if (headerSettings.topBar) {
        setTopBarSettings(headerSettings.topBar);
      }
      if (headerSettings.siteLogo?.url) {
        setLogo(headerSettings.siteLogo.url);
      }

      if (headerSettings.menus && Array.isArray(headerSettings.menus)) {
        const mappedData = headerSettings.menus.map((menu: any, idx: number) => ({
          ...(menu.menuData || {}),
          id: menu.id || menu._id || `menu-prev-${idx}`,
          name: menu.name,
          icon: menu.icon,
          isHot: menu.isHot,
          menuType: menu.menuType,
          link: menu.link,
        })) as MenuItem[];
        console.log("Header mapped dynamic menus:", mappedData.length);
        setDynamicMenuData(mappedData);
      }

      if (headerSettings.menuAlignment) {
        setMenuAlignment(headerSettings.menuAlignment);
      }

      // Handle custom header logo in preview
      if (headerSettings.headerLogo) {
        setLogo(typeof headerSettings.headerLogo === 'string' ? headerSettings.headerLogo : headerSettings.headerLogo.url);
      }

      if (headerSettings.sideImage1) {
        setSideImage1(typeof headerSettings.sideImage1 === 'string' ? headerSettings.sideImage1 : headerSettings.sideImage1.url);
      } else {
        setSideImage1(null);
      }

      if (headerSettings.sideImage2) {
        setSideImage2(typeof headerSettings.sideImage2 === 'string' ? headerSettings.sideImage2 : headerSettings.sideImage2.url);
      } else {
        setSideImage2(null);
      }

      if (headerSettings.showSearch !== undefined) {
        setShowSearch(headerSettings.showSearch);
      }

      if (headerSettings.showCart !== undefined) {
        setShowCart(headerSettings.showCart);
      }

      if (headerSettings.showUserAccount !== undefined) {
        setShowUserAccount(headerSettings.showUserAccount);
      }

      if (headerSettings.navLayout) {
        setNavLayout(headerSettings.navLayout);
      }
    }
  }, [isPreview, headerSettings]);

  // activeMenu change hone par lastActiveMenu update karo
  useEffect(() => {
    if (activeMenu) {
      const found = dynamicMenuData.find((menu) => menu.id === activeMenu);
      if (found) setLastActiveMenu(found);
    }
  }, [activeMenu, dynamicMenuData]);

  const toggleItem = (name: string) => {
    setOpenItem((prev) => (prev === name ? null : name));
  };

  let alignmentClass = "justify-center";
  if (menuAlignment === "left") alignmentClass = "justify-start";
  else if (menuAlignment === "right") alignmentClass = "justify-end";

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Small threshold to trigger shadow as soon as scroll starts
      if (window.scrollY > 20) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[104px] md:h-[144px]" />; // Approximate header height including topbar
  }

  return (
    <>
      {/* Top Bar */}
      {topBarSettings?.isEnabled && (
        <div
          className="border-b border-gray-200"
          style={{
            backgroundColor: topBarSettings.backgroundColor || "#EDF1FF",
          }}
        >
          <div className="hidden md:block">
            <div className="container-xl mx-auto px-4 sm:px-6 md:px-8">
              <div
                className="flex justify-between items-center h-10 text-sm"
                style={{ color: topBarSettings.textColor || "#334155" }}
              >
                <div className="flex-1 flex items-center">
                  <div
                    dangerouslySetInnerHTML={{ __html: topBarSettings.content }}
                  />
                </div>

                {topBarSettings.enableScrolling && topBarSettings.scrollingText && (
                  <div className="flex-[2] overflow-hidden relative mx-4">
                    <div className="whitespace-nowrap inline-block animate-marquee hover:[animation-play-state:paused]">
                      <span className="mx-12 font-medium">{topBarSettings.scrollingText}</span>
                      <span className="mx-12 font-medium">{topBarSettings.scrollingText}</span>
                    </div>
                    <style jsx>{`
                      @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                      }
                      .animate-marquee {
                        animation: marquee 15s linear infinite;
                      }
                    `}</style>
                  </div>
                )}

                <div className="flex-1 hidden md:flex items-center justify-end gap-3">
                  {topBarSettings.contactEmail && (
                    <>
                      <a
                        href={`mailto:${topBarSettings.contactEmail}`}
                        className="hover:opacity-80 transition-opacity"
                      >
                        {topBarSettings.contactEmail}
                      </a>
                      <span>|</span>
                    </>
                  )}
                  {topBarSettings.contactPhone && (
                    <>
                      <a
                        href={`tel:${topBarSettings.contactPhone}`}
                        className="hover:opacity-80 transition-opacity"
                      >
                        {topBarSettings.contactPhone}
                      </a>
                      <span>|</span>
                    </>
                  )}

                  {topBarSettings.links?.map((link, index) => (
                    <React.Fragment key={index}>
                      <a
                        href={link.url}
                        target={link.isOpenInNewTab ? "_blank" : "_self"}
                        rel={
                          link.isOpenInNewTab
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="hover:opacity-80 transition-opacity"
                      >
                        {link.label}
                      </a>
                      <span>|</span>
                    </React.Fragment>
                  ))}

                  <CurrencySwitcher />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-white transition-all duration-300 z-50 sticky top-0 left-0 right-0 ${isSticky && navLayout === "main" ? "shadow-md" : ""}`}>
        <div className="container-xl mx-auto px-4 sm:px-6 md:px-10 shadow-sm md:shadow-none">
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Mobile  we need to*/}
            <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="text-black">
                    <GiHamburgerMenu size={32} />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full bg-[#004DAA]">
                  <SheetHeader>
                    <Link href="/" className="flex items-center gap-2">
                      <Image
                        src={logo || "/images/mainlogo.png"}
                        alt="Company Logo"
                        width={50}
                        height={50}
                        className="h-8 md:h-10 w-auto"
                      />
                    </Link>
                  </SheetHeader>
                  <h1 className="text-base md:text-xl pt-2 text-white border-t mx-4">
                    <InlineEditable tag="span" value={propData?.welcomeText || "Welcome to EPxWEB Technologies"} fieldPath="welcomeText" sectionIndex={sectionIndex} />
                  </h1>

                  <nav className="mt-4 flex flex-col space-y-2 overflow-y-auto px-8">
                    <Link
                      href="/"
                      className="text-md font-medium text-white hover:underline"
                    >
                      Home
                    </Link>

                    {dynamicMenuData.map((menuItem) => {
                      const isOpen = openItem === menuItem.id;

                      return (
                        <div key={menuItem.id}>
                          <button
                            onClick={() => toggleItem(menuItem.id)}
                            className="w-full flex items-center justify-between gap-2 py-2 text-md text-white transition-colors"
                          >
                            <span className="relative text-left flex-1 flex items-center gap-2">
                              {menuItem.name}
                              {menuItem.isHot && <HotBadge />}
                            </span>
                            <FaSortDown
                              className={`h-5 w-5 text-white transform transition-transform duration-500 ${isOpen ? "rotate-180" : "rotate-0"
                                }`}
                            />
                          </button>

                          <div
                            className={`
                              overflow-hidden transition-all duration-500 ease-in-out
                              ${isOpen
                                ? "max-h-[2000px] opacity-100 mt-1"
                                : "max-h-0 opacity-0 mt-0 "
                              }
                            `}
                          >
                            <div className="pb-3 px-4">
                              <DynamicMegaMenu data={menuItem} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </nav>

                  <div className="px-4">
                    <Link href="/auth/register" className="w-full">
                      <Button variant="BlueDark" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <InlineImageEditable
                src={logo || "/images/mainlogo.png"}
                alt="Company Logo"
                width={50}
                height={50}
                fieldPath="siteLogo.url"
                sectionIndex={sectionIndex}
                className="h-12 w-auto"
              />
            </Link>
          
            {navLayout === "main" && (
              <nav 
                className="hidden md:flex flex-1 items-center justify-center gap-6 px-4"
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onMouseEnter={() => setActiveMenu(null)}
                >
                  Home
                </Link>
                {dynamicMenuData.map((menu) => (
                  <div key={menu.id} className="flex items-center">
                    {menu.menuType === 'simple' ? (
                      <Link
                        href={ensureAbsoluteHref(menu.link)}
                        className="relative flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        onMouseEnter={() => setActiveMenu(null)}
                      >
                         {menu.name}
                         {menu.isHot && <HotBadge />}
                      </Link>
                    ) : (
                      <button
                        onMouseEnter={() => setActiveMenu(menu.id)}
                        className={`relative flex items-center gap-1 text-sm font-medium transition-colors ${
                          activeMenu === menu.id ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                        }`}
                      >
                         {menu.name}
                         {menu.isHot && <HotBadge />}
                         <MdKeyboardArrowDown size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </nav>
            )}

            {/* Search */}
            {showSearch && (
              <div className={`${navLayout === "main" ? "w-48" : "flex-1 max-w-md"} relative`}>
                <div className="relative w-full">
                  <Input
                    type="search"
                    placeholder="Search by products"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsSearchFocused(false), 200)
                    }
                    className="h-11 pl-4 pr-12 hidden md:block rounded-lg bg-slate-100 border-0 focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                  <IoSearch
                    onClick={handleSearchSubmit}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors hidden md:block"
                    size={22}
                  />
                </div>

                {/* Search Dropdown */}
                {isSearchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-[60] hidden md:block">
                    {!searchQuery && searchHighlights && (
                      <div className="grid grid-cols-2 gap-4">
                        {searchHighlights.topCollection && (
                          <Link
                            href={`/collections/${searchHighlights.topCollection.slug}`}
                            className="group block"
                          >
                            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                              Top Collection
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                              {searchHighlights.topCollection.image?.url && (
                                <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100">
                                  <Image
                                    src={
                                      searchHighlights.topCollection.image.url ||
                                      ""
                                    }
                                    alt={searchHighlights.topCollection.name}
                                    fill
                                    quality={100}
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                  {searchHighlights.topCollection.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  View Collection
                                </div>
                              </div>
                            </div>
                          </Link>
                        )}

                        {searchHighlights.topProduct && (
                          <Link
                            href={`/products/${searchHighlights.topProduct.slug}`}
                            className="group block"
                          >
                            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                              Top Product
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                              {searchHighlights.topProduct.images?.[0]?.url && (
                                <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100">
                                  <Image
                                    src={
                                      searchHighlights.topProduct.images[0].url ||
                                      ""
                                    }
                                    alt={searchHighlights.topProduct.name}
                                    fill
                                    quality={100}
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                  {searchHighlights.topProduct.name}
                                </div>
                                <div className="text-xs text-blue-600 font-medium">
                                  <PriceDisplay 
                                    amount={searchHighlights.topProduct.salePrice || searchHighlights.topProduct.price || 0} 
                                    manualOverrides={(searchHighlights.topProduct as any).manualCurrencyPrices}
                                  />
                                </div>
                              </div>
                            </div>
                          </Link>
                        )}
                      </div>
                    )}

                    {searchQuery && (
                      <div>
                        {isSearching ? (
                          <SearchLoading />
                        ) : searchResults.length > 0 ? (
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                              Products
                            </div>
                            {searchResults.map((product) => (
                              <Link
                                key={product._id}
                                href={`/products/${product.slug}`}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors group"
                              >
                                <div className="w-10 h-10 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                  {product.images?.[0]?.url && (
                                    <Image
                                      src={product.images[0].url}
                                      alt={
                                        product.productInfo?.title || product.name
                                      }
                                      fill
                                      quality={100}
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-900 group-hover:text-blue-600 truncate">
                                    {product.productInfo?.title || product.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {product.brand?.name}
                                  </div>
                                </div>
                              </Link>
                            ))}
                            <Link
                              href={`/products?search=${encodeURIComponent(
                                searchQuery
                              )}`}
                              className="block text-center text-sm text-blue-600 hover:underline mt-2 py-1"
                            >
                              View all results
                            </Link>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            No products found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Partner Logos + Cart */}
            <div className="flex items-center gap-5">
              <div className="hidden md:flex items-center gap-2">
                {sideImage1 && (
                  <InlineImageEditable
                    src={sideImage1}
                    alt="Partner Logo 1"
                    width={130}
                    height={45}
                    fieldPath="sideImage1"
                    sectionIndex={sectionIndex}
                    className="h-12 w-auto object-contain"
                  />
                )}
                {sideImage2 && (
                  <InlineImageEditable
                    src={sideImage2}
                    alt="Partner Logo 2"
                    width={130}
                    height={45}
                    fieldPath="sideImage2"
                    sectionIndex={sectionIndex}
                    className="h-10 w-auto object-contain"
                  />
                )}
              </div>

              <div className="hidden md:block">
                <CurrencySwitcher />
              </div>

              {showCart && (
                <button
                  onClick={() => openCart()}
                  className="relative flex items-center justify-center text-[#004DAA] transition-all hover:scale-110 active:scale-95"
                >
                  <HiShoppingBag size={24} />
                  {itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-1 ring-white">
                      {itemCount}
                    </span>
                  )}
                </button>
              )}

              {showUserAccount && (
                <>
                  {isAuthenticated ? (
                    <Link
                      href="/profile"
                      className="flex items-center justify-center text-[#004DAA] transition-all hover:scale-110 active:scale-95"
                    >
                      <FaUser size={20} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="flex items-center justify-center text-[#004DAA] transition-all hover:scale-110 active:scale-95"
                    >
                      <FaUser size={20} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
        <CartSidebar isOpen={isCartOpen} onClose={closeCart} />

        {/* Placeholder to prevent layout shift when header becomes fixed */}
        {isSticky && navLayout === "row" && <div className="hidden md:block h-16" />}

        {/* Desktop Navigation + Mega Menu (Separate Row Layout) */}
        {navLayout === "row" && (
          <div
            className={`hidden md:block border-y border-[#D5E4F1] bg-white shadow-sm transition-all duration-300 z-50 ${isSticky ? "fixed top-0 left-0 right-0 shadow-md" : "relative"
              }`}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className="relative">
              {/* Top nav row */}
              <div
                className={`container-xl mx-auto flex items-center ${alignmentClass} px-4 sm:px-6 md:px-10 ${isSticky ? "h-14" : "h-16"
                  } transition-all duration-300`}
                onMouseOver={() => setActiveMenu(null)}
              >
                <nav className="hidden md:flex h-full items-center gap-8">
                  <Link
                    href="/"
                    className="flex h-full items-center gap-1.5 px-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setActiveMenu(null)}
                    onMouseEnter={() => setActiveMenu(null)}
                  >
                    Home
                  </Link>

                  {dynamicMenuData.map((menu) => (
                    <div key={menu.id} className="flex h-full items-center">
                      {menu.menuType === 'simple' ? (
                        <Link
                          href={ensureAbsoluteHref(menu.link)}
                          className={`relative flex h-full items-center gap-1.5 px-2 text-base font-medium transition-colors cursor-pointer text-gray-700 hover:text-blue-600`}
                        >
                          {menu.icon && (
                            <Image
                              src={menu.icon}
                              alt={menu.name}
                              width={16}
                              height={16}
                            />
                          )}
                          <span className="relative text-sm font-medium flex items-center gap-1.5">
                            {menu.name}
                            {menu.isHot && <HotBadge />}
                          </span>
                        </Link>
                      ) : (
                        <button
                          onMouseEnter={() => setActiveMenu(menu.id)}
                          onMouseOver={(e) => e.stopPropagation()}
                          className={`relative flex h-full items-center gap-1.5 px-2 text-base font-medium transition-colors cursor-pointer ${activeMenu === menu.id
                            ? "text-blue-600"
                            : "text-gray-700 hover:text-blue-600"
                            }`}
                        >
                          {menu.icon && (
                            <Image
                              src={menu.icon}
                              alt={menu.name}
                              width={16}
                              height={16}
                            />
                          )}
                          <span className="relative text-sm font-medium flex items-center gap-1.5">
                            {menu.name}
                            {menu.isHot && <HotBadge />}
                          </span>
                          <FaChevronDown size={16} className="text-gray-500" />
                        </button>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Smooth mega menu panel – ONLY height based */}
              <div
                className={`
                absolute left-0 top-full w-full bg-background shadow-lg border-t border-[#D5E4F1]
                overflow-hidden
                transition-[max-height] duration-1000 ease-in-out
                ${isMegaOpen ? "max-h-[650px]" : "max-h-0"}
              `}
              >
                {lastActiveMenu && (
                  <div className="container-xl mx-auto py-8">
                    <DynamicMegaMenu data={lastActiveMenu} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mega Menu Panel for Inline Layout - Moved inside sticky container for perfect sync */}
        {navLayout === "main" && (
           <div
            className={`
              absolute left-0 top-full w-full bg-background shadow-lg border-t border-[#D5E4F1]
              overflow-hidden
              transition-[max-height] duration-1000 ease-in-out z-50
              ${isMegaOpen ? `max-h-[650px]` : "max-h-0"}
            `}
            onMouseLeave={() => setActiveMenu(null)}
          >
            {lastActiveMenu && (
              <div className="container-xl mx-auto py-8">
                <DynamicMegaMenu data={lastActiveMenu} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
