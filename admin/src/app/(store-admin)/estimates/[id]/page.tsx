"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Send as SendIcon,
  PictureAsPdf as PdfIcon,
  SwapHoriz as ConvertIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Event as EventIcon,
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

export default function EstimateDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { admin } = useAppSelector((state) => state.auth);
  const canEdit =
    admin?.role === "super_admin" ||
    admin?.role === "admin" ||
    admin?.role === "store_admin" ||
    admin?.permissions?.includes("estimates.edit");

  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const fetchEstimate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/admin/estimates/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEstimate(response.data.data);
    } catch (error) {
      console.error("Error fetching estimate:", error);
      toast.error("Failed to fetch estimate details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id && params.id !== "undefined") {
      fetchEstimate();
    } else {
      setLoading(false);
    }
  }, [params.id]);

  const handleSend = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/admin/estimates/${params.id}/send`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Estimate sent successfully!");
      fetchEstimate();
    } catch (error) {
      toast.error("Failed to send estimate");
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/admin/estimates/${params.id}/generate-pdf`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Open S3 URL directly
      window.open(response.data.data.pdfUrl, "_blank");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleConvertToOrder = async () => {
    if (!confirm("Convert this estimate to an order?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/admin/estimates/${params.id}/convert`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Estimate converted to order successfully!");
      router.push(`/orders/${response.data.data.order.id}`);
    } catch (error) {
      toast.error("Failed to convert estimate");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress size={32} className="text-slate-400" />
      </div>
    );
  }

  if (!estimate)
    return (
      <div className="p-6 text-center text-slate-500">Estimate not found</div>
    );

  return (
    <div className="p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => router.push("/estimates")} size="small">
            <ArrowBackIcon />
          </IconButton>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Estimate #{estimate.estimateNumber}
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wide ${estimate.status === "draft"
                  ? "bg-slate-100 text-slate-600 border-slate-200"
                  : estimate.status === "sent"
                    ? "bg-blue-50 text-blue-600 border-blue-100"
                    : estimate.status === "accepted"
                      ? "bg-green-50 text-green-600 border-green-100"
                      : estimate.status === "rejected"
                        ? "bg-red-50 text-red-600 border-red-100"
                        : estimate.status === "expired"
                          ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                          : "bg-purple-50 text-purple-600 border-purple-100"
                  }`}
              >
                {estimate.status}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Created on {new Date(estimate.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/estimates/${params.id}/edit`)}
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
          {estimate.status === "draft" && canEdit && (
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
          {(estimate.status === "sent" ||
            estimate.status === "viewed" ||
            estimate.status === "accepted") &&
            canEdit && (
              <Button
                variant="contained"
                startIcon={<ConvertIcon />}
                onClick={handleConvertToOrder}
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
                Convert to Order
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
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estimate.items.map((item: any) => (
                  <React.Fragment key={item.id}>
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
                                  {item.productName.charAt(0)}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-slate-700">
                                {item.productName}
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
                      <TableCell align="right">
                        <span className="text-[13px] text-slate-600">
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <span className="text-[13px] text-slate-600">
                          ₹{item.price.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <span className="text-[13px] font-medium text-slate-700">
                          ₹{item.total.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Bundle Contents Row */}
                    {item.product?.productStructureType === "bundle" &&
                      item.product.bundleProducts &&
                      item.product.bundleProducts.length > 0 &&
                      expandedBundles.has(item.id) && (
                        <TableRow sx={{ bgcolor: "#fafafa" }}>
                          <TableCell colSpan={4} sx={{ py: 0, px: 0 }}>
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
                                            {bp.product?.productInfo?.title?.charAt(
                                              0
                                            )}
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
                    <span>₹{estimate.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  {estimate.pricing.discount > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Discount:</span>
                      <span>-₹{estimate.pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {estimate.pricing.tax > 0 && (
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Tax:</span>
                      <span>₹{estimate.pricing.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-200">
                    <span>Total:</span>
                    <span>₹{estimate.pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {estimate.notes && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-700">Notes</h2>
              </div>
              <div className="p-4 text-sm text-slate-600">{estimate.notes}</div>
            </div>
          )}
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
                  {estimate.customer.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  Email
                </p>
                <p className="text-sm text-slate-600">
                  {estimate.customer.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  Phone
                </p>
                <p className="text-sm text-slate-600">
                  {estimate.customer.phone || "N/A"}
                </p>
              </div>
              {estimate.customer.company && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    Company
                  </p>
                  <p className="text-sm text-slate-600">
                    {estimate.customer.company}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Address */}
          {estimate.customer.address && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <PersonIcon fontSize="small" className="text-slate-400" />
                  Customer Address
                </h2>
              </div>
              <div className="p-4 text-sm text-slate-600">
                {estimate.customer.address.street && (
                  <p>{estimate.customer.address.street}</p>
                )}
                <p>
                  {estimate.customer.address.city &&
                    `${estimate.customer.address.city}, `}
                  {estimate.customer.address.state &&
                    `${estimate.customer.address.state} `}
                  {estimate.customer.address.pincode &&
                    estimate.customer.address.pincode}
                </p>
                {estimate.customer.address.country && (
                  <p>{estimate.customer.address.country}</p>
                )}
              </div>
            </div>
          )}

          {/* Dates & Status Info */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <EventIcon fontSize="small" className="text-slate-400" />
                Timeline
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Valid Until</span>
                <span className="text-sm font-medium text-slate-700">
                  {new Date(estimate.validUntil).toLocaleDateString()}
                </span>
              </div>
              {estimate.sentAt && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Sent</span>
                  <span className="text-sm text-slate-600">
                    {new Date(estimate.sentAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {estimate.viewedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Viewed</span>
                  <span className="text-sm text-slate-600">
                    {new Date(estimate.viewedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {estimate.convertedToOrder && (
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      router.push(`/orders/${estimate.convertedToOrder}`)
                    }
                    sx={{ textTransform: "none" }}
                  >
                    View Order
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
