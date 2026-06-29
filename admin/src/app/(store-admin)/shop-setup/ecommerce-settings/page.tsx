"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { settingsApi } from "@/services/settings.api";
import { Save as SaveIcon } from "@mui/icons-material";
import { Button, Switch, CircularProgress } from "@mui/material";

export default function EcommerceSettingsPage() {
  const [formData, setFormData] = useState({
    currency: "USD",
    taxRate: 0,
    shippingEnabled: true,
    freeShippingThreshold: 0,
    enableReviews: true,
    enableWishlist: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const data = await settingsApi.getSettings();
      if (data && data.ecommerceSettings) {
        setFormData({
          currency: data.ecommerceSettings.currency || "USD",
          taxRate: data.ecommerceSettings.taxRate || 0,
          shippingEnabled: data.ecommerceSettings.shippingEnabled ?? true,
          freeShippingThreshold:
            data.ecommerceSettings.freeShippingThreshold || 0,
          enableReviews: data.ecommerceSettings.enableReviews ?? true,
          enableWishlist: data.ecommerceSettings.enableWishlist ?? true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await settingsApi.updateSettings({ ecommerceSettings: formData });
      toast.success("Ecommerce settings updated successfully");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Ecommerce Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure your store's general settings
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            startIcon={loading ? undefined : <SaveIcon fontSize="small" />}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm"
                />
              </div>
            </div>

            <div className="border-t border-slate-100"></div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Shipping</h3>
              <div className="flex items-center gap-3">
                <Switch
                  name="shippingEnabled"
                  checked={formData.shippingEnabled}
                  onChange={handleSwitchChange}
                  color="primary"
                />
                <span className="text-sm font-medium text-slate-700">
                  Enable Shipping
                </span>
              </div>

              {formData.shippingEnabled && (
                <div className="space-y-1.5 max-w-md">
                  <label className="block text-sm font-medium text-slate-700">
                    Free Shipping Threshold
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500">
                      $
                    </span>
                    <input
                      type="number"
                      name="freeShippingThreshold"
                      value={formData.freeShippingThreshold}
                      onChange={handleChange}
                      min="0"
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Order amount required for free shipping. Set to 0 to
                    disable.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100"></div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Features</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch
                    name="enableReviews"
                    checked={formData.enableReviews}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Enable Product Reviews
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    name="enableWishlist"
                    checked={formData.enableWishlist}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Enable Wishlist
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
