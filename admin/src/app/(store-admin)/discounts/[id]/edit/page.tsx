"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { Button, IconButton, TextField, MenuItem, Alert, InputAdornment, CircularProgress } from "@mui/material";
import { DiscountType, ApplyTo, discountsApi, Discount } from "@/services/discounts.api";

export default function EditDiscountPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
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
    starts_at: "",
    ends_at: "",
    is_active: true,
  });

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const discount = await discountsApi.getDiscountById(id as string);
        setFormData({
          name: discount.name,
          code: discount.code || "",
          description: discount.description || "",
          type: discount.type,
          value: discount.value.toString(),
          min_order_value: discount.min_order_value.toString(),
          max_discount_cap: discount.max_discount_cap?.toString() || "",
          usage_limit: discount.usage_limit?.toString() || "",
          per_user_limit: discount.per_user_limit.toString(),
          buy_qty: discount.buy_qty?.toString() || "",
          get_qty: discount.get_qty?.toString() || "",
          apply_to: discount.apply_to,
          starts_at: new Date(discount.starts_at).toISOString().slice(0, 16),
          ends_at: new Date(discount.ends_at).toISOString().slice(0, 16),
          is_active: discount.is_active,
        });
      } catch (error: any) {
        toast.error("Failed to fetch discount details");
        router.push("/discounts");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [id, router]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        code: formData.code ? formData.code.toUpperCase() : null,
        value: Number(formData.value),
        min_order_value: Number(formData.min_order_value),
        max_discount_cap: formData.max_discount_cap ? Number(formData.max_discount_cap) : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        per_user_limit: Number(formData.per_user_limit),
        buy_qty: formData.buy_qty ? Number(formData.buy_qty) : null,
        get_qty: formData.get_qty ? Number(formData.get_qty) : null,
        starts_at: new Date(formData.starts_at).toISOString(),
        ends_at: new Date(formData.ends_at).toISOString(),
      };

      await discountsApi.updateDiscount(id as string, payload as any);
      toast.success("Discount updated successfully");
      router.push("/discounts");
    } catch (error: any) {
      console.error("Error updating discount:", error);
      toast.error(error.message || "Error updating discount");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <IconButton
            onClick={() => router.back()}
            sx={{ color: "text.secondary" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <h1 className="text-2xl font-bold text-slate-800">
            Edit Discount
          </h1>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <Alert severity="info" icon={<InfoIcon fontSize="inherit" />}>
              Updates will apply to all future cart calculations.
            </Alert>

            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Discount Name <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    required
                    fullWidth
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    sx={{ bgcolor: "white" }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Discount Code (Optional)
                  </label>
                  <TextField
                    fullWidth
                    value={formData.code}
                    onChange={(e) =>
                      handleChange("code", e.target.value.toUpperCase())
                    }
                    sx={{ bgcolor: "white" }}
                    helperText="Leave empty for automatic application"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Apply To
                  </label>
                  <TextField
                    select
                    fullWidth
                    value={formData.apply_to}
                    onChange={(e) => handleChange("apply_to", e.target.value)}
                    sx={{ bgcolor: "white" }}
                  >
                    <MenuItem value={ApplyTo.ALL_ORDERS}>All Orders</MenuItem>
                    <MenuItem value={ApplyTo.SPECIFIC_PRODUCTS}>Specific Products</MenuItem>
                    <MenuItem value={ApplyTo.SPECIFIC_CATEGORIES}>Specific Categories</MenuItem>
                    <MenuItem value={ApplyTo.CUSTOMER_LOYALTY}>Loyal Customers Only</MenuItem>
                  </TextField>
                </div>
              </div>
            </div>

            {/* Discount Configuration */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">
                Discount Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    select
                    required
                    fullWidth
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    sx={{ bgcolor: "white" }}
                  >
                    <MenuItem value={DiscountType.PERCENTAGE}>Percentage (%)</MenuItem>
                    <MenuItem value={DiscountType.FIXED_AMOUNT}>Fixed Amount (₹)</MenuItem>
                    <MenuItem value={DiscountType.FREE_SHIPPING}>Free Shipping</MenuItem>
                    <MenuItem value={DiscountType.BOGO}>Buy X Get Y Free (BOGO)</MenuItem>
                    <MenuItem value={DiscountType.BUY_X_GET_Y_PERCENT}>Buy X Get Y% Off</MenuItem>
                  </TextField>
                </div>

                {formData.type !== DiscountType.FREE_SHIPPING && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Value <span className="text-red-500">*</span>
                    </label>
                    <TextField
                      type="number"
                      required
                      fullWidth
                      value={formData.value}
                      onChange={(e) => handleChange("value", e.target.value)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">{formData.type === DiscountType.PERCENTAGE ? "%" : "₹"}</InputAdornment>,
                      }}
                      sx={{ bgcolor: "white" }}
                    />
                  </div>
                )}

                {(formData.type === DiscountType.BOGO || formData.type === DiscountType.BUY_X_GET_Y_PERCENT) && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">
                        Buy Quantity <span className="text-red-500">*</span>
                      </label>
                      <TextField
                        type="number"
                        required
                        fullWidth
                        value={formData.buy_qty}
                        onChange={(e) => handleChange("buy_qty", e.target.value)}
                        sx={{ bgcolor: "white" }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">
                        Get Quantity <span className="text-red-500">*</span>
                      </label>
                      <TextField
                        type="number"
                        required
                        fullWidth
                        value={formData.get_qty}
                        onChange={(e) => handleChange("get_qty", e.target.value)}
                        sx={{ bgcolor: "white" }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Validity */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">
                Validity & Limits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Starts At <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    type="datetime-local"
                    required
                    fullWidth
                    value={formData.starts_at}
                    onChange={(e) => handleChange("starts_at", e.target.value)}
                    sx={{ bgcolor: "white" }}
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Ends At <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    type="datetime-local"
                    required
                    fullWidth
                    value={formData.ends_at}
                    onChange={(e) => handleChange("ends_at", e.target.value)}
                    sx={{ bgcolor: "white" }}
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outlined"
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                variant="contained"
                startIcon={<SaveIcon fontSize="small" />}
                sx={{ bgcolor: "#408dfb", '&:hover': { bgcolor: '#357abd' } }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
