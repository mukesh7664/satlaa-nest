"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BillingForm } from "@/components/Pages/checkout/BillingForm";
import { OrderSummary } from "@/components/Pages/checkout/OrderSummary";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  LogIn, 
  UserPlus, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck,
  Lock
} from "lucide-react";

interface CheckoutMainProps {
  title?: string;
  subtitle?: string;
}

export const CheckoutMain: React.FC<CheckoutMainProps> = ({
  title = "Checkout",
  subtitle = "Complete your purchase below."
}) => {
  const router = useRouter();
  const { items, isLoading: isCartLoading } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Redirect to cart if empty
  useEffect(() => {
    if (!isCartLoading && items.length === 0 && !orderSuccess) {
      router.push("/cart");
    }
  }, [items, isCartLoading, router, orderSuccess]);

  const handleLogin = () => {
    localStorage.setItem("redirectAfterLogin", "/checkout");
    router.push("/auth/login");
  };

  const handleRegister = () => {
    localStorage.setItem("redirectAfterLogin", "/checkout");
    router.push("/auth/register");
  };

  if (isCartLoading || isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600"></div>
          <Lock className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
        </div>
        <p className="font-medium text-slate-500">Preparing secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs & Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400">
            <button onClick={() => router.push("/cart")} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
              Cart
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900">Checkout</span>
          </div>
          
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                {title}
              </h1>
              <p className="mt-1 text-slate-500 font-medium">
                {user 
                  ? `Hey ${user.firstName || 'there'}, let's get your order placed.` 
                  : "Securely sign in to complete your order."}
              </p>
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-100">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Secure Checkout
              </div>
            </div>
          </div>
        </motion.div>

        {/* Login Option for Guests */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-100/20"
          >
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 bg-blue-600 p-8 text-white md:p-12">
                <h2 className="text-2xl font-black md:text-3xl">Sign in to checkout</h2>
                <p className="mt-4 text-blue-100 font-medium leading-relaxed">
                  Save your details for a faster checkout experience next time and track your order history in real-time.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button
                    onClick={handleLogin}
                    className="h-12 rounded-full bg-white px-8 font-bold text-blue-600 hover:bg-blue-50"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Button>
                  <Button
                    onClick={handleRegister}
                    variant="ghost"
                    className="h-12 rounded-full px-8 font-bold text-white hover:bg-white/10 border border-white/20"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Account
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center bg-slate-50 p-8 md:w-1/3">
                <Lock className="h-20 w-20 text-slate-200" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Checkout Form Content */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CheckoutContent
              user={user}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              orderSuccess={orderSuccess}
              setOrderSuccess={setOrderSuccess}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

function CheckoutContent({
  user,
  isSubmitting,
  setIsSubmitting,
  orderSuccess,
  setOrderSuccess,
}: {
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isSubmitting: boolean;
  setIsSubmitting: (val: boolean) => void;
  orderSuccess: boolean;
  setOrderSuccess: (val: boolean) => void;
}) {
  const { items } = useCart();
  const hasQuoteItems = items.some((item) => item.purchaseType === "quote");

  const [selectedMethod, setSelectedMethod] = useState<
    "razorpay" | "stripe" | "quote_request"
  >("razorpay");

  const paymentMethod = hasQuoteItems ? "quote_request" : selectedMethod;

  if (orderSuccess) {
    return (
      <div className="container-xl mx-auto py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 rounded-full border-4 border-green-100 animate-ping"></div>
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Thank you for your order. We are redirecting you to your order
            details page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-xl mx-auto grid grid-cols-1 gap-x-12 gap-y-8 py-12 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <BillingForm
          user={user}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setSelectedMethod}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          setOrderSuccess={setOrderSuccess}
        />
      </div>

      <div className="lg:col-span-2">
        <OrderSummary
          paymentMethod={paymentMethod}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

export default CheckoutMain;
