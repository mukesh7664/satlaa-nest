// src/components/BillingForm.tsx
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Script from "next/script";
import { pushToDataLayer, GTM_EVENTS } from "@/lib/gtm";
import { useCurrency } from "@/context/CurrencyContext";
import { AddressCard } from "./AddressCard";
import { AddressModal } from "./AddressModal";
import { resolvePrice } from "@/utils/currencyUtils";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  type: string;
}

interface BillingFormProps {
  user?: any | null;
  paymentMethod: "razorpay" | "stripe" | "quote_request";
  onPaymentMethodChange: (method: "razorpay" | "stripe" | "quote_request") => void;
  isSubmitting: boolean;
  setIsSubmitting: (val: boolean) => void;
  setOrderSuccess: (val: boolean) => void;
}

export function BillingForm({
  user,
  paymentMethod,
  onPaymentMethodChange,
  setIsSubmitting,
  setOrderSuccess,
}: BillingFormProps) {
  const router = useRouter();
  const { cart, items, clearCart } = useCart();
  const { currency, exchangeRates } = useCurrency();
  const [error, setError] = useState<string | null>(null);
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingAddressId, setShippingAddressId] = useState<string>("");
  const [billingAddressId, setBillingAddressId] = useState<string>("");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${apiUrl}/addresses`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-tenant-domain": window.location.hostname,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAddresses(data.addresses || []);
        
        // Auto-select default address
        const currentAddresses = data.addresses || [];
        const defaultAddr = currentAddresses.find((a: Address) => a.isDefault);
        
        if (defaultAddr) {
          setShippingAddressId(prev => prev || defaultAddr.id);
          setBillingAddressId(prev => prev || defaultAddr.id);
        } else if (currentAddresses.length > 0) {
          setShippingAddressId(prev => prev || currentAddresses[0].id);
          setBillingAddressId(prev => prev || currentAddresses[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSaveAddress = async (formData: Partial<Address>) => {
    const token = localStorage.getItem("token");
    const method = formData.id ? "PUT" : "POST";
    const url = formData.id ? `${apiUrl}/addresses/${formData.id}` : `${apiUrl}/addresses`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-tenant-domain": window.location.hostname,
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const saved = await response.json();
      await fetchAddresses();
      // Select the new/updated address
      setShippingAddressId(saved.id);
      if (sameAsBilling) setBillingAddressId(saved.id);
    } else {
      const err = await response.json();
      throw new Error(err.message || "Failed to save address");
    }
  };

  const handleSelectShipping = (id: string) => {
    setShippingAddressId(id);
    if (sameAsBilling) {
      setBillingAddressId(id);
    }
  };

  const handleSelectBilling = (id: string) => {
    setBillingAddressId(id);
  };

  const handleToggleSame = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      setBillingAddressId(shippingAddressId);
    }
  };

  const hasQuoteItems = items.some((item) => (item as any).purchaseType === "quote");
  useEffect(() => {
    if (hasQuoteItems) {
      onPaymentMethodChange("quote_request");
    }
  }, [hasQuoteItems, onPaymentMethodChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shippingAddressId) {
      setError("Please select a shipping address");
      return;
    }
    if (!billingAddressId) {
      setError("Please select a billing address");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const shippingAddr = addresses.find(a => a.id === shippingAddressId);
      const billingAddr = addresses.find(a => a.id === billingAddressId);

      if (!shippingAddr || !billingAddr) throw new Error("Selected address details not found");

      // Map to order format
      const mapAddr = (a: Address) => ({
        fullName: a.fullName,
        streetAddress: a.street,
        apartment: a.landmark || "",
        city: a.city,
        state: a.state,
        pinCode: a.pincode,
        country: "India",
        phone: a.phone,
        email: user?.email || "",
      });

      const orderData = {
        orderType: paymentMethod === "quote_request" ? "quote_request" : "direct_purchase",
        items: items.map((item) => {
          const rate = exchangeRates[currency] || 1;
          const resolvedPrice = Number(resolvePrice(
            item.price,
            cart?.totals?.currency || "INR",
            currency,
            exchangeRates,
            item.selectedVariant?.manualCurrencyPrices || item.product?.manualCurrencyPrices
          ).toFixed(2));
          
          console.log(`Checking Item Price:`, {
            originalPrice: item.price,
            currency,
            rate,
            resolvedPrice
          });
          
          return {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: resolvedPrice, // Send the converted/manual price (rounded)
            variantInfo: (item as any).selectedVariant || (item as any).variantInfo,
            bundleSelections: (item as any).bundleSelections,
            purchaseType: (item as any).purchaseType,
          };
        }),
        shippingAddress: mapAddr(shippingAddr),
        billingAddress: mapAddr(billingAddr),
        sameAsBilling,
        paymentMethod: paymentMethod,
        currency: currency,
        exchangeRate: exchangeRates[currency] || 1,
      };

      const response = await fetch(`${apiUrl}/checkout/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-tenant-domain": window.location.hostname,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create order");

      // Stripe Redirect handle
      if (data.provider === 'stripe' && data.url) {
        window.location.href = data.url;
        return;
      }

      // Razorpay handle
      if (data.provider === "razorpay" && data.razorpayOrderId) {
        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: "E-Commerce",
          description: "Order Payment",
          order_id: data.razorpayOrderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch(`${apiUrl}/payment/verify`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: data.order.id,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setOrderSuccess(true);
                clearCart();
                router.push(`/profile/orders/${data.order.id}`);
              } else {
                setError("Payment verification failed.");
              }
            } catch (err) {
              setError("Verification error.");
            }
          },
          prefill: {
            name: shippingAddr.fullName,
            email: user?.email,
            contact: shippingAddr.phone,
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setIsSubmitting(false);
        return;
      }

      // Default for quote requests or manual payments
      setOrderSuccess(true);
      clearCart();
      router.push(`/profile/orders/${data.order.id}`);
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Shipping Address</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingAddress(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Plus size={16} /> Add New Address
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm animate-in fade-in zoom-in duration-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-xl border border-gray-200" />
            ))}
          </div>
        ) : addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                isSelected={shippingAddressId === addr.id}
                onSelect={handleSelectShipping}
                onEdit={(a) => {
                  setEditingAddress(a);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Plus className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500 font-medium mb-4">No saved addresses found.</p>
            <Button
              onClick={() => {
                setEditingAddress(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 rounded-lg"
            >
              Add Your First Address
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 transition-all hover:bg-blue-50">
          <Checkbox
            id="sameAsBilling"
            checked={sameAsBilling}
            onCheckedChange={(checked) => handleToggleSame(!!checked)}
            className="h-5 w-5 data-[state=checked]:bg-blue-600 border-gray-300"
          />
          <Label htmlFor="sameAsBilling" className="font-semibold text-blue-900 cursor-pointer select-none">
            Billing address is same as shipping address
          </Label>
        </div>

        {!sameAsBilling && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Billing Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  isSelected={billingAddressId === addr.id}
                  onSelect={handleSelectBilling}
                  onEdit={(a) => {
                    setEditingAddress(a);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

      </form>

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
        initialAddress={editingAddress}
      />
    </div>
  );
}
