"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { cartService, Cart, CartItem } from "@/services/cart.service";
import { useAppSelector } from "@/lib/store/hooks";
import { toast } from "sonner";

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  total: number;
  addToCart: (item: any, openDrawer?: boolean) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  removeDiscount: () => Promise<void>;
  mergeCarts: () => Promise<void>;
  isLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Initialize session and load cart
  useEffect(() => {
    const initCart = async () => {
      try {
        let sId = localStorage.getItem("cart_session_id");
        
        // ONLY generate a guest session if the user is NOT authenticated
        if (!sId && !isAuthenticated) {
          sId = crypto.randomUUID();
          localStorage.setItem("cart_session_id", sId);
        }
        
        setSessionId(sId || undefined);

        const backendCart = await cartService.getCart(sId || undefined);
        setCart(backendCart);
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initCart();
  }, [isAuthenticated]);

  // Auto-merge guest cart when user logs in
  useEffect(() => {
    if (isAuthenticated && sessionId) {
      mergeCarts();
    }
  }, [isAuthenticated, !!sessionId]);

  const addToCart = async (item: any, openDrawer = true) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.addToCart(item, sessionId || undefined);
      setCart(updatedCart);
      if (openDrawer) openCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.removeItem(cartItemId, sessionId || undefined);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    // Capture previous state for rollback if needed
    const previousCart = cart;

    try {
      // Optimistic UI Update: Update only the specific item in the local state
      if (cart) {
        const updatedItems = cart.items.map((item) =>
          item.id === cartItemId ? { ...item, quantity, subtotal: Number(item.price) * quantity } : item
        );
        
        // Calculate new totals optimistically
        const newSubtotal = updatedItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
        
        setCart({
          ...cart,
          items: updatedItems,
          totals: {
            ...cart.totals,
            subtotal: newSubtotal,
            total: newSubtotal + (cart.totals.tax || 0) // Simple approximation
          }
        });
      }

      const updatedCart = await cartService.updateItemQuantity(cartItemId, quantity, sessionId || undefined);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
      // Rollback on error
      if (previousCart) setCart(previousCart);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.clearCart(sessionId || undefined);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyDiscount = async (code: string) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.applyDiscount(code, sessionId || undefined);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error applying discount:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeDiscount = async () => {
    try {
      setIsLoading(true);
      const updatedCart = await cartService.removeDiscount(sessionId || undefined);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing discount:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const mergeCarts = async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      const updatedCart = await cartService.mergeCarts(sessionId);
      setCart(updatedCart);
      
      // After merging, the session is no longer needed (cart is tied to user)
      localStorage.removeItem("cart_session_id");
      setSessionId(undefined);
      toast.success("Guest cart merged with your account!");
    } catch (error) {
      console.error("Error merging carts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const items = cart?.items || [];
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = cart?.totals?.total || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyDiscount,
        removeDiscount,
        mergeCarts,
        isLoading,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
