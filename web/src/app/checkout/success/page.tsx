"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentService } from "@/services/payment.service";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { PriceDisplay } from "@/components/common/PriceDisplay";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setError("No session ID found. Please contact support if you have been charged.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const result = await paymentService.verifyStripeSession(sessionId);
        if (result.success) {
          setOrder(result.order);
          setStatus("success");
          clearCart(); // Sync local cart state
        } else {
          setStatus("error");
          setError(result.message || "Payment verification failed.");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus("error");
        setError(err.message || "An error occurred during verification.");
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Verifying Your Payment...</h2>
        <p className="text-gray-500 mt-2">Please do not close this window.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Payment Verification Failed</h2>
        <p className="text-gray-600 mt-2 max-w-md">
          {error}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button asChild variant="outline">
            <Link href="/contact-us">Contact Support</Link>
          </Button>
          <Button asChild>
            <Link href="/checkout">Try Again</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center p-8 md:p-12">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
          Thank you for your order!
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Your payment has been processed successfully. Your order number is{' '}
          <span className="font-bold text-gray-900">#{order?.orderNumber}</span>.
        </p>

        <div className="mt-10 border-t border-gray-100 pt-10">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
            <div className="bg-gray-50 p-6 rounded-xl text-left">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Order Status</h3>
              <p className="mt-1 text-xl font-bold text-gray-900 capitalize">{order?.status || 'Confirmed'}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl text-left">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Amount Paid</h3>
              <p className="mt-1 text-xl font-bold text-gray-900">
                <PriceDisplay amount={order?.totalAmount || 0} originalCurrency={order?.currency || order?.pricing?.currency || "INR"} />
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href={`/profile/orders/${order?.id}`} className="flex items-center">
              View Order Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/products" className="flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StripeSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
