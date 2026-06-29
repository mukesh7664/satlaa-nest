"use client";
import * as React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as ShippingIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  CheckCircle as CheckMarkIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { getImageUrl } from "@/utils/imageUtils";
import { formatCurrency } from "@/utils/currencyUtils";

import ShiprocketShipmentModal from "@/components/ShiprocketShipmentModal";
import CourierSelectionModal from "@/components/CourierSelectionModal";

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  productType: string;
  brandName: string;
  price: number;
  quantity: number;
  subtotal: number;
  total: number;
  paymentStatus: "pending" | "paid" | "rejected" | "refunded";
  paymentDetails?: {
    method?: string;
    transactionId?: string;
    paidAt?: Date;
    paidAmount?: number;
    paymentNotes?: string;
  };
  rejectionReason?: string;
  rejectedAt?: Date;
  // License info (for software)
  licenseInfo?: {
    licenseKey?: string;
    activationCode?: string;
    validFrom?: Date;
    validUntil?: Date;
    maxUsers?: number;
    downloadLink?: string;
  };
  hsn_code?: string;
  tax_rate?: number;
  tax_amount?: number;

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
  returnStatus?: string;
  returnType?: string;
  // Notes
  notes?: string;
  // Populated product details
  product?: {
    productStructureType: "single" | "bundle";
    icon?: { url: string };
    images?: { url: string }[];
    slug?: string;
    bundleProducts?: any[];
  };
}

interface PaymentHistory {
  id?: string;
  amount: number;
  method: string;
  transactionId?: string;
  paymentDate: string;
  approverName?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

interface DeliveryTracking {
  id?: string;
  status: string;
  description: string;
  location?: string;
  updatedByName?: string;
  timestamp: string;
}

interface DigitalDeliveryHistory {
  id?: string;
  status: string;
  notes?: string;
  updatedByName?: string;
  timestamp: string;
}

interface Order {
  id: string;
  orderNumber: string;
  orderType: string;
  status: string;
  storeId: string;
  currency?: string;
  storefrontUrl?: string;
  items: OrderItem[];
  billingAddress: any;
  shippingAddress?: any;
  pricing: {
    subtotal: number;
    discount: number;
    discountAmount?: number;
    additionalDiscount?: number;
    discountReason?: string;
    tax: number;
    shippingCharges: number;
    total: number;
    currency?: string;
  };
  paymentStatus: string;
  paymentMethod?: string;
  payment?: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string | Date;
    paymentGateway?: string;
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
  paymentHistory?: PaymentHistory[];
  deliveryTracking?: DeliveryTracking[];
  digitalDeliveryHistory?: DigitalDeliveryHistory[];
  archived?: boolean;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: {
      countryCode: string;
      number: string;
    };
  };
  guestEmail?: string;
  guestPhone?: string;
  deliveryMethod?: string;
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  // Discount
  discountCode?: string;
  isDigitalOnly: boolean;
  hasPhysicalProducts: boolean;
  digitalDelivery?: {
    status: string;
    downloadLinks?: string[];
    licenseKeys?: string[];
    activationInstructions?: string;
    completedAt?: string;
    notes?: string;
  };
  createdAt: string;
  shipment?: {
    id: number;
    shiprocketOrderId: string;
    shipmentId: string;
    awbCode?: string;
    courierName?: string;
    labelUrl?: string;
    status: string;
  };
}

export default function OrderDetailsPage() {
  const { orderid } = useParams();
  const router = useRouter();
  const formatPrice = (amount: number, orderCurrency?: string) => {
    const currency = orderCurrency || order?.currency || order?.pricing?.currency || "INR";
    return formatCurrency(amount, currency);
  };
  const { admin } = useAppSelector((state) => state.auth);
  const canEdit =
    admin?.role === "super_admin" ||
    admin?.role === "admin" ||
    admin?.role === "store_admin" ||
    admin?.permissions?.includes("orders.edit");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [addPaymentHistoryDialogOpen, setAddPaymentHistoryDialogOpen] =
    useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [digitalDeliveryDialogOpen, setDigitalDeliveryDialogOpen] =
    useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Expanded states
  const [paymentHistoryExpanded, setPaymentHistoryExpanded] = useState(false);
  const [deliveryTrackingExpanded, setDeliveryTrackingExpanded] =
    useState(false);
  const [digitalDeliveryExpanded, setDigitalDeliveryExpanded] = useState(false);
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(
    new Set()
  );
  const [shiprocketModalOpen, setShiprocketModalOpen] = useState(false);
  const [shiprocketLoading, setShiprocketLoading] = useState(false);
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [availableCouriers, setAvailableCouriers] = useState<any[]>([]);
  const [fetchingCouriers, setFetchingCouriers] = useState(false);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    method: "bank_transfer",
    transactionId: "",
    paidAmount: 0,
    paymentNotes: "",
  });

  const [rejectionReason, setRejectionReason] = useState("");

  const [paymentHistoryForm, setPaymentHistoryForm] = useState({
    amount: 0,
    method: "bank_transfer",
    transactionId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [orderStatusForm, setOrderStatusForm] = useState({
    status: "",
    comment: "",
  });

  const [digitalDeliveryForm, setDigitalDeliveryForm] = useState({
    status: "pending",
    downloadLinks: "",
    licenseKeys: "",
    activationInstructions: "",
    notes: "",
  });

  const [discountForm, setDiscountForm] = useState({
    discount: 0,
    reason: "",
  });

  const [returnForm, setReturnForm] = useState({
    type: "RETURN" as "RETURN" | "REPLACEMENT",
    reason: "",
    customerNotes: "",
  });

  useEffect(() => {
    if (orderid) {
      fetchOrder();
    }
  }, [orderid]);

  useEffect(() => {
    if (order) {
      setOrderStatusForm({
        status: order.status,
        comment: "",
      });
      if (order.digitalDelivery) {
        setDigitalDeliveryForm({
          status: order.digitalDelivery.status || "pending",
          downloadLinks: order.digitalDelivery.downloadLinks?.join(",\n") || "",
          licenseKeys: order.digitalDelivery.licenseKeys?.join(",\n") || "",
          activationInstructions:
            order.digitalDelivery.activationInstructions || "",
          notes: order.digitalDelivery.notes || "",
        });
      }
      setDiscountForm({
        discount: order.pricing.additionalDiscount || 0,
        reason: order.pricing.discountReason || "",
      });
    }
  }, [order]);

  const renderStatusBadge = (status: string) => {
    const baseStatus = status.split(":").pop()?.trim().toLowerCase() || "";
    const configs: Record<string, { color: string; dotColor: string }> = {
      pending: { color: "#b45309", dotColor: "#f59e0b" }, // Amber 700 / 500
      confirmed: { color: "#1d4ed8", dotColor: "#3b82f6" }, // Blue 700 / 500
      processing: { color: "#4338ca", dotColor: "#6366f1" }, // Indigo 700 / 500
      ready_to_ship: { color: "#0e7490", dotColor: "#06b6d4" }, // Cyan 700 / 500
      shipped: { color: "#7e22ce", dotColor: "#a855f7" }, // Purple 700 / 500
      out_for_delivery: { color: "#0f766e", dotColor: "#14b8a6" }, // Teal 700 / 500
      delivered: { color: "#15803d", dotColor: "#22c55e" }, // Green 700 / 500
      completed: { color: "#15803d", dotColor: "#22c55e" }, // Green 700 / 500
      cancelled: { color: "#4b5563", dotColor: "#9ca3af" }, // Gray 600 / 400
      failed: { color: "#b91c1c", dotColor: "#ef4444" }, // Red 700 / 500
      return_requested: { color: "#be123c", dotColor: "#f43f5e" }, // Rose 700 / 500
      replacement_requested: { color: "#be185d", dotColor: "#ec4899" }, // Pink 700 / 500
      returned: { color: "#334155", dotColor: "#64748b" }, // Slate 700 / 500
      refunded: { color: "#047857", dotColor: "#10b981" }, // Emerald 700 / 500
      partially_returned: { color: "#c2410c", dotColor: "#f97316" }, // Orange 700 / 500
      partially_replaced: { color: "#c2410c", dotColor: "#f97316" }, // Orange 700 / 500
      approved: { color: "#1d4ed8", dotColor: "#3b82f6" }, // Blue 700 / 500
      picked_up: { color: "#7e22ce", dotColor: "#a855f7" }, // Purple 700 / 500
      qc_passed: { color: "#0e7490", dotColor: "#06b6d4" }, // Cyan 700 / 500
      rejected: { color: "#b91c1c", dotColor: "#ef4444" }, // Red 700 / 500
    };

    const config = configs[baseStatus] || { color: "#475569", dotColor: "#94a3b8" };

    const isDelivered = baseStatus === "delivered" || baseStatus === "completed" || baseStatus === "returned" || baseStatus === "refunded";
    const isFailed = baseStatus === "failed" || baseStatus === "cancelled" || baseStatus === "rejected";

    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8, bgcolor: "rgba(255,255,255,0.7)", px: 1, py: 0.3, borderRadius: 1, border: '1px solid #e2e8f0' }}>
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: config.dotColor,
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: "11px",
            fontWeight: 700,
            color: config.color,
            display: "flex",
            alignItems: "center",
            gap: 0.3,
          }}
        >
          {status.replace(/_/g, " ").toUpperCase()}
          {isDelivered && (
            <CheckMarkIcon sx={{ fontSize: 13 }} />
          )}
          {isFailed && <ErrorIcon sx={{ fontSize: 13 }} />}
        </Typography>
      </Box>
    );
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/admin/orders/${orderid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }

      const data = await response.json();
      setOrder(data.data || data.order);
    } catch (err: unknown) {
      console.error("Error fetching order:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load order");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === order?.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(order?.items.map((item) => item.id) || []));
    }
  };

  const toggleBundle = (itemId: string) => {
    setExpandedBundles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleMarkAsPaid = () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item");
      return;
    }

    const selectedTotal =
      order?.items
        .filter((item) => selectedItems.has(item.id))
        .reduce((sum, item) => sum + item.total, 0) || 0;

    setPaymentForm((prev) => ({ ...prev, paidAmount: selectedTotal }));
    setPaymentDialogOpen(true);
  };

  const handleMarkAsRejected = () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item");
      return;
    }
    setRejectionDialogOpen(true);
  };

  const handleSubmitPayment = async () => {
    try {
      setSubmitting(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/admin/orders/${orderid}/items/payment`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemIds: Array.from(selectedItems),
            paymentStatus: "paid",
            paymentDetails: {
              method: paymentForm.method,
              transactionId: paymentForm.transactionId,
              paidAmount: paymentForm.paidAmount,
              paymentNotes: paymentForm.paymentNotes,
              paidAt: new Date(),
            },
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update payment status");

      await fetchOrder();
      setPaymentDialogOpen(false);
      setSelectedItems(new Set());
      setPaymentForm({
        method: "bank_transfer",
        transactionId: "",
        paidAmount: 0,
        paymentNotes: "",
      });
      toast.success("Payment status updated successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update payment status");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setSubmitting(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/admin/orders/${orderid}/items/payment`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemIds: Array.from(selectedItems),
            paymentStatus: "rejected",
            rejectionReason,
            rejectedAt: new Date(),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update rejection status");

      await fetchOrder();
      setRejectionDialogOpen(false);
      setSelectedItems(new Set());
      setRejectionReason("");
      toast.success("Items marked as rejected successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to reject items");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPaymentHistory = async () => {
    try {
      setSubmitting(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/admin/orders/${orderid}/payment-history`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentHistoryForm),
        }
      );

      if (!response.ok) throw new Error("Failed to add payment");

      await fetchOrder();
      setAddPaymentHistoryDialogOpen(false);
      setPaymentHistoryForm({
        amount: 0,
        method: "bank_transfer",
        transactionId: "",
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      toast.success("Payment added successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add payment");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async () => {
    try {
      setSubmitting(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/admin/orders/${orderid}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderStatusForm),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      const data = await response.json();
      setOrder(data.data || data.order);
      setStatusDialogOpen(false);
      toast.success("Order status updated successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update order status");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDigitalDelivery = async () => {
    try {
      setSubmitting(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const payload = {
        ...digitalDeliveryForm,
        downloadLinks: digitalDeliveryForm.downloadLinks
          .split("\n")
          .map((link) => link.trim())
          .filter(Boolean),
        licenseKeys: digitalDeliveryForm.licenseKeys
          .split("\n")
          .map((key) => key.trim())
          .filter(Boolean),
      };

      const response = await fetch(
        `${apiUrl}/admin/orders/${orderid}/digital-delivery`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to update digital delivery");

      await fetchOrder();
      setDigitalDeliveryDialogOpen(false);
      toast.success("Digital delivery updated successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update digital delivery");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDiscount = async () => {
    try {
      setSubmitting(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/admin/orders/${orderid}/apply-discount`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(discountForm),
        }
      );

      if (!response.ok) throw new Error("Failed to update discount");

      await fetchOrder();
      setDiscountDialogOpen(false);
      toast.success("Discount updated successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update discount");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleArchive = async () => {
    try {
      setSubmitting(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/admin/orders/${orderid}/archive`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ archived: !order?.archived }),
        }
      );

      if (!response.ok) throw new Error("Failed to toggle archive");

      await fetchOrder();
      toast.success(
        `Order ${!order?.archived ? "archived" : "unarchived"} successfully`
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to toggle archive");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReturnDialog = (type: "RETURN" | "REPLACEMENT") => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item");
      return;
    }
    setReturnForm((prev) => ({ ...prev, type }));
    setReturnDialogOpen(true);
  };

  const handleSubmitReturn = async () => {
    if (!returnForm.reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      setSubmitting(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/return-requests/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-store-id": order?.storeId || "",
        },
        body: JSON.stringify({
          orderId: orderid,
          itemIds: Array.from(selectedItems),
          type: returnForm.type,
          reason: returnForm.reason,
          customerNotes: returnForm.customerNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create return request");
      }

      await fetchOrder();
      setReturnDialogOpen(false);
      setSelectedItems(new Set());
      setReturnForm({ type: "RETURN", reason: "", customerNotes: "" });
      toast.success(
        `${
          returnForm.type === "RETURN" ? "Return" : "Replacement"
        } request created successfully`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to create return request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateShiprocketOrder = async (orderId: string, details: any) => {
    try {
      setShiprocketLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/admin/shiprocket/create-order/${orderId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to push to Shiprocket");
      }

      toast.success("Shipment pushed to Shiprocket successfully!");
      setShiprocketModalOpen(false);
      fetchOrder(); // Refresh order details
    } catch (err: any) {
      console.error("Shiprocket error:", err);
      toast.error(err.message || "Failed to push to Shiprocket");
    } finally {
      setShiprocketLoading(false);
    }
  };

  const handleDownloadLabel = async () => {
    if (!order?.shipment?.shipmentId) {
      toast.error("Shipment ID not found");
      return;
    }

    try {
      setSubmitting(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/admin/shiprocket/generate-label/${order.shipment.shipmentId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to generate label");

      const data = await response.json();
      if (data.label_url) {
        window.open(data.label_url, "_blank");
        toast.success("Label generated successfully!");
      } else {
        throw new Error("Label URL not found in response");
      }
    } catch (err: any) {
      console.error("Download Label error:", err);
      toast.error(err.message || "Failed to download label");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignCourier = async () => {
    if (!order?.shipment?.shiprocketOrderId) {
      toast.error("Shiprocket Order ID not found. Please push to Shiprocket first.");
      return;
    }

    try {
      setFetchingCouriers(true);
      setCourierModalOpen(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/admin/shiprocket/serviceability/${order.shipment.shiprocketOrderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch courier serviceability");
      }

      const data = await response.json();
      // Shiprocket returns available couriers in data.available_courier_companies
      setAvailableCouriers(data.available_courier_companies || []);
    } catch (err: any) {
      console.error("Fetch Serviceability error:", err);
      toast.error(err.message || "Failed to fetch couriers");
      setCourierModalOpen(false);
    } finally {
      setFetchingCouriers(false);
    }
  };

  const handleFinalCourierSelection = async (courierId: number) => {
    if (!order?.shipment?.shipmentId) return;

    try {
      setSubmitting(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/admin/shiprocket/assign-courier/${order.shipment.shipmentId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courier_id: courierId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to assign courier");
      }

      toast.success("Courier assigned and AWB generated!");
      setCourierModalOpen(false);
      fetchOrder(); // Refresh order details
    } catch (err: any) {
      console.error("Assign Courier error:", err);
      toast.error(err.message || "Failed to assign courier");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error || "Order not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => router.push("/orders")} size="small">
            <ArrowBackIcon />
          </IconButton>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Order #{order.orderNumber}
              {order.archived && (
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded border border-slate-200">
                  Archived
                </span>
              )}
              <Box sx={{ ml: 1, display: "inline-flex" }}>
                {renderStatusBadge(order.status)}
              </Box>
            </h1>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={order.archived ? <UnarchiveIcon /> : <ArchiveIcon />}
            onClick={handleToggleArchive}
            disabled={!canEdit}
            size="small"
            sx={{
              textTransform: "none",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            {order.archived ? "Unarchive" : "Archive"}
          </Button>
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/orders/${orderid}/edit`)}
              size="small"
              sx={{
                textTransform: "none",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              Edit
            </Button>
          )}
          {canEdit && !order.shipment && (
            <Button
              variant="contained"
              startIcon={<ShippingIcon />}
              onClick={() => setShiprocketModalOpen(true)}
              size="small"
              sx={{
                bgcolor: "#7352FF",
                "&:hover": {
                  bgcolor: "#5E39FF",
                },
                textTransform: "none",
              }}
            >
              Push to Shiprocket
            </Button>
          )}
          {order.shipment && !order.shipment.awbCode && (
            <Button
              variant="contained"
              startIcon={<ShippingIcon />}
              onClick={handleAssignCourier}
              size="small"
              sx={{
                bgcolor: "#FFB020",
                "&:hover": {
                  bgcolor: "#E69B00",
                },
                textTransform: "none",
              }}
              disabled={submitting}
            >
              Ship Now
            </Button>
          )}
          {order.shipment && order.shipment.awbCode && (
            <Button
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={handleDownloadLabel}
              size="small"
              sx={{
                bgcolor: "#00BA9D",
                "&:hover": {
                  bgcolor: "#00A087",
                },
                textTransform: "none",
              }}
              disabled={submitting}
            >
              Download Label
            </Button>
          )}
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setStatusDialogOpen(true)}
              size="small"
              sx={{
                bgcolor: "var(--primary)",
                "&:hover": {
                  bgcolor: "var(--primary)",
                  filter: "brightness(0.9)",
                },
                textTransform: "none",
              }}
            >
              Update Status
            </Button>
          )}
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={async () => {
                try {
                  setSubmitting(true);
                  const apiUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:5003/api/v1";
                  const token = localStorage.getItem("token");

                  const response = await fetch(
                    `${apiUrl}/admin/invoices/generate/${orderid}`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  if (!response.ok) {
                    const data = await response.json();
                    throw new Error(
                      data.message || "Failed to generate invoice"
                    );
                  }

                  const data = await response.json();
                  toast.success("Invoice generated successfully");
                  // Handle both { id: ... } and { data: { id: ... } } response formats
                  const invoiceId = data?.id || data?.data?.id;
                  if (invoiceId) {
                    router.push(`/invoices/${invoiceId}`);
                  } else {
                    console.error("No invoice ID found in response", data);
                    toast.error("Invoice generated but redirect failed");
                  }
                } catch (err: unknown) {
                  if (err instanceof Error) {
                    toast.error(err.message);
                  } else {
                    toast.error("Failed to generate invoice");
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
              size="small"
              sx={{
                bgcolor: "#10b981", // Emerald-500
                "&:hover": { bgcolor: "#059669" }, // Emerald-600
                textTransform: "none",
              }}
            >
              Create Invoice
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Order Items & Payment */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Items */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-700">Order Items</h2>
              <div className="flex gap-2">
                {selectedItems.size > 0 && canEdit && (
                  <>
                    <Button
                      size="small"
                      onClick={handleMarkAsPaid}
                      sx={{ textTransform: "none", fontSize: "11px" }}
                      color="success"
                    >
                      Mark Paid
                    </Button>
                    <Button
                      size="small"
                      onClick={handleMarkAsRejected}
                      sx={{ textTransform: "none", fontSize: "11px" }}
                      color="error"
                    >
                      Reject
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleOpenReturnDialog("RETURN")}
                      sx={{ textTransform: "none", fontSize: "11px" }}
                      color="warning"
                    >
                      Return
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleOpenReturnDialog("REPLACEMENT")}
                      sx={{ textTransform: "none", fontSize: "11px" }}
                      color="info"
                    >
                      Replace
                    </Button>
                  </>
                )}
              </div>
            </div>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          order.items.length > 0 &&
                          selectedItems.size === order.items.length
                        }
                        indeterminate={
                          selectedItems.size > 0 &&
                          selectedItems.size < order.items.length
                        }
                        onChange={handleSelectAll}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase font-bold text-slate-500">
                        Product
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="text-[11px] uppercase font-bold text-slate-500">
                        HSN
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="text-[11px] uppercase font-bold text-slate-500">
                        Price
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="text-[11px] uppercase font-bold text-slate-500">
                        Tax %
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="text-[11px] uppercase font-bold text-slate-500">
                        Tax Amt
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="text-[11px] uppercase font-bold text-slate-500">
                        Qty
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <span className="text-[11px] uppercase font-bold text-slate-500">
                        Total
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="text-[11px] uppercase font-bold text-slate-500">
                        Status
                      </span>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item, index) => (
                    <React.Fragment key={item.id || index}>
                      <TableRow hover>
                        <TableCell
                          padding="checkbox"
                          sx={{ verticalAlign: "middle" }}
                        >
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {item.product?.slug ? (
                            <a
                              href={order?.storefrontUrl ? `${order.storefrontUrl}/products/${item.product.slug}` : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-3 group no-underline text-inherit hover:opacity-80 transition-opacity"
                            >
                              {/* Product Icon */}
                              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center group-hover:border-blue-300">
                                {item.product?.icon?.url ? (
                                  <img
                                    src={getImageUrl(item.product.icon.url)!}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : item.product?.images?.[0]?.url ? (
                                  <img
                                    src={getImageUrl(item.product.images[0].url)!}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : item.productImage ? (
                                  <img
                                    src={getImageUrl(item.productImage)!}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-lg font-bold text-slate-500">
                                    {item.productName.charAt(0)}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col">
                                <span className="text-[13px] font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                                  {item.productName}
                                </span>
                                {item.variantInfo && (item.variantInfo.planName || item.variantInfo.userType) && (
                                  <div className="mt-0.5">
                                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded shadow-sm">
                                      {item.variantInfo.planName || item.variantInfo.userType}
                                    </span>
                                  </div>
                                )}
                                <span className="text-[11px] text-slate-500 capitalize">
                                  {item.isBundle
                                    ? "Bundle"
                                    : item.variantInfo?.name || item.variantInfo?.title
                                      ? `Variant: ${item.variantInfo.name || item.variantInfo.title}`
                                      : "Single"}
                                </span>

                                {item.isBundle && (
                                    <div
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleBundle(item.id);
                                      }}
                                      className="mt-1 text-[10px] text-blue-600 font-medium hover:underline flex items-center gap-1 w-fit cursor-pointer"
                                    >
                                      {expandedBundles.has(item.id)
                                        ? "Hide contents"
                                        : "View contents"}
                                      {expandedBundles.has(item.id) ? (
                                        <ExpandLessIcon sx={{ fontSize: 12 }} />
                                      ) : (
                                        <ExpandMoreIcon sx={{ fontSize: 12 }} />
                                      )}
                                    </div>
                                  )}
                              </div>
                            </a>
                          ) : (
                            <div className="flex items-start gap-3">
                              {/* Product Icon */}
                              <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                                {item.product?.icon?.url ? (
                                  <img
                                    src={getImageUrl(item.product.icon.url)!}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : item.product?.images?.[0]?.url ? (
                                  <img
                                    src={getImageUrl(item.product.images[0].url)!}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : item.productImage ? (
                                  <img
                                    src={getImageUrl(item.productImage)!}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-lg font-bold text-slate-500">
                                    {(item.productName || 'U').charAt(0)}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col">
                                <a 
                                  href={order?.storefrontUrl ? `${order.storefrontUrl}/products/${item.product?.slug || ''}` : '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="group flex flex-col no-underline text-inherit hover:opacity-80 transition-opacity"
                                >
                                  <span className="text-[13px] font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                                    {item.productName}
                                  </span>
                                  {item.variantInfo && (item.variantInfo.planName || item.variantInfo.userType) && (
                                    <div className="mt-0.5">
                                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded shadow-sm">
                                        {item.variantInfo.planName || item.variantInfo.userType}
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-[11px] text-slate-500 capitalize">
                                    {item.isBundle
                                      ? "Bundle"
                                      : item.variantInfo?.name || item.variantInfo?.title
                                        ? `Variant: ${item.variantInfo.name || item.variantInfo.title}`
                                        : "Single"}
                                  </span>
                                </a>

                                {item.isBundle && (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleBundle(item.id);
                                      }}
                                      className="mt-1 text-[10px] text-blue-600 font-medium hover:underline flex items-center gap-1 w-fit"
                                    >
                                      {expandedBundles.has(item.id)
                                        ? "Hide contents"
                                        : "View contents"}
                                      {expandedBundles.has(item.id) ? (
                                        <ExpandLessIcon sx={{ fontSize: 12 }} />
                                      ) : (
                                        <ExpandMoreIcon sx={{ fontSize: 12 }} />
                                      )}
                                    </button>
                                  )}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell align="right">{item.hsn_code || "-"}</TableCell>
                        <TableCell align="right">
                          <span className="text-[13px] text-slate-600">
                            {formatPrice(item.price || 0, order.currency)}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className="text-[13px] text-slate-600">
                            {item.tax_rate || 0}%
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className="text-[13px] text-slate-600 font-medium">
                            {formatPrice(item.tax_amount || 0, order.currency)}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className="text-[13px] text-slate-600">
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className="text-[13px] font-medium text-slate-700">
                            {formatPrice(item.total || 0, order.currency)}
                          </span>
                        </TableCell>
                        <TableCell align="center">
                          {renderStatusBadge(
                            item.returnStatus
                              ? `${item.returnType}: ${item.returnStatus}`
                              : order.status === "partially_returned" ||
                                order.status === "partially_replaced"
                                ? "DELIVERED"
                                : order.status
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Expanded Bundle Contents Row */}
                      {(item.bundleDetails && item.bundleDetails.length > 0) &&
                        expandedBundles.has(item.id) && (
                          <TableRow sx={{ bgcolor: "#fafafa" }}>
                            <TableCell colSpan={9} sx={{ py: 0, px: 0 }}>
                              <div className="pl-16 pr-4 py-3 border-l-4 border-blue-500 bg-blue-50/20">
                                <p className="text-[10px] uppercase font-black text-blue-600 mb-2 tracking-widest flex items-center gap-1">
                                  <ArchiveIcon sx={{ fontSize: 12 }} /> Bundle Contents:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {item.bundleDetails.map(
                                    (bp: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-3 p-2 bg-white rounded border border-slate-100 shadow-sm"
                                      >
                                        <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                                          {bp.image ? (
                                            <img
                                              src={getImageUrl(bp.image)!}
                                              className="w-full h-full object-cover"
                                              alt=""
                                            />
                                          ) : (
                                            <span className="text-[10px] font-bold text-slate-400">
                                              -
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                          <span className="text-[12px] font-bold text-slate-800 leading-tight truncate">
                                            {bp.productName}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500 font-medium">
                                              Qty: {bp.quantity}
                                            </span>
                                            {bp.variantName && (
                                              <span className="text-[10px] text-blue-600 font-black border-l pl-2 border-slate-200">
                                                {bp.variantName}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
              <div className="flex justify-end">
                <div className="w-64 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal:</span>
                    <span>{formatPrice(order.pricing?.subtotal || 0, order.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax:</span>
                    <span>{formatPrice(order.pricing?.tax || 0, order.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping:</span>
                    <span>{formatPrice(order.pricing?.shippingCharges || 0, order.currency)}</span>
                  </div>
                  {(order.pricing?.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="text-gray-500">
                        Discount {order.discountCode ? `(${order.discountCode})` : ""}
                        :
                      </span>
                      <span>
                        -{formatPrice(order.pricing.discountAmount || 0, order.currency)}
                      </span>
                    </div>
                  )}
                  {(order.pricing.additionalDiscount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="text-gray-500">
                        Additional Discount
                        :
                      </span>
                      <span>
                        -{formatPrice(order.pricing.additionalDiscount || 0, order.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setDiscountDialogOpen(true)}
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {order.pricing.additionalDiscount
                        ? "Edit Discount"
                        : "Add Discount"}
                    </button>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-200 mt-2">
                    <span>Total:</span>
                    <span>{formatPrice(order.pricing.total || 0)}</span>
                  </div>

                  {/* Payment Details in Summary */}
                  {(order.payment?.method || order.paymentMethod) && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                        <span>Payment Method:</span>
                        <span className="font-medium text-slate-700 capitalize">
                          {(order.payment?.method || order.paymentMethod || "").replace("_", " ")}
                        </span>
                      </div>
                      {order.payment?.transactionId && (
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Transaction ID:</span>
                          <span className="font-medium text-slate-700">
                            {order.payment.transactionId}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div
              className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 cursor-pointer"
              onClick={() => setPaymentHistoryExpanded(!paymentHistoryExpanded)}
            >
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ReceiptIcon fontSize="small" className="text-slate-400" />
                Payment History
              </h2>
              <div className="flex items-center gap-2">
              {/* Removed manual add button as requested */}
                {paymentHistoryExpanded ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </div>
            </div>
            {paymentHistoryExpanded && (
              <div className="p-0">
                {(() => {
                  const hasExplicitHistory = order.paymentHistory && order.paymentHistory.length > 0;
                  const isPaid = order.paymentStatus === 'paid' || order.payment?.status === 'paid';
                  
                  // Synthesize a record if no history but order is marked as paid
                  const syntheticHistory = !hasExplicitHistory && isPaid ? [{
                    paymentDate: order.payment?.paidAt || order.createdAt,
                    method: order.payment?.method || order.paymentMethod || 'Razorpay',
                    transactionId: order.payment?.transactionId || '-',
                    amount: order.pricing.total,
                    status: 'paid'
                  }] : [];

                  const displayHistory = hasExplicitHistory ? order.paymentHistory! : syntheticHistory;

                  return displayHistory.length > 0 ? (
                    <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <span className="text-[11px] font-bold text-slate-500">
                            Date
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] font-bold text-slate-500">
                            Method
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] font-bold text-slate-500">
                            Transaction ID
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <span className="text-[11px] font-bold text-slate-500">
                            Amount
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayHistory.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <span className="text-[12px] text-slate-600">
                              {new Date(
                                payment.paymentDate
                              ).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-[12px] text-slate-600 capitalize">
                              {payment.method.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-[12px] text-slate-600">
                              {payment.transactionId || "-"}
                            </span>
                          </TableCell>
                          <TableCell align="right">
                            <span className="text-[12px] font-medium text-slate-700">
                              {formatPrice(payment.amount)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No payment history available.
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Delivery Tracking History */}
          {!order.isDigitalOnly && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div
                className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 cursor-pointer"
                onClick={() =>
                  setDeliveryTrackingExpanded(!deliveryTrackingExpanded)
                }
              >
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ShippingIcon fontSize="small" className="text-slate-400" />
                  Delivery Tracking
                </h2>
                <div className="flex items-center gap-2">
                  {deliveryTrackingExpanded ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </div>
              </div>
              {deliveryTrackingExpanded && (
                <div className="p-0">
                  {order.deliveryTracking &&
                    order.deliveryTracking.length > 0 ? (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <span className="text-[11px] font-bold text-slate-500">
                              Date
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-[11px] font-bold text-slate-500">
                              Status
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-[11px] font-bold text-slate-500">
                              Description
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-[11px] font-bold text-slate-500">
                              Location
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.deliveryTracking.map((track, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <span className="text-[12px] text-slate-600">
                                {new Date(track.timestamp).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-[12px] text-slate-600 capitalize">
                                {track.status.replace("_", " ")}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-[12px] text-slate-600">
                                {track.description}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-[12px] text-slate-600">
                                {track.location || "-"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No tracking history available.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Digital Delivery Info */}
          {(order.isDigitalOnly || order.digitalDelivery) && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div
                className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 cursor-pointer"
                onClick={() =>
                  setDigitalDeliveryExpanded(!digitalDeliveryExpanded)
                }
              >
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <EmailIcon fontSize="small" className="text-slate-400" />
                  Digital Delivery
                </h2>
                <div className="flex items-center gap-2">
                  {/* Icon removed as requested */}
                  {digitalDeliveryExpanded ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </div>
              </div>
              {digitalDeliveryExpanded && (
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Status
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border ${order.digitalDelivery?.status === "completed"
                        ? "bg-green-50 text-green-600 border-green-100"
                        : order.digitalDelivery?.status === "sent"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-yellow-50 text-yellow-600 border-yellow-100"
                        }`}
                    >
                      {order.digitalDelivery?.status?.toUpperCase() ||
                        "PENDING"}
                    </span>
                  </div>
                  {order.digitalDelivery?.downloadLinks &&
                    order.digitalDelivery.downloadLinks.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          Download Links
                        </p>
                        <ul className="list-disc list-inside text-sm text-blue-600">
                          {order.digitalDelivery.downloadLinks.map(
                            (link, i) => (
                              <li key={i}>
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {link}
                                </a>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  {order.digitalDelivery?.licenseKeys &&
                    order.digitalDelivery.licenseKeys.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          License Keys
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-700 font-mono">
                          {order.digitalDelivery.licenseKeys.map((key, i) => (
                            <li key={i}>{key}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Customer & Info */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <PersonIcon fontSize="small" className="text-slate-400" />
                Customer Details
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Name
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {order?.customer
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : order?.billingAddress?.fullName
                      ? order.billingAddress.fullName
                      : order?.billingAddress?.firstName
                        ? `${order.billingAddress.firstName} ${order.billingAddress.lastName || ""}`
                        : order?.guestEmail || "Guest"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Email
                </p>
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <EmailIcon fontSize="inherit" />
                  {order.customer?.email || order.guestEmail}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Phone
                </p>
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <PhoneIcon fontSize="inherit" />
                  {order.customer?.phone
                    ? `${order.customer.phone.countryCode} ${order.customer.phone.number}`
                    : order.guestPhone || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ShippingIcon fontSize="small" className="text-slate-400" />
                  Shipping Address
                </h2>
              </div>
              <div className="p-4 text-sm text-slate-600">
                {order.shippingAddress.street && (
                  <p>{order.shippingAddress.street}</p>
                )}
                {order.shippingAddress.addressLine1 && (
                  <p>{order.shippingAddress.addressLine1}</p>
                )}
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {[
                    order.shippingAddress.city,
                    order.shippingAddress.state,
                    order.shippingAddress.zipCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.shippingAddress.country && (
                  <p>{order.shippingAddress.country}</p>
                )}
              </div>
            </div>
          )}

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ReceiptIcon fontSize="small" className="text-slate-400" />
                  Billing Address
                </h2>
              </div>
              <div className="p-4 text-sm text-slate-600">
                {order.billingAddress.street && (
                  <p>{order.billingAddress.street}</p>
                )}
                {order.billingAddress.addressLine1 && (
                  <p>{order.billingAddress.addressLine1}</p>
                )}
                {order.billingAddress.addressLine2 && (
                  <p>{order.billingAddress.addressLine2}</p>
                )}
                <p>
                  {[
                    order.billingAddress.city,
                    order.billingAddress.state,
                    order.billingAddress.zipCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.billingAddress.country && (
                  <p>{order.billingAddress.country}</p>
                )}
              </div>
            </div>
          )}

          {/* Delivery Information */}
          {(order.courier ||
            order.trackingNumber ||
            order.estimatedDelivery) && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <ShippingIcon fontSize="small" className="text-slate-400" />
                    Delivery Information
                  </h2>
                </div>
                <div className="p-4 space-y-3">
                  {order.courier && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Courier
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {order.courier}
                      </p>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Tracking Number
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Estimated Delivery
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Order Status */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-700">Status</h2>
            </div>
            <div className="p-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${order.status === "finished" ||
                  order.status === "fully_paid" ||
                  order.status === "delivered"
                  ? "bg-green-50 text-green-600 border-green-100"
                  : order.status === "cancelled" || order.status === "failed"
                    ? "bg-red-50 text-red-600 border-red-100"
                    : order.status === "processing" ||
                      order.status === "shipped" ||
                      order.status === "out_for_delivery"
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : "bg-yellow-50 text-yellow-600 border-yellow-100"
                  }`}
              >
                {order?.status?.toUpperCase()?.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs - Kept minimal but functional */}
      {/* Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: "bold" }}>
          Update Order Status
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Status"
            fullWidth
            margin="dense"
            size="small"
            value={orderStatusForm.status}
            onChange={(e) =>
              setOrderStatusForm({ ...orderStatusForm, status: e.target.value })
            }
          >
            <MenuItem value="pending">PENDING</MenuItem>
            <MenuItem value="confirmed">CONFIRMED</MenuItem>
            <MenuItem value="processing">PROCESSING</MenuItem>
            <MenuItem value="ready_to_ship">READY TO SHIP</MenuItem>
            <MenuItem value="shipped">SHIPPED</MenuItem>
            <MenuItem value="out_for_delivery">OUT FOR DELIVERY</MenuItem>
            <MenuItem value="delivered">DELIVERED</MenuItem>
            <MenuItem value="return_requested">RETURN REQUESTED</MenuItem>
            <MenuItem value="replacement_requested">REPLACEMENT REQUESTED</MenuItem>
            <MenuItem value="cancelled">CANCELLED</MenuItem>
            <MenuItem value="returned">RETURNED</MenuItem>
            <MenuItem value="failed">FAILED</MenuItem>
            <MenuItem value="refunded">REFUNDED</MenuItem>
          </TextField>
          {/* Comment field removed as requested */}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setStatusDialogOpen(false)}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateOrderStatus}
            variant="contained"
            size="small"
            disabled={submitting}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: "bold" }}>
          Mark Items as Paid
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="dense"
            size="small"
            value={paymentForm.paidAmount}
            onChange={(e) =>
              setPaymentForm({
                ...paymentForm,
                paidAmount: parseFloat(e.target.value),
              })
            }
          />
          <TextField
            select
            label="Method"
            fullWidth
            margin="dense"
            size="small"
            value={paymentForm.method}
            onChange={(e) =>
              setPaymentForm({ ...paymentForm, method: e.target.value })
            }
          >
            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            <MenuItem value="credit_card">Credit Card</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="upi">UPI</MenuItem>
          </TextField>
          <TextField
            label="Transaction ID"
            fullWidth
            margin="dense"
            size="small"
            value={paymentForm.transactionId}
            onChange={(e) =>
              setPaymentForm({ ...paymentForm, transactionId: e.target.value })
            }
          />
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={2}
            margin="dense"
            size="small"
            value={paymentForm.paymentNotes}
            onChange={(e) =>
              setPaymentForm({ ...paymentForm, paymentNotes: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPaymentDialogOpen(false)}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPayment}
            variant="contained"
            size="small"
            disabled={submitting}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog
        open={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: "bold" }}>
          Reject Items
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Reason"
            fullWidth
            multiline
            rows={3}
            margin="dense"
            size="small"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectionDialogOpen(false)}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRejection}
            variant="contained"
            color="error"
            size="small"
            disabled={submitting}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Payment History Dialog */}
      <Dialog
        open={addPaymentHistoryDialogOpen}
        onClose={() => setAddPaymentHistoryDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: "bold" }}>
          Add Payment Record
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="dense"
            size="small"
            value={paymentHistoryForm.amount}
            onChange={(e) =>
              setPaymentHistoryForm({
                ...paymentHistoryForm,
                amount: parseFloat(e.target.value),
              })
            }
          />
          <TextField
            select
            label="Method"
            fullWidth
            margin="dense"
            size="small"
            value={paymentHistoryForm.method}
            onChange={(e) =>
              setPaymentHistoryForm({
                ...paymentHistoryForm,
                method: e.target.value,
              })
            }
          >
            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            <MenuItem value="credit_card">Credit Card</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="upi">UPI</MenuItem>
          </TextField>
          <TextField
            label="Transaction ID"
            fullWidth
            margin="dense"
            size="small"
            value={paymentHistoryForm.transactionId}
            onChange={(e) =>
              setPaymentHistoryForm({
                ...paymentHistoryForm,
                transactionId: e.target.value,
              })
            }
          />
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="dense"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={paymentHistoryForm.paymentDate}
            onChange={(e) =>
              setPaymentHistoryForm({
                ...paymentHistoryForm,
                paymentDate: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAddPaymentHistoryDialogOpen(false)}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddPaymentHistory}
            variant="contained"
            size="small"
            disabled={submitting}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Digital Delivery Dialog */}
      <Dialog
        open={digitalDeliveryDialogOpen}
        onClose={() => setDigitalDeliveryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: "bold" }}>
          Update Digital Delivery
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Status"
            fullWidth
            margin="dense"
            size="small"
            value={digitalDeliveryForm.status}
            onChange={(e) =>
              setDigitalDeliveryForm({
                ...digitalDeliveryForm,
                status: e.target.value,
              })
            }
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
          <TextField
            label="Download Links (one per line)"
            fullWidth
            multiline
            rows={3}
            margin="dense"
            size="small"
            value={digitalDeliveryForm.downloadLinks}
            onChange={(e) =>
              setDigitalDeliveryForm({
                ...digitalDeliveryForm,
                downloadLinks: e.target.value,
              })
            }
          />
          <TextField
            label="License Keys (one per line)"
            fullWidth
            multiline
            rows={3}
            margin="dense"
            size="small"
            value={digitalDeliveryForm.licenseKeys}
            onChange={(e) =>
              setDigitalDeliveryForm({
                ...digitalDeliveryForm,
                licenseKeys: e.target.value,
              })
            }
          />
          <TextField
            label="Activation Instructions"
            fullWidth
            multiline
            rows={3}
            margin="dense"
            size="small"
            value={digitalDeliveryForm.activationInstructions}
            onChange={(e) =>
              setDigitalDeliveryForm({
                ...digitalDeliveryForm,
                activationInstructions: e.target.value,
              })
            }
          />
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={2}
            margin="dense"
            size="small"
            value={digitalDeliveryForm.notes}
            onChange={(e) =>
              setDigitalDeliveryForm({
                ...digitalDeliveryForm,
                notes: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDigitalDeliveryDialogOpen(false)}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateDigitalDelivery}
            variant="contained"
            size="small"
            disabled={submitting}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog
        open={discountDialogOpen}
        onClose={() => setDiscountDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: "bold" }}>
          {discountForm.discount > 0 ? "Edit Discount" : "Add Manual Discount"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label={`Discount Amount (${order?.currency || "₹"})`}
            type="number"
            fullWidth
            margin="dense"
            size="small"
            value={
              discountForm.discount === 0 ? "" : discountForm.discount
            }
            onChange={(e) =>
              setDiscountForm({
                ...discountForm,
                discount:
                  e.target.value === "" ? 0 : parseFloat(e.target.value),
              })
            }
          />
          {/* Reason field removed as requested */}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDiscountDialogOpen(false)}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateDiscount}
            variant="contained"
            size="small"
            disabled={submitting}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {order && (
        <ShiprocketShipmentModal
          open={shiprocketModalOpen}
          onClose={() => setShiprocketModalOpen(false)}
          onSubmit={handleCreateShiprocketOrder}
          order={order}
          loading={shiprocketLoading}
        />
      )}

      <CourierSelectionModal
        open={courierModalOpen}
        onClose={() => setCourierModalOpen(false)}
        onSelect={handleFinalCourierSelection}
        couriers={availableCouriers}
        loading={fetchingCouriers}
        submitting={submitting}
      />

      {/* Return/Replacement Dialog */}
      <Dialog
        open={returnDialogOpen}
        onClose={() => setReturnDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: "bold" }}>
          {returnForm.type === "RETURN" ? "Request Return" : "Request Replacement"}
        </DialogTitle>
        <DialogContent>
          <div className="py-2 space-y-4">
            <p className="text-[12px] text-slate-500">
              Requesting {returnForm.type.toLowerCase()} for {selectedItems.size} item(s).
            </p>
            <TextField
              label="Reason for Request"
              fullWidth
              multiline
              rows={3}
              margin="dense"
              size="small"
              required
              value={returnForm.reason}
              onChange={(e) =>
                setReturnForm({ ...returnForm, reason: e.target.value })
              }
              placeholder="e.g. Damaged product, Wrong size, etc."
            />
            <TextField
              label="Internal Notes (Optional)"
              fullWidth
              multiline
              rows={2}
              margin="dense"
              size="small"
              value={returnForm.customerNotes}
              onChange={(e) =>
                setReturnForm({ ...returnForm, customerNotes: e.target.value })
              }
              placeholder="Any additional notes..."
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReturnDialogOpen(false)}
            size="small"
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReturn}
            variant="contained"
            size="small"
            disabled={submitting}
            color={returnForm.type === "RETURN" ? "warning" : "info"}
            sx={{ textTransform: "none" }}
          >
            {submitting ? "Submitting..." : `Confirm ${returnForm.type.charAt(0) + returnForm.type.slice(1).toLowerCase()}`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
