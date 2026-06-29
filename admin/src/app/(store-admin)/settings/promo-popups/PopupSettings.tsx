"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { settingsApi } from "@/services/settings.api";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import { Button, Switch, CircularProgress, TextField } from "@mui/material";

export default function PopupSettings() {
  const [formData, setFormData] = useState({
    isEnabled: false,
    image: { url: "", publicId: "" },
    title: "Stay updated—book your free consultation!",
    subtitle: "",
    triggerTime: 30,
    frequencyDays: 1,
    showOnMobile: true,
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
      if (data && data.popupSettings) {
        setFormData({
          isEnabled: data.popupSettings.isEnabled ?? false,
          image: data.popupSettings.image || { url: "", publicId: "" },
          title:
            data.popupSettings.title ||
            "Stay updated—book your free consultation!",
          subtitle: data.popupSettings.subtitle || "",
          triggerTime: data.popupSettings.triggerTime || 30,
          frequencyDays: data.popupSettings.frequencyDays || 1,
          showOnMobile: data.popupSettings.showOnMobile ?? true,
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await settingsApi.updateSettings({ popupSettings: formData });
      toast.success("Popup settings updated successfully");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center p-8">
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .MuiOutlinedInput-root {
            border-radius: 8px !important;
          }
        `}
      </style>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 2xl:p-6 text-slate-800">
      <div className="mb-4 2xl:mb-6">
        <h2 className="text-base 2xl:text-lg font-bold text-slate-800">
          Contact Popup Settings
        </h2>
        <p className="text-[11px] 2xl:text-sm text-slate-500 mt-0.5">
          Configure the popup that appears after user activity.
        </p>
      </div>

      <div className="border-t border-slate-100 my-4 2xl:my-6"></div>

      <form onSubmit={handleSubmit} className="space-y-4 2xl:space-y-6">
        <div className="flex items-center gap-3">
          <Switch
            name="isEnabled"
            checked={formData.isEnabled}
            onChange={handleSwitchChange}
            color="primary"
            size="small"
          />
          <span className="text-[11px] 2xl:text-sm font-bold text-slate-700">
            Enable Popup
          </span>
        </div>

        <div className="space-y-2">
          <ShopifyImagePicker
            label="Popup Image"
            value={formData.image.url || ""}
            onChange={(url) => {
              const publicId = url.split(".com/")[1] || url;
              setFormData((prev) => ({
                ...prev,
                image: { url, publicId },
              }));
            }}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
            Title
          </label>
          <TextField
            size="small"
            fullWidth
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
          />
          <p className="text-xs text-slate-500">
            The main heading text on the right side.
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
            Subtitle (Optional)
          </label>
          <TextField
            size="small"
            fullWidth
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
              Trigger Time (Seconds)
            </label>
            <TextField
              size="small"
              fullWidth
              type="number"
              name="triggerTime"
              value={formData.triggerTime}
              onChange={handleChange}
              sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
            />
            <p className="text-[10px] text-slate-400 font-medium">
              Time in seconds before showing the popup.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
              Frequency (Days)
            </label>
            <TextField
              size="small"
              fullWidth
              type="number"
              name="frequencyDays"
              value={formData.frequencyDays}
              onChange={handleChange}
              sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
            />
            <p className="text-[10px] text-slate-400 font-medium">
              Days before showing the popup again.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            name="showOnMobile"
            checked={formData.showOnMobile}
            onChange={handleSwitchChange}
            color="primary"
            size="small"
          />
          <span className="text-[11px] 2xl:text-sm font-bold text-slate-700">
            Show on Mobile Devices
          </span>
        </div>

        <div className="pt-2 2xl:pt-4">
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            size="small"
            sx={{ px: { xs: 3, '2xl': 6 }, py: 1, borderRadius: '8px', fontWeight: 700, fontSize: { xs: 12, '2xl': 14 } }}
          >
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
    </>
  );
}
