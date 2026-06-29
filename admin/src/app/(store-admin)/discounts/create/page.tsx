"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  TextField,
  MenuItem,
  Alert,
  InputAdornment,
} from "@mui/material";
import { DiscountType, ApplyTo, discountsApi } from "@/services/discounts.api";

export default function CreateDiscountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "", // Optional
    description: "",
    type: DiscountType.PERCENTAGE,
    value: "",
    min_order_value: "0",
    max_discount_cap: "",
    usage_limit: "",
    per_user_limit: "1",
    buy_qty: "",
    get_qty: "",
    apply_to: ApplyTo.ALL_ORDERS,
    starts_at: new Date().toISOString().slice(0, 16), // Format to YYYY-MM-DDTHH:MM for datetime-local
    ends_at: "",
    is_active: true,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Discount name is required");
      return;
    }
    if (formData.type !== DiscountType.FREE_SHIPPING && !formData.value) {
      toast.error("Discount value is required");
      return;
    }
    if (!formData.starts_at) {
      toast.error("Start date is required");
      return;
    }
    if (!formData.ends_at) {
      toast.error("End date is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        code: formData.code ? formData.code.toUpperCase() : undefined,
        value: formData.type === DiscountType.FREE_SHIPPING ? 0 : Number(formData.value),
        min_order_value: Number(formData.min_order_value),
        max_discount_cap: formData.max_discount_cap ? Number(formData.max_discount_cap) : undefined,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : undefined,
        per_user_limit: Number(formData.per_user_limit),
        buy_qty: formData.buy_qty ? Number(formData.buy_qty) : undefined,
        get_qty: formData.get_qty ? Number(formData.get_qty) : undefined,
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: new Date(formData.ends_at).toISOString(),
      };

      await discountsApi.createDiscount(payload as any);
      toast.success("Discount created successfully");
      router.push("/discounts");
    } catch (error: any) {
      console.error("Error creating discount:", error);
      toast.error(error.message || "Error creating discount");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 font-sans bg-slate-50 min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <IconButton
              onClick={() => router.back()}
              sx={{
                bgcolor: "white",
                border: "1px solid",
                borderColor: "slate.200",
                "&:hover": { bgcolor: "slate.50" },
              }}
              size="small"
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Create New Discount
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Set up automatic discounts or custom codes for your store
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outlined"
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                borderColor: "#e2e8f0",
                color: "#475569",
                bgcolor: "white",
                fontWeight: 500,
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              startIcon={loading ? null : <SaveIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                bgcolor: "#7B3FF2",
                fontWeight: 500,
                boxShadow: "none",
                px: 3.5,
                py: 1,
                "&:hover": { bgcolor: "#6930d9", boxShadow: "none" },
              }}
            >
              {loading ? "Creating..." : "Save Discount"}
            </Button>
          </div>
        </div>

        {/* Logic Alert */}
        <Alert
          severity="info"
          icon={<InfoIcon fontSize="small" />}
          sx={{
            borderRadius: "8px",
            border: "1px solid #bae6fd",
            bgcolor: "#f0f9ff",
            color: "#0369a1",
            "& .MuiAlert-icon": { color: "#0284c7" },
          }}
        >
          If <strong>Discount Code</strong> is left empty, the discount will be applied <strong>automatically</strong> to all eligible carts.
        </Alert>

        {/* Form Layout - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Core Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-md font-semibold text-slate-800 border-b border-slate-100 pb-2">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Discount Name <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    required
                    fullWidth
                    size="small"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Holi Dhamaka Sale"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Discount Code (Optional)
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      value={formData.code}
                      onChange={(e) =>
                        handleChange("code", e.target.value.toUpperCase())
                      }
                      placeholder="e.g., HOLI50"
                      helperText="Leave empty for automatic application"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Apply To
                    </label>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={formData.apply_to}
                      onChange={(e) => handleChange("apply_to", e.target.value)}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    >
                      <MenuItem value={ApplyTo.ALL_ORDERS}>All Orders</MenuItem>
                      <MenuItem value={ApplyTo.SPECIFIC_PRODUCTS}>
                        Specific Products
                      </MenuItem>
                      <MenuItem value={ApplyTo.SPECIFIC_CATEGORIES}>
                        Specific Categories
                      </MenuItem>
                      <MenuItem value={ApplyTo.CUSTOMER_LOYALTY}>
                        Loyal Customers Only
                      </MenuItem>
                    </TextField>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Description
                  </label>
                  <TextField
                    fullWidth
                    multiline
                    rows={2.5}
                    size="small"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Provide details about this discount offer for reference..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </div>
              </div>
            </div>

            {/* Discount Configuration */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-md font-semibold text-slate-800 border-b border-slate-100 pb-2">
                Discount Configuration
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <TextField
                      select
                      required
                      fullWidth
                      size="small"
                      value={formData.type}
                      onChange={(e) => handleChange("type", e.target.value)}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    >
                      <MenuItem value={DiscountType.PERCENTAGE}>
                        Percentage (%)
                      </MenuItem>
                      <MenuItem value={DiscountType.FIXED_AMOUNT}>
                        Fixed Amount (₹)
                      </MenuItem>
                      <MenuItem value={DiscountType.FREE_SHIPPING}>
                        Free Shipping
                      </MenuItem>
                      <MenuItem value={DiscountType.BOGO}>
                        Buy X Get Y Free (BOGO)
                      </MenuItem>
                      <MenuItem value={DiscountType.BUY_X_GET_Y_PERCENT}>
                        Buy X Get Y% Off
                      </MenuItem>
                    </TextField>
                  </div>

                  {formData.type !== DiscountType.FREE_SHIPPING && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">
                        Value <span className="text-red-500">*</span>
                      </label>
                      <TextField
                        type="number"
                        required
                        fullWidth
                        size="small"
                        value={formData.value}
                        onChange={(e) => handleChange("value", e.target.value)}
                        placeholder={
                          formData.type === DiscountType.PERCENTAGE ? "10" : "100"
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {formData.type === DiscountType.PERCENTAGE ? "%" : "₹"}
                            </InputAdornment>
                          ),
                        }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.type === DiscountType.PERCENTAGE && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">
                        Max Discount Cap (Optional)
                      </label>
                      <TextField
                        type="number"
                        fullWidth
                        size="small"
                        value={formData.max_discount_cap}
                        onChange={(e) =>
                          handleChange("max_discount_cap", e.target.value)
                        }
                        placeholder="e.g., 200"
                        helperText={
                          formData.max_discount_cap
                            ? `Discount limited to ₹${formData.max_discount_cap} max`
                            : "Unlimited"
                        }
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                      />
                    </div>
                  )}

                  {(formData.type === DiscountType.BOGO ||
                    formData.type === DiscountType.BUY_X_GET_Y_PERCENT) && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">
                          Buy Quantity <span className="text-red-500">*</span>
                        </label>
                        <TextField
                          type="number"
                          required
                          fullWidth
                          size="small"
                          value={formData.buy_qty}
                          onChange={(e) => handleChange("buy_qty", e.target.value)}
                          placeholder="2"
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">
                          Get Quantity <span className="text-red-500">*</span>
                        </label>
                        <TextField
                          type="number"
                          required
                          fullWidth
                          size="small"
                          value={formData.get_qty}
                          onChange={(e) => handleChange("get_qty", e.target.value)}
                          placeholder="1"
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Rules & Validity */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-md font-semibold text-slate-800 border-b border-slate-100 pb-2">
                Status
              </h2>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_active}
                    onChange={(e) => handleChange("is_active", e.target.checked)}
                    color="primary"
                    sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#7B3FF2" } }}
                  />
                }
                label={
                  <span className="text-sm font-medium text-slate-700">
                    Active (Ready for checkout)
                  </span>
                }
              />
            </div>

            {/* Validation Rules */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-md font-semibold text-slate-800 border-b border-slate-100 pb-2">
                Validation Rules
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Minimum Order Value (₹)
                  </label>
                  <TextField
                    type="number"
                    fullWidth
                    size="small"
                    value={formData.min_order_value}
                    onChange={(e) => handleChange("min_order_value", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Per User Limit
                  </label>
                  <TextField
                    type="number"
                    fullWidth
                    size="small"
                    value={formData.per_user_limit}
                    onChange={(e) => handleChange("per_user_limit", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Total Usage Limit (Optional)
                  </label>
                  <TextField
                    type="number"
                    fullWidth
                    size="small"
                    value={formData.usage_limit}
                    onChange={(e) => handleChange("usage_limit", e.target.value)}
                    placeholder="e.g., 100"
                    helperText="Total uses allowed across all customers"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  />
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-md font-semibold text-slate-800 border-b border-slate-100 pb-2">
                Validity Period
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Starts At <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    type="datetime-local"
                    required
                    fullWidth
                    size="small"
                    value={formData.starts_at}
                    onChange={(e) => handleChange("starts_at", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    InputLabelProps={{ shrink: true }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Ends At <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    type="datetime-local"
                    required
                    fullWidth
                    size="small"
                    value={formData.ends_at}
                    onChange={(e) => handleChange("ends_at", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
