"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  MenuItem,
} from "@mui/material";
import {
  Send as SendIcon,
  PictureAsPdf as PdfIcon,
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { getImageUrl } from "@/utils/imageUtils";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { admin } = useAppSelector((state) => state.auth);
  const canEdit =
    admin?.role === "super_admin" ||
    admin?.role === "admin" ||
    admin?.role === "store_admin" ||
    admin?.permissions?.includes("invoices.edit");

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: "bank_transfer",
    transactionId: "",
    notes: "",
  });
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(
    new Set()
  );

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

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/admin/invoices/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInvoice(response.data.data);
      setPaymentData({ ...paymentData, amount: response.data.data.amountDue });
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to fetch invoice details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const handleSend = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/admin/invoices/${params.id}/send`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Invoice sent successfully!");
      fetchInvoice();
    } catch (error) {
      toast.error("Failed to send invoice");
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/admin/invoices/${params.id}/generate-pdf`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Open S3 URL directly
      window.open(response.data.data.pdfUrl, "_blank");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleAddPayment = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/admin/invoices/${params.id}/payments`,
        paymentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Payment added successfully!");
      setPaymentDialog(false);
      fetchInvoice();
    } catch (error) {
      toast.error("Failed to add payment");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress size={32} className="text-slate-400" />
      </div>
    );
  }

  if (!invoice)
    return (
      <div className="p-6 text-center text-slate-500">Invoice not found</div>
    );

  return (
    <div className="p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => router.push("/invoices")} size="small">
            <ArrowBackIcon />
          </IconButton>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Invoice #{invoice.invoiceNumber}
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wide ${invoice.status === "paid"
                    ? "bg-green-50 text-green-600 border-green-100"
                    : invoice.status === "partially_paid"
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : invoice.status === "overdue"
                        ? "bg-red-50 text-red-600 border-red-100"
                        : invoice.status === "sent"
                          ? "bg-purple-50 text-purple-600 border-purple-100"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
              >
                {invoice.status.replace("_", " ")}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(invoice.invoiceDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/invoices/${params.id}/edit`)}
              size="small"
              sx={{
                textTransform: "none",
                borderColor: "slate.300",
                color: "slate.700",
              }}
            >
              Edit
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<PdfIcon />}
            onClick={handleGeneratePDF}
            size="small"
            sx={{
              textTransform: "none",
              borderColor: "slate.300",
              color: "slate.700",
            }}
          >
            PDF
          </Button>
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              onClick={handleSend}
              size="small"
              sx={{ textTransform: "none" }}
            >
              Send
            </Button>
          )}
          {invoice.amountDue > 0 && canEdit && (
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={() => setPaymentDialog(true)}
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
              Add Payment
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <DescriptionIcon fontSize="small" className="text-slate-400" />
                Items
              </h2>
            </div>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                  <TableCell
                    sx={{
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Product
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Qty
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    HSN
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Price
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    GST (%)
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    GST Amt
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: "#64748b",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item: any) => (
                  <React.Fragment key={item._id}>
                    <TableRow hover>
                      <TableCell>
                        {item.product?.slug ? (
                          <a
                            href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/products/${item.product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 group no-underline text-inherit hover:opacity-80 transition-opacity"
                          >
                            {/* Product Icon */}
                            <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center group-hover:border-blue-300">
                              {item.product?.icon?.url ? (
                                <img
                                  src={getImageUrl(item.product.icon.url)!}
                                  alt={item.productName || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              ) : item.product?.images?.[0]?.url ? (
                                <img
                                  src={getImageUrl(item.product.images[0].url)!}
                                  alt={item.productName || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              ) : item.productImage ? (
                                <img
                                  src={getImageUrl(item.productImage)!}
                                  alt={item.productName || item.productTitle || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-bold text-slate-500">
                                  {(item.productName || item.productTitle)?.charAt(0) || "P"}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                                {item.productName || item.productTitle || "Untitled Product"}
                              </span>
                              <span className="text-[11px] text-slate-500 capitalize">
                                {item.product?.productStructureType === "bundle"
                                  ? "Bundle"
                                  : "Single"}
                              </span>

                              {/* Bundle Details Trigger */}
                              {item.product?.productStructureType ===
                                "bundle" &&
                                item.product.bundleProducts &&
                                item.product.bundleProducts.length > 0 && (
                                  <div
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleBundle(item._id);
                                    }}
                                    className="mt-1 text-[10px] text-blue-600 font-medium hover:underline flex items-center gap-1 w-fit cursor-pointer"
                                  >
                                    {expandedBundles.has(item._id)
                                      ? "Hide contents"
                                      : "View contents"}
                                    {expandedBundles.has(item._id) ? (
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
                                  alt={item.productName || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              ) : item.product?.images?.[0]?.url ? (
                                <img
                                  src={getImageUrl(item.product.images[0].url)!}
                                  alt={item.productName || "Product"}
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
                                  {(item.productName || item.productTitle)?.charAt(0) || "P"}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-slate-700">
                                {item.productName || item.productTitle || "Untitled Product"}
                              </span>
                              <span className="text-[11px] text-slate-500 capitalize">
                                {item.product?.productStructureType === "bundle"
                                  ? "Bundle"
                                  : "Single"}
                              </span>

                              {/* Bundle Details Trigger */}
                              {item.product?.productStructureType ===
                                "bundle" &&
                                item.product.bundleProducts &&
                                item.product.bundleProducts.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleBundle(item._id);
                                    }}
                                    className="mt-1 text-[10px] text-blue-600 font-medium hover:underline flex items-center gap-1 w-fit"
                                  >
                                    {expandedBundles.has(item._id)
                                      ? "Hide contents"
                                      : "View contents"}
                                    {expandedBundles.has(item._id) ? (
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
                      <TableCell align="right">
                        <span className="text-sm text-slate-600">
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <span className="text-sm text-slate-600">
                          {item.hsn_code || "-"}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <span className="text-sm text-slate-600">
                          ₹{item.price.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <span className="text-sm text-slate-600">
                          {(item as any).tax_rate || 0}%
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <span className="text-sm text-slate-600 font-medium">
                          ₹{((item as any).tax_amount || 0).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <span className="text-sm font-medium text-slate-700">
                          ₹{item.total.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Bundle Contents Row */}
                    {item.product?.productStructureType === "bundle" &&
                      item.product.bundleProducts &&
                      item.product.bundleProducts.length > 0 &&
                      expandedBundles.has(item._id) && (
                        <TableRow sx={{ bgcolor: "#fafafa" }}>
                          <TableCell colSpan={7} sx={{ py: 0, px: 0 }}>
                            <div className="pl-[72px] pr-4 py-3 border-t border-slate-100 shadow-inner bg-slate-50/50">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Bundle Contents
                                </span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {item.product.bundleProducts.map(
                                  (bp: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-3 bg-white p-2 rounded border border-slate-100"
                                    >
                                      {/* Bundle Item Icon */}
                                      <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                                        {bp.product?.icon?.url ? (
                                          <img
                                            src={getImageUrl(bp.product.icon.url)!}
                                            className="w-full h-full object-cover"
                                            alt=""
                                          />
                                        ) : bp.product?.images?.[0]?.url ? (
                                          <img
                                            src={getImageUrl(bp.product.images[0].url)!}
                                            className="w-full h-full object-cover"
                                            alt=""
                                          />
                                        ) : (
                                          <span className="text-xs font-bold text-slate-400">
                                            {bp.product?.productInfo?.title?.charAt(0) || "P"}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-medium text-slate-700 truncate block">
                                            {bp.product?.slug ? (
                                              <a
                                                href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/products/${bp.product.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-blue-600 transition-colors"
                                              >
                                                {bp.product?.productInfo?.title}
                                              </a>
                                            ) : (
                                              bp.product?.productInfo?.title
                                            )}
                                          </span>
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                                            x{bp.quantity}
                                          </span>
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

            {/* Totals Section */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{invoice.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Tax:</span>
                    <span>₹{invoice.pricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-200">
                    <span>Total:</span>
                    <span>₹{invoice.pricing.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-600 pt-1">
                    <span>Paid:</span>
                    <span>₹{invoice.amountPaid.toFixed(2)}</span>
                  </div>
                  <div
                    className={`flex justify-between text-sm font-bold pt-1 ${invoice.amountDue > 0 ? "text-red-600" : "text-green-600"
                      }`}
                  >
                    <span>Due:</span>
                    <span>₹{invoice.amountDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
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
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  Name
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {invoice.customer.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  Email
                </p>
                <p className="text-sm text-slate-600">
                  {invoice.customer.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  Phone
                </p>
                <p className="text-sm text-slate-600">
                  {invoice.customer.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Address */}
          {invoice.customer.address && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <PersonIcon fontSize="small" className="text-slate-400" />
                  Customer Address
                </h2>
              </div>
              <div className="p-4 text-sm text-slate-600">
                {invoice.customer.address.street && (
                  <p>{invoice.customer.address.street}</p>
                )}
                <p>
                  {invoice.customer.address.city &&
                    `${invoice.customer.address.city}, `}
                  {invoice.customer.address.state &&
                    `${invoice.customer.address.state} `}
                  {invoice.customer.address.pincode &&
                    invoice.customer.address.pincode}
                </p>
                {invoice.customer.address.country && (
                  <p>{invoice.customer.address.country}</p>
                )}
              </div>
            </div>
          )}

          {/* Dates Info */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <EventIcon fontSize="small" className="text-slate-400" />
                Dates
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Invoice Date</span>
                <span className="text-sm text-slate-600">
                  {new Date(invoice.invoiceDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Due Date</span>
                <span className="text-sm font-medium text-red-600">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MoneyIcon fontSize="small" className="text-slate-400" />
                  Payment History
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {invoice.payments.map((payment: any, index: number) => (
                  <div key={index} className="p-3 hover:bg-slate-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">
                        ₹{payment.amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 capitalize">
                        {payment.method.replace("_", " ")}
                      </span>
                      {payment.transactionId && (
                        <span className="text-xs text-slate-400 font-mono">
                          {payment.transactionId}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 600 }}>
          Add Payment
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            <TextField
              label="Amount"
              type="number"
              value={paymentData.amount}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  amount: parseFloat(e.target.value),
                })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Payment Method"
              select
              value={paymentData.method}
              onChange={(e) =>
                setPaymentData({ ...paymentData, method: e.target.value })
              }
              fullWidth
              size="small"
            >
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="online">Online Payment</MenuItem>
            </TextField>
            <TextField
              label="Transaction ID"
              value={paymentData.transactionId}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  transactionId: e.target.value,
                })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Notes"
              multiline
              rows={2}
              value={paymentData.notes}
              onChange={(e) =>
                setPaymentData({ ...paymentData, notes: e.target.value })
              }
              fullWidth
              size="small"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPaymentDialog(false)}
            size="small"
            sx={{ color: "slate.500" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddPayment}
            variant="contained"
            size="small"
            sx={{ textTransform: "none" }}
          >
            Add Payment
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
