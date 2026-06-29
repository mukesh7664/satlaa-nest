import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CreditCard } from "lucide-react";

// Checkout Button (pretty-grasshopper-57)
export interface CheckoutButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  className,
  onClick,
  children,
  ...props
}) => {
  return (
    <button
      className={cn("uiverse-checkout-btn w-full", className)}
      onClick={onClick}
      {...props}
    >
      <div className="uiverse-checkout-btn-decor"></div>
      <div className="uiverse-checkout-btn-content justify-center w-full">
        <div className="uiverse-checkout-btn-icon">
          <CreditCard className="w-5 h-5 text-current" />
        </div>
        <span className="font-semibold">{children}</span>
      </div>
    </button>
  );
};

// Wishlist Button (curly-seahorse-76)
export type WishlistButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  onClick,
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn("uiverse-wishlist-btn", className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// AddToCart with Ripple
export const RippleButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  return (
    <Button
      className={cn("uiverse-ripple-btn", className)}
      ref={ref}
      variant={variant}
      size={size}
      asChild={asChild}
      {...props}
    />
  );
});
RippleButton.displayName = "RippleButton";
