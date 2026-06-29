"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { wishlistService } from "@/services/wishlist.service";
import { toast } from "sonner";

interface WishlistContextType {
  wishlist: string[]; // Array of product IDs
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const items = await wishlistService.getWishlist();
          setWishlist(items.map((item) => item.productId));
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setWishlist([]);
          toast.error("Session expired. Please login again.");
        } else {
          console.error("Error loading wishlist:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const addToWishlist = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to add to wishlist");
        return;
      }
      await wishlistService.addToWishlist(productId);
      setWishlist((prev) => [...prev, productId]);
      toast.success("Added to wishlist");
    } catch (error: any) {
      if (error.response?.status === 409) {
        setWishlist((prev) => 
          prev.includes(productId) ? prev : [...prev, productId]
        );
        toast.info("Product is already in your wishlist");
      } else {
        console.error("Error adding to wishlist:", error);
        toast.error("Failed to add to wishlist");
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((id) => id !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
