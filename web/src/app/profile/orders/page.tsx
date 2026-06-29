"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RotateCcw,
  Truck,
  AlertCircle,
  ShoppingBag,
  Calendar,
  ArrowRight
} from "lucide-react";
import { ReturnRequestModal } from "@/components/modals/ReturnRequestModal";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { useAuth } from "@/hooks/useAuth";

interface OrderItem {
  _id: string;
  productId: string;
  variantId?: string;
  productName: string;
  productImage?: string;
  brandName: string;
  price: number;
  quantity: number;
  total: number;
  paymentStatus: "pending" | "paid" | "rejected" | "refunded";
  variantInfo?: Record<string, any>;
  returnStatus?: string;
  returnType?: string;
  product?: {
    productStructureType: "single" | "bundle";
    slug: string;
    is_returnable?: boolean;
    is_replaceable?: boolean;
    return_window_days?: number;
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  orderType: "quote_request" | "direct_purchase" | "manual_invoice";
  status: string;
  items: OrderItem[];
  pricing: {
    total: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const response = await fetch(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data.data || data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      newSet.has(orderId) ? newSet.delete(orderId) : newSet.add(orderId);
      return newSet;
    });
  };

  const renderOrderStatus = (status: string) => {
    const s = status.toLowerCase();
    const configs: any = {
      pending: { color: "text-amber-600 bg-amber-50", icon: Clock },
      confirmed: { color: "text-blue-600 bg-blue-50", icon: CheckCircle2 },
      processing: { color: "text-indigo-600 bg-indigo-50", icon: Package },
      shipped: { color: "text-purple-600 bg-purple-50", icon: Truck },
      delivered: { color: "text-green-600 bg-green-50", icon: CheckCircle2 },
      cancelled: { color: "text-slate-500 bg-slate-50", icon: XCircle },
    };
    const config = configs[s] || { color: "text-slate-600 bg-slate-50", icon: AlertCircle };
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${config.color}`}>
        <Icon size={12} />
        {status.replace(/_/g, " ")}
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600"></div>
      <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">Fetching Orders...</p>
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="bg-slate-50 rounded-full p-10 w-fit mx-auto mb-6">
        <ShoppingBag className="h-16 w-16 text-slate-200" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">No orders found</h2>
      <p className="text-slate-500 font-medium mb-8">You haven't placed any orders yet.</p>
      <Button onClick={() => router.push("/products")} className="rounded-full bg-blue-600 px-8 py-6 font-black">
        Start Shopping
      </Button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900">My Orders</h1>
        <p className="text-slate-500 font-medium">Track, manage and view your purchase history.</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const isExpanded = expandedOrders.has(order._id);
          return (
            <motion.div
              layout
              key={order._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-blue-200 transition-colors"
            >
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-slate-900">Order #{order.orderNumber}</h3>
                      {renderOrderStatus(order.status)}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <Calendar size={14} />
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-xl font-black text-blue-600 leading-none">
                        <PriceDisplay amount={order.pricing.total} originalCurrency={order.pricing.currency} />
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/profile/orders/${order._id}`)}
                      className="rounded-full border-slate-100 font-bold hover:bg-slate-50"
                    >
                      Details
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => toggleOrderExpansion(order._id)}
                    className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isExpanded ? "Hide" : "Show"} Items ({order.items.length})
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4"
                      >
                        {order.items.map((item) => (
                          <div key={item._id} className="flex gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                            <div className="relative h-16 w-16 rounded-xl bg-white border border-slate-100 overflow-hidden flex-shrink-0">
                              {item.productImage ? (
                                <img src={item.productImage} alt={item.productName} className="object-contain p-1 w-full h-full" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-300"><Package size={24} /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 truncate">{item.productName}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Qty: {item.quantity} × <PriceDisplay amount={item.price} originalCurrency={order.pricing.currency} />
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900">
                                <PriceDisplay amount={item.total} originalCurrency={order.pricing.currency} />
                              </p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedItem && (
        <ReturnRequestModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedItem(null); }}
          orderId={selectedItem.orderId}
          onSuccess={fetchOrders}
        />
      )}
    </motion.div>
  );
}
