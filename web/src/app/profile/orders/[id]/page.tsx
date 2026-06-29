"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Truck,
  CreditCard,
  Tag,
  CheckCheck,
  Download,
  AlertCircle,
  RotateCcw,
  Calendar,
  Hash,
  ShieldCheck,
  FileText,
  User,
  ExternalLink
} from "lucide-react";
import { ReturnRequestModal } from "@/components/modals/ReturnRequestModal";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface OrderItem {
  _id: string;
  productId: string;
  variantId?: string;
  productName: string;
  productImage?: string;
  brandName: string;
  price: number;
  quantity: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  paymentStatus: "pending" | "paid" | "rejected" | "refunded" | "success";
  variantInfo?: {
    userType?: string;
    planName?: string;
    pricePerUnit?: number;
    [key: string]: any;
  };
  bundleDetails?: Array<{
    productId: string;
    productName: string;
    brandName: string;
    quantity: number;
    variantId?: string;
    variantName?: string;
    image?: string;
  }>;
  isBundle?: boolean;
  paymentDetails?: {
    method?: string;
    transactionId?: string;
    paidAt?: string;
    paidAmount?: number;
    paymentNotes?: string;
  };
  rejectionReason?: string;
  rejectedAt?: string;
  returnStatus?: string;
  returnType?: string;
  product?: {
    is_returnable?: boolean;
    is_replaceable?: boolean;
    return_window_days?: number;
  };
}

interface PaymentHistory {
  _id?: string;
  amount: number;
  method: string;
  transactionId?: string;
  paymentDate: string;
  approverName?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface DeliveryTracking {
  _id?: string;
  status:
    | "order_placed"
    | "confirmed"
    | "processing"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  description: string;
  location?: string;
  updatedByName?: string;
  timestamp: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  orderType: "quote_request" | "direct_purchase" | "manual_invoice";
  status: string;
  items: OrderItem[];
  billingAddress: {
    fullName: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  shippingAddress?: {
    fullName: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  pricing: {
    subtotal: number;
    discount: number;
    discountAmount: number;
    additionalDiscount: number;
    discountReason?: string;
    tax: number;
    shippingCharges: number;
    total: number;
    currency: string;
  };
  paymentSummary?: {
    totalAmount: number;
    paidAmount: number;
    rejectedAmount: number;
    pendingAmount: number;
    refundedAmount: number;
    paidItemsCount: number;
    rejectedItemsCount: number;
    pendingItemsCount: number;
  };
  payment: {
    method: string;
    status: string;
  };
  paymentStatus?: string;
  paymentHistory?: PaymentHistory[];
  deliveryTracking?: DeliveryTracking[];
  discountCode?: string;
  gstNumber?: string;
  needGstInvoice?: boolean;
  invoice?: {
    invoiceNumber: string;
    invoiceUrl?: string;
    generatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    orderId: string;
    orderItemId: string;
    productName: string;
    productId: string;
    currentVariantId?: string;
    requestType?: "RETURN" | "REPLACEMENT";
  } | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${apiUrl}/orders/${orderId}`, { headers });
      if (!response.ok) throw new Error("Failed to fetch order details");
      const data = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) return;
    try {
      setCancelling(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (!response.ok) throw new Error("Failed to cancel order");
      setIsCancelModalOpen(false);
      fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleReturnClick = (item: OrderItem, requestType: "RETURN" | "REPLACEMENT") => {
    setSelectedItem({
      orderId,
      orderItemId: item._id,
      productName: item.productName,
      productId: item.productId,
      currentVariantId: item.variantId,
      requestType,
    });
    setIsReturnModalOpen(true);
  };

  const isEligibleForCancellation = (status: string) => {
    const eligibleStatuses = ["pending", "confirmed", "processing", "ready_to_ship"];
    return eligibleStatuses.includes(status.toLowerCase());
  };

  const canReturnItem = (order: Order, item?: any) => {
    if (!order.status) return false;
    const status = order.status.toLowerCase();
    if (status === "return_requested" || status === "replacement_requested") return false;
    const eligibleStatuses = ["delivered", "completed", "partially_returned", "partially_replaced"];
    if (!eligibleStatuses.includes(status)) return false;
    const isReturnable = item?.product?.is_returnable ?? true;
    const isReplaceable = item?.product?.is_replaceable ?? true;
    if (!isReturnable && !isReplaceable) return false;
    const windowDays = item?.product?.return_window_days ?? 7;
    const deliveryDate = new Date(order.updatedAt || order.createdAt);
    if (isNaN(deliveryDate.getTime())) return false;
    const diffTime = new Date().getTime() - deliveryDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) <= windowDays;
  };

  const renderOrderStatus = (status: string) => {
    const s = status.toLowerCase();
    const configs: any = {
      pending: { color: "text-amber-600 bg-amber-50", icon: Clock },
      confirmed: { color: "text-blue-600 bg-blue-50", icon: CheckCircle2 },
      processing: { color: "text-indigo-600 bg-indigo-50", icon: Package },
      ready_to_ship: { color: "text-cyan-600 bg-cyan-50", icon: Truck },
      shipped: { color: "text-purple-600 bg-purple-50", icon: Truck },
      out_for_delivery: { color: "text-teal-600 bg-teal-50", icon: Package },
      delivered: { color: "text-green-600 bg-green-50", icon: CheckCircle2 },
      completed: { color: "text-green-600 bg-green-50", icon: CheckCircle2 },
      cancelled: { color: "text-slate-500 bg-slate-50", icon: XCircle },
      failed: { color: "text-red-600 bg-red-50", icon: AlertCircle },
    };
    const config = configs[s] || { color: "text-slate-600 bg-slate-50", icon: AlertCircle };
    const Icon = config.icon;
    return (
      <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider", config.color)}>
        <Icon size={12} />
        {status.replace(/_/g, " ")}
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600"></div>
      <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">Loading Order Details...</p>
    </div>
  );

  if (error || !order) return (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
      <div className="bg-red-50 rounded-full p-10 w-fit mx-auto mb-6">
        <XCircle className="h-16 w-16 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Error</h2>
      <p className="text-slate-500 font-medium mb-8">{error || "Order not found"}</p>
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={() => router.push("/profile/orders")} className="rounded-full px-8 py-6 font-black border-slate-200">
          Back to Orders
        </Button>
        <Button onClick={fetchOrder} className="rounded-full bg-blue-600 px-8 py-6 font-black border-none">
          Try Again
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/profile/orders")}
            className="h-10 w-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              Order Details
              {renderOrderStatus(order.status)}
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
              <Hash size={12} /> {order.orderNumber} • <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {order.invoice?.invoiceUrl && (
            <Button 
              variant="outline" 
              onClick={() => window.open(order.invoice?.invoiceUrl, "_blank")}
              className="rounded-full border-slate-100 font-bold gap-2 text-xs bg-white hover:bg-slate-50"
            >
              <Download size={14} /> Download Invoice
            </Button>
          )}
          {isEligibleForCancellation(order.status) && (
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="rounded-full font-black text-xs uppercase tracking-widest px-6 shadow-md shadow-red-100">
                  Cancel Order
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border-none shadow-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-slate-900">Cancel Order</DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">Are you sure you want to cancel Order #{order.orderNumber}? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Reason for cancellation</label>
                    <Select value={cancelReason} onValueChange={setCancelReason}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100">
                        <SelectItem value="Changed my mind">Changed my mind</SelectItem>
                        <SelectItem value="Ordered by mistake">Ordered by mistake</SelectItem>
                        <SelectItem value="Found better price elsewhere">Found better price elsewhere</SelectItem>
                        <SelectItem value="Delayed delivery">Delayed delivery</SelectItem>
                        <SelectItem value="Incorrect shipping details">Incorrect shipping details</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {((order as any).paymentStatus === "paid" || order.payment.status === "paid") && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
                      <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                      <p className="text-xs text-blue-700 font-medium">
                        <strong>Refund Notice:</strong> A full refund of <PriceDisplay amount={order.pricing.total} originalCurrency={order.pricing.currency} /> will be initiated automatically.
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)} className="rounded-full font-bold">Dismiss</Button>
                  <Button variant="destructive" onClick={handleCancelOrder} disabled={!cancelReason || cancelling} className="rounded-full font-black px-8">
                    {cancelling ? "Processing..." : "Confirm Cancellation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Package size={20} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Status</p>
              <p className="text-sm font-black text-slate-900">{order.items.length} Product{order.items.length > 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4"><CreditCard size={20} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Type</p>
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest text-[10px]">{order.orderType.replace(/_/g, ' ')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4"><ShieldCheck size={20} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security</p>
              <p className="text-sm font-black text-slate-900">Verified Order</p>
            </div>
          </div>

          {/* Delivery Timeline */}
          {order.deliveryTracking && order.deliveryTracking.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                <Truck size={20} className="text-blue-600" /> Delivery Tracking
              </h2>
              <div className="relative">
                {order.deliveryTracking.map((tracking, index) => {
                  const isLast = index === order.deliveryTracking!.length - 1;
                  const isDelivered = tracking.status === "delivered";
                  return (
                    <div key={tracking._id || index} className="relative pl-10 pb-10">
                      {!isLast && <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-100" />}
                      <div className={cn("absolute left-0 top-1 h-8 w-8 rounded-lg flex items-center justify-center z-10", isDelivered ? "bg-green-600 text-white shadow-md shadow-green-200" : "bg-blue-600 text-white shadow-md shadow-blue-200")}>
                        {isDelivered ? <CheckCheck size={14} /> : <div className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-slate-900 capitalize">{tracking.status.replace(/_/g, " ")}</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(tracking.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">{tracking.description}</p>
                        {tracking.location && <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1"><MapPin size={10} /> {tracking.location}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
              <Tag size={20} className="text-blue-600" /> Products Ordered
            </h2>
            {order.items.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:border-blue-200 transition-colors">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="relative h-28 w-28 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      {item.productImage ? (
                        <Image src={item.productImage} alt={item.productName} fill className="object-contain p-2" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-200"><Package size={40} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{item.brandName}</p>
                          <h3 className="text-lg font-black text-slate-900 leading-tight">{item.productName}</h3>
                          {item.variantInfo && Object.keys(item.variantInfo).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {Object.entries(item.variantInfo)
                                .filter(([k]) => !["pricePerUnit", "id", "_id", "sku", "image"].includes(k))
                                .map(([k, v]) => (
                                  <div key={k} className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {k}: {String(v)}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-slate-900"><PriceDisplay amount={item.total} originalCurrency={order.pricing.currency} /></p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {item.quantity} × <PriceDisplay amount={item.price} originalCurrency={order.pricing.currency} />
                          </p>
                        </div>
                      </div>

                      {/* Returns/Actions */}
                      <div className="flex flex-wrap items-center gap-3 mt-6">
                        <div className={cn("px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider", item.paymentStatus === "paid" ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400")}>
                          {item.paymentStatus}
                        </div>
                        {item.returnStatus && (
                          <div className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 font-black text-[10px] uppercase tracking-wider">
                            {item.returnType}: {item.returnStatus.replace("_", " ")}
                          </div>
                        )}
                        <div className="flex gap-2 ml-auto">
                          {canReturnItem(order, item) && item.product?.is_returnable && (
                            <Button variant="outline" size="sm" onClick={() => handleReturnClick(item, "RETURN")} className="rounded-full h-10 px-6 font-bold text-xs border-orange-100 text-orange-600 hover:bg-orange-50">
                              <RotateCcw size={14} className="mr-2" /> Return
                            </Button>
                          )}
                          {canReturnItem(order, item) && item.product?.is_replaceable && (
                            <Button variant="outline" size="sm" onClick={() => handleReturnClick(item, "REPLACEMENT")} className="rounded-full h-10 px-6 font-bold text-xs border-blue-100 text-blue-600 hover:bg-blue-50">
                              <RotateCcw size={14} className="mr-2" /> Replace
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bundle Content */}
                  {item.isBundle && item.bundleDetails && (
                    <div className="mt-8 pt-6 border-t border-slate-50">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Inside the Bundle</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {item.bundleDetails.map((bp, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                            <div className="relative h-12 w-12 rounded-xl bg-white border border-slate-50 overflow-hidden shrink-0">
                              <Image src={bp.image || "/placeholder.png"} alt={bp.productName} fill className="object-cover p-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate">{bp.productName}</p>
                              {bp.variantName && <p className="text-[10px] font-bold text-blue-600">{bp.variantName}</p>}
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">×{bp.quantity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-3">
                <Truck size={18} className="text-blue-600" /> Shipping Detail
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-black text-slate-900">{order.shippingAddress.fullName}</p>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed mt-1">{order.shippingAddress.street}</p>
                  <p className="text-xs font-medium text-slate-500">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mt-2">{order.shippingAddress.country}</p>
                </div>
                <div className="pt-4 border-t border-slate-50 space-y-2">
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500"><Phone size={14} className="text-blue-600" /> {order.shippingAddress.phone}</div>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500"><Mail size={14} className="text-blue-600" /> {order.shippingAddress.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-200"><FileText size={120} /></div>
            <h3 className="text-base font-black mb-8 relative z-10 text-slate-900">Order Summary</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span>Subtotal</span>
                <span><PriceDisplay amount={order.pricing.subtotal} originalCurrency={order.pricing.currency} /></span>
              </div>
              {order.pricing.discountAmount > 0 && (
                <div className="flex justify-between text-xs font-black text-green-600 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Tag size={12} /> Discount {order.discountCode ? `(${order.discountCode})` : ""}</span>
                  <span>-<PriceDisplay amount={order.pricing.discountAmount} originalCurrency={order.pricing.currency} /></span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span>Tax (GST)</span>
                <span><PriceDisplay amount={order.pricing.tax} originalCurrency={order.pricing.currency} /></span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span>Shipping</span>
                <span>{order.pricing.shippingCharges > 0 ? <PriceDisplay amount={order.pricing.shippingCharges} originalCurrency={order.pricing.currency} /> : "FREE"}</span>
              </div>
              <Separator className="bg-slate-200 my-4" />
              <div className="flex justify-between items-end">
                <span className="text-sm font-black uppercase tracking-widest text-slate-900">Total Amount</span>
                <span className="text-3xl font-black text-blue-600 leading-none">
                  <PriceDisplay amount={order.pricing.total} originalCurrency={order.pricing.currency} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReturnRequestModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        orderId={order._id}
        orderItemId={selectedItem?.orderItemId}
        productName={selectedItem?.productName}
        productId={selectedItem?.productId}
        currentVariantId={selectedItem?.currentVariantId}
        initialType={selectedItem?.requestType}
        onSuccess={fetchOrder}
      />
    </motion.div>
  );
}
