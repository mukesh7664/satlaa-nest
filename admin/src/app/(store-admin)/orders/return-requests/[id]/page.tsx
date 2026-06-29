"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Typography,
  Chip,
  Box,
  TextField,
  CircularProgress,
  IconButton,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  ArrowBack as ArrowLeftIcon,
  Inventory as PackageIcon,
  Person as UserIcon,
  CreditCard as CreditCardIcon,
  Info as InfoIcon,
  Launch as ExternalLinkIcon,
  CheckCircle as CheckMarkIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import Link from "next/link";

const STATUS_FLOW = [
  "PENDING",
  "APPROVED",
  "PICKED_UP",
  "QC_PASSED",
  "REJECTED",
];

export default function ReturnRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState(0);
  const [addToInventory, setAddToInventory] = useState(true);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const data = await apiService.get(`/return-requests/${id}`);
      setRequest(data);
      setStatus(data.status);
      setAdminNotes(data.adminNotes || "");
      setRefundAmount(Number(data.refundAmount));
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      await apiService.patch(`/return-requests/${id}/status`, {
        status,
        adminNotes,
        refundAmount: Number(refundAmount),
        addToInventory,
      });
      toast.success("Request updated successfully");
      fetchRequest();
    } catch (err: any) {
      toast.error(err.message || "Failed to update request");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const baseStatus = status.split(":").pop()?.trim().toLowerCase() || "";
    const configs: Record<string, { color: string; dotColor: string }> = {
      pending: { color: "#b45309", dotColor: "#f59e0b" }, // Amber 700 / 500
      approved: { color: "#1d4ed8", dotColor: "#3b82f6" }, // Blue 700 / 500
      picked_up: { color: "#7e22ce", dotColor: "#a855f7" }, // Purple 700 / 500
      qc_passed: { color: "#0e7490", dotColor: "#06b6d4" }, // Cyan 700 / 500
      completed: { color: "#15803d", dotColor: "#22c55e" }, // Green 700 / 500
      rejected: { color: "#b91c1c", dotColor: "#ef4444" }, // Red 700 / 500
    };

    const config = configs[baseStatus] || { color: "#475569", dotColor: "#94a3b8" };
    const isSuccess = baseStatus === "completed" || baseStatus === "approved" || baseStatus === "qc_passed";
    const isError = baseStatus === "rejected";

    return (
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "rgba(255,255,255,0.8)", px: 1.5, py: 0.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: config.dotColor,
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 700,
            color: config.color,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {status.replace(/_/g, " ").toUpperCase()}
          {isSuccess && (
            <CheckMarkIcon sx={{ fontSize: 16 }} />
          )}
          {isError && <ErrorIcon sx={{ fontSize: 16 }} />}
        </Typography>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-[60vh]">
        <CircularProgress />
      </Box>
    );
  }

  if (!request) {
    return (
      <Box className="p-6 text-center">
        <Typography variant="h6">Request not found</Typography>
        <Button onClick={() => router.back()} sx={{ mt: 4 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => router.back()}>
            <ArrowLeftIcon />
          </IconButton>
          <div>
            <Typography variant="h5" fontWeight="bold">Return Request Details</Typography>
            <Typography variant="body2" color="textSecondary">
              Ref: #{request.id.slice(0, 8)} | Order #{request.order?.orderNumber}
            </Typography>
          </div>
        </div>
        {renderStatusBadge(request.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Paper className="p-6 rounded-xl border border-slate-200 shadow-sm">
            <Typography variant="h6" className="flex items-center gap-2 mb-4">
              <PackageIcon className="text-blue-600" />
              Product & Request Info
            </Typography>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex-1">
                  <Typography variant="subtitle1" fontWeight="bold">{request.orderItem?.productName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    SKU: {request.orderItem?.sku || "N/A"} | Qty: {request.orderItem?.quantity}
                  </Typography>
                  <Typography variant="subtitle2" className="mt-2">
                    Item Total: ₹{request.orderItem?.totalPrice}
                  </Typography>
                </div>
                <Chip label={request.type} variant="outlined" size="small" />
              </div>

              {request.type === 'REPLACEMENT' && request.replacementVariantInfo && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Typography variant="caption" className="text-blue-700 font-bold uppercase tracking-wider">
                    Requested Replacement
                  </Typography>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {request.replacementVariantInfo.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        SKU: {request.replacementVariantInfo.sku || "N/A"}
                      </Typography>
                    </div>
                    <div className="text-right">
                      <Typography variant="subtitle1" fontWeight="bold" className="text-blue-700">
                        ₹0.00
                      </Typography>
                      <Typography variant="caption" className="block text-gray-400 line-through">
                        ₹{request.replacementVariantInfo.price}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="caption" color="textSecondary">Reason</Typography>
                  <Typography variant="body2" fontWeight="medium" color="error">{request.reason}</Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">Request Date</Typography>
                  <Typography variant="body2" fontWeight="medium">{new Date(request.createdAt).toLocaleString()}</Typography>
                </div>
              </div>

              <div>
                <Typography variant="caption" color="textSecondary">Customer Notes</Typography>
                <Box className="p-3 bg-slate-50 rounded border text-sm italic mt-1">
                  {request.customerNotes || "No notes provided by customer."}
                </Box>
              </div>

              {request.images && request.images.length > 0 && (
                <div className="space-y-3">
                  <Typography variant="caption" color="textSecondary" fontWeight="bold">Provided Proof</Typography>
                  <div className="flex flex-wrap gap-4">
                    {request.images.map((img: string, idx: number) => (
                      <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="relative group">
                        <img
                          src={img}
                          alt={`Proof ${idx + 1}`}
                          className="w-32 h-32 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Paper>

          <Paper className="p-6 rounded-xl border border-slate-200 shadow-sm">
            <Typography variant="h6" className="flex items-center gap-2 mb-4">
              <UserIcon className="text-blue-600" />
              Customer & Order Details
            </Typography>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Typography variant="caption" color="textSecondary">Customer</Typography>
                <Typography variant="subtitle2" fontWeight="bold">{request.customer?.name}</Typography>
                <Typography variant="body2">{request.customer?.email}</Typography>
                <Typography variant="body2">{request.customer?.phone}</Typography>
                <Link href={`/orders/${request.orderId}`}>
                  <Button variant="text" size="small" className="mt-2 lowercase">
                    View full order
                  </Button>
                </Link>
              </div>
              <div className="text-right space-y-1">
                <Typography variant="caption" color="textSecondary">Shipping Address</Typography>
                <Typography variant="body2" fontWeight="bold">{request.order?.shippingAddress?.name}</Typography>
                <Typography variant="body2">{request.order?.shippingAddress?.addressLine1}</Typography>
                <Typography variant="body2">{request.order?.shippingAddress?.city}, {request.order?.shippingAddress?.state}</Typography>
                <Typography variant="body2">{request.order?.shippingAddress?.postalCode}</Typography>
              </div>
            </div>
          </Paper>
        </div>

        {/* Status Update Sidebar */}
        <div className="space-y-6">
          <Paper className="p-6 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
            <Typography variant="h6" className="mb-1">Update Status</Typography>
            <Typography variant="caption" color="textSecondary" className="block mb-6">Actions taken here are permanent.</Typography>

            <div className="space-y-6">
              <FormControl fullWidth size="small">
                <InputLabel>Current Status</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={request.status === 'COMPLETED'}
                  label="Current Status"
                >
                  {STATUS_FLOW.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {status === 'QC_PASSED' && (
                <Box className="space-y-4 p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase">
                    <InfoIcon sx={{ fontSize: 16 }} />
                    Final Action Required
                  </div>

                  {request.type === 'RETURN' && (
                    <TextField
                      fullWidth
                      size="small"
                      label="Refund Amount (₹)"
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(Number(e.target.value))}
                      helperText={`Original: ₹${request.orderItem?.totalPrice}`}
                    />
                  )}

                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={addToInventory}
                        onChange={(e) => setAddToInventory(e.target.checked)}
                      />
                    }
                    label={<Typography variant="body2">Add back to inventory?</Typography>}
                  />

                  <Typography variant="caption" className="block text-orange-600 bg-orange-50 p-2 rounded">
                    {request.type === 'RETURN'
                      ? "QC Pass will automatically trigger a refund via the payment gateway."
                      : "QC Pass will automatically create a new FREE replacement order."}
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Admin Notes"
                placeholder="Details about the decision, QC results..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                size="small"
                variant="outlined"
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleUpdate}
                disabled={isUpdating || request.status === 'COMPLETED' || (status === request.status && adminNotes === (request.adminNotes || ""))}
                sx={{
                  bgcolor: "var(--primary)",
                  textTransform: "none",
                  borderRadius: "8px",
                  py: 1.2
                }}
              >
                {isUpdating ? <CircularProgress size={24} /> : "Update Request"}
              </Button>
            </div>
          </Paper>

          {request.newOrderId && (
            <Paper className="p-4 rounded-xl border border-green-200 bg-green-50/30">
              <Typography variant="subtitle2" className="flex items-center gap-2 text-green-800">
                <CreditCardIcon sx={{ fontSize: 18 }} />
                Replacement Order
              </Typography>
              <Link href={`/orders/${request.newOrderId}`}>
                <Button variant="text" size="small" className="mt-2 text-green-700 font-bold p-0">
                  View Replacement Order <ExternalLinkIcon sx={{ fontSize: 14, ml: 0.5 }} />
                </Button>
              </Link>
            </Paper>
          )}
        </div>
      </div>
    </Box>
  );
}
