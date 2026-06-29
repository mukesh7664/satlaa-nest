"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RiMenuFold3Line } from "react-icons/ri";

const menuItems = [
  { name: "My Profile", href: "/profile" },
  { name: "My Orders", href: "/profile/orders" },

  { name: "My Reviews", href: "/profile/reviews" },
  { name: "My Addresses", href: "/profile/addresses" },
  { name: "My Wishlist", href: "/profile/favorites" },
];

export function MobileProfileNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="lg:hidden">
          <RiMenuFold3Line className="h-7 w-7 font-bold" />
        </button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            Profile Settings
          </SheetTitle>
        </SheetHeader>
        <nav>
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => (
              <li key={item.href}>
                {/* SheetClose will automatically close the drawer on click */}
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-md px-4 py-2.5 text-base font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600",
                      {
                        " text-[#004DAA] hover:bg-blue-700 hover:text-white":
                          pathname === item.href,
                      }
                    )}
                  >
                    {item.name}
                  </Link>
                </SheetClose>
              </li>
            ))}
            <li>
              <SheetClose asChild>
                <button
                  onClick={logout}
                  className="w-full text-left block rounded-md px-4 py-2.5 text-base font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  Logout
                </button>
              </SheetClose>
            </li>
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
