"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { settingsApi } from "@/services/settings.api";
import { currencyApi, Currency } from "@/services/currency.api";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  TextField,
  IconButton,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import Image from "next/image";

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  isDefault: boolean;
}


export default function GeneralSettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    siteName: "",
    siteDescription: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    logo: "",
    favicon: "",
    defaultCurrency: "INR",
    supportedCurrencies: ["INR"],
    currencyConfig: {
      rates: {} as Record<string, number>,
      autoSync: true,
    },
    // WhatsApp Button Settings
    whatsappButton: {
      isEnabled: false,
      phoneNumber: "",
      message: "Hello, I would like to know more about your services.",
    },
    showInMarketplace: false,
    // Invoice/Company Settings
    invoiceSettings: {
      companyName: "",
      taxId: "", // GST
      pan: "",
      companyAddress: {
        street: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
      },
      bankDetails: {
        bankName: "",
        accountName: "",
        accountNumber: "",
        ifscCode: "",
        branchName: "",
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);

  // Locations State
  const [locations, setLocations] = useState<Location[]>([]);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationFormData, setLocationFormData] = useState<
    Omit<Location, "id">
  >({
    name: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    isDefault: false,
  });

  const { limits, subscription, loading: limitsLoading } = usePlanLimits();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setFetching(true);
      const [settings, currencies] = await Promise.all([
        settingsApi.getSettings(),
        currencyApi.getSupportedCurrencies(),
      ]);

      if (settings) {
        setFormData((prev) => ({
          ...prev,
          ...settings,
          whatsappButton: settings.whatsappButton || prev.whatsappButton,
          invoiceSettings: {
            ...prev.invoiceSettings,
            ...(settings.invoiceSettings || {}),
            companyAddress: {
              ...prev.invoiceSettings.companyAddress,
              ...(settings.invoiceSettings?.companyAddress || {}),
            },
            bankDetails: {
              ...prev.invoiceSettings.bankDetails,
              ...(settings.invoiceSettings?.bankDetails || {}),
            }
          },
          currencyConfig: settings.currencyConfig || prev.currencyConfig,
          supportedCurrencies: settings.supportedCurrencies || prev.supportedCurrencies,
          defaultCurrency: settings.defaultCurrency || prev.defaultCurrency,
          showInMarketplace: settings.showInMarketplace ?? prev.showInMarketplace,
        }));
        if (settings.locations) setLocations(settings.locations);
      }
      setAvailableCurrencies(currencies);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const data = await settingsApi.getSettings();
      if (data) {
        setFormData((prev) => ({
          ...prev,
          siteName: data.siteName || "",
          siteDescription: data.siteDescription || "",
          contactEmail: data.contactEmail || "",
          contactPhone: data.contactPhone || "",
          address: typeof data.address === 'string' ? data.address : (data.address?.street ? `${data.address.street}, ${data.address.city}` : ""),
          logo: typeof data.siteLogo === 'string' ? data.siteLogo : data.siteLogo?.url || "",
          favicon: typeof data.siteFavicon === 'string' ? data.siteFavicon : data.siteFavicon?.url || "",
          whatsappButton: data.whatsappButton || {
            isEnabled: false,
            phoneNumber: "",
            message: "Hello, I would like to know more about your services.",
          },
        }));
      }
      if (data && data.invoiceSettings) {
        setFormData((prev) => ({
          ...prev,
          invoiceSettings: {
            ...prev.invoiceSettings,
            ...data.invoiceSettings,
            companyAddress: {
              ...prev.invoiceSettings.companyAddress,
              ...(data.invoiceSettings.companyAddress || {}),
            },
            bankDetails: {
              ...prev.invoiceSettings.bankDetails,
              ...(data.invoiceSettings.bankDetails || {}),
            },
          },
        }));
      }
      if (data && data.locations) {
        setLocations(data.locations);
      } else {
        // Default mock data if empty
        setLocations([
          {
            id: "1",
            name: "Main Store",
            address: "123 Commerce St",
            city: "New York",
            country: "USA",
            phone: "+1 234 567 8900",
            isDefault: true,
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    // Type assertion for checkbox since ChangeEvent can be generic
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      whatsappButton: {
        ...prev.whatsappButton,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleInvoiceSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      invoiceSettings: {
        ...prev.invoiceSettings,
        [name]: value,
      },
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      invoiceSettings: {
        ...prev.invoiceSettings,
        companyAddress: {
          ...prev.invoiceSettings.companyAddress,
          [name]: value,
        },
      },
    }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      invoiceSettings: {
        ...prev.invoiceSettings,
        bankDetails: {
          ...prev.invoiceSettings.bankDetails,
          [name]: value,
        },
      },
    }));
  };

  const handleSaveLocations = async (updatedLocations: Location[]) => {
    try {
      await settingsApi.updateSettings({ locations: updatedLocations });
      setLocations(updatedLocations);
      toast.success("Locations updated successfully");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save locations");
    }
  };

  const handleOpenLocationDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setLocationFormData({
        name: location.name,
        address: location.address,
        city: location.city,
        country: location.country,
        phone: location.phone,
        isDefault: location.isDefault,
      });
    } else {
      setEditingLocation(null);
      setLocationFormData({
        name: "",
        address: "",
        city: "",
        country: "",
        phone: "",
        isDefault: false,
      });
    }
    setOpenLocationDialog(true);
  };

  const handleLocationSubmit = async () => {
    if (!locationFormData.name || !locationFormData.address) {
      toast.error("Name and Address are required");
      return;
    }

    let updatedLocations = [...locations];

    if (editingLocation) {
      updatedLocations = updatedLocations.map((loc) =>
        loc.id === editingLocation.id ? { ...loc, ...locationFormData } : loc
      );
    } else {
      updatedLocations.push({
        id: Date.now().toString(),
        ...locationFormData,
      });
    }

    // Handle default location logic
    if (locationFormData.isDefault) {
      updatedLocations = updatedLocations.map((loc) => ({
        ...loc,
        isDefault:
          loc.id ===
          (editingLocation?.id ||
            updatedLocations[updatedLocations.length - 1].id),
      }));
    }

    setLoading(true);
    await handleSaveLocations(updatedLocations);
    setLoading(false);
    setOpenLocationDialog(false);
  };

  const handleLocationDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      const updatedLocations = locations.filter((loc) => loc.id !== id);
      await handleSaveLocations(updatedLocations);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setLoading(true);
      const payload = {
        ...formData,
        locations,
        supportedCurrencies: formData.supportedCurrencies,
        defaultCurrency: formData.defaultCurrency,
        currencyConfig: formData.currencyConfig,
      };
      await settingsApi.updateSettings(payload);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Save failed:", error);
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
    <>
      <style>
        {`
          .MuiOutlinedInput-root {
            border-radius: 8px !important;
          }
        `}
      </style>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6 text-slate-800 pb-12">
        {/* Header Panel */}
        <div className="flex justify-between items-center pb-2">
          <div>
            <h1 className="text-xl font-bold text-slate-800">General Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your site&apos;s identity and company information
            </p>
          </div>
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            size="small"
            startIcon={loading ? undefined : <SaveIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              py: 0.75,
              fontWeight: 600,
              fontSize: "12px",
              bgcolor: "#408dfb",
              "&:hover": { bgcolor: "#337bdf" }
            }}
          >
            {loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

        {/* Two-Column Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Card 1: Store Profile & Identity */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                Store Identity
              </h2>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Site Name
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    name="siteName"
                    value={formData.siteName}
                    onChange={handleChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Site Description
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    name="siteDescription"
                    value={formData.siteDescription}
                    onChange={handleChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>

                {/* Logo & Favicon Upload Grid */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                    <ShopifyImagePicker
                      label="Logo Image"
                      value={formData.logo || ""}
                      onChange={(url) =>
                        setFormData((prev) => ({
                          ...prev,
                          logo: url,
                        }))
                      }
                    />
                  </div>
                  <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                    <ShopifyImagePicker
                      label="Favicon"
                      value={formData.favicon || ""}
                      onChange={(url) =>
                        setFormData((prev) => ({
                          ...prev,
                          favicon: url,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Contact Information */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Contact Email
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Contact Phone
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Store Address
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Integrations & Currencies */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                Integrations & Currencies
              </h2>

              {/* WhatsApp Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    WhatsApp Integration
                  </span>
                  <FormControlLabel
                    control={
                      <Switch
                        name="isEnabled"
                        checked={formData.whatsappButton.isEnabled}
                        onChange={handleWhatsAppChange}
                        color="primary"
                        size="small"
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                </div>

                {formData.whatsappButton.isEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-150 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500">
                        Phone Number
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        name="phoneNumber"
                        value={formData.whatsappButton.phoneNumber}
                        onChange={handleWhatsAppChange}
                        placeholder="e.g., 919876543210"
                        sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500">
                        Default Message
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        name="message"
                        value={formData.whatsappButton.message}
                        onChange={handleWhatsAppChange}
                        sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Currencies & Marketplace */}
              {subscription?.plan?.category === 'ecommerce' && (
                <div className="space-y-4 border-t border-slate-100 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500">
                        Base Currency
                      </label>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        name="defaultCurrency"
                        value={formData.defaultCurrency}
                        onChange={handleChange}
                        SelectProps={{ native: true }}
                        sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                      >
                        {availableCurrencies.map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.name} ({curr.code})
                          </option>
                        ))}
                      </TextField>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500">
                        Supported Currencies
                      </label>
                      <div className="flex flex-wrap gap-1 p-1.5 bg-slate-50 border border-slate-200 rounded-md min-h-[38px] items-center">
                        {availableCurrencies.map((curr) => (
                          <FormControlLabel
                            key={curr.code}
                            control={
                              <Switch
                                size="small"
                                checked={formData.supportedCurrencies.includes(curr.code)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFormData(prev => ({
                                    ...prev,
                                    supportedCurrencies: checked
                                      ? [...prev.supportedCurrencies, curr.code]
                                      : prev.supportedCurrencies.filter(c => c !== curr.code && c !== prev.defaultCurrency)
                                  }));
                                }}
                                disabled={curr.code === formData.defaultCurrency}
                              />
                            }
                            label={<span className="text-[9px] font-bold text-slate-600">{curr.code}</span>}
                            sx={{ m: 0, '& .MuiFormControlLabel-label': { ml: 0.5 } }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-xs font-bold text-slate-700">
                        Global Marketplace
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Feature your store and selected products on the global marketplace.
                      </p>
                    </div>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.showInMarketplace}
                          onChange={(e) => setFormData(prev => ({ ...prev, showInMarketplace: e.target.checked }))}
                          color="primary"
                          size="small"
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Card 4: Business Details & Address */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                Business & Billing Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Company Name
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    name="companyName"
                    value={formData.invoiceSettings.companyName}
                    onChange={handleInvoiceSettingChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">
                    GST / Tax ID
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    name="taxId"
                    value={formData.invoiceSettings.taxId}
                    onChange={handleInvoiceSettingChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">
                    PAN Number
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    name="pan"
                    value={formData.invoiceSettings.pan}
                    onChange={handleInvoiceSettingChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Company Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] text-slate-500">Street Address</label>
                    <TextField
                      size="small"
                      fullWidth
                      name="street"
                      value={formData.invoiceSettings.companyAddress?.street || ""}
                      onChange={handleAddressChange}
                      sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-500">City</label>
                    <TextField
                      size="small"
                      fullWidth
                      name="city"
                      value={formData.invoiceSettings.companyAddress?.city || ""}
                      onChange={handleAddressChange}
                      sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-500">State</label>
                    <TextField
                      size="small"
                      fullWidth
                      name="state"
                      value={formData.invoiceSettings.companyAddress?.state || ""}
                      onChange={handleAddressChange}
                      sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] text-slate-500">Pincode</label>
                    <TextField
                      size="small"
                      fullWidth
                      name="pincode"
                      value={formData.invoiceSettings.companyAddress?.pincode || ""}
                      onChange={handleAddressChange}
                      sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Settlement Bank Details */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                Settlement Bank Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Bank Name
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    name="bankName"
                    value={formData.invoiceSettings.bankDetails?.bankName || ""}
                    onChange={handleBankChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Account Name
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    name="accountName"
                    value={formData.invoiceSettings.bankDetails?.accountName || ""}
                    onChange={handleBankChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Account Number
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    name="accountNumber"
                    value={formData.invoiceSettings.bankDetails?.accountNumber || ""}
                    onChange={handleBankChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500">
                    IFSC Code
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    name="ifscCode"
                    value={formData.invoiceSettings.bankDetails?.ifscCode || ""}
                    onChange={handleBankChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500">
                    Branch Name
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    name="branchName"
                    value={formData.invoiceSettings.bankDetails?.branchName || ""}
                    onChange={handleBankChange}
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: 13 } }}
                  />
                </div>
              </div>
            </div>

            {/* Card 6: Business Locations */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-slate-800">
                  Business Locations
                </h2>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleOpenLocationDialog()}
                  startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    textTransform: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "11px",
                    py: 0.5
                  }}
                >
                  Add New
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="bg-slate-50 rounded-lg border border-slate-200 p-3 relative group"
                  >
                    <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconButton
                        onClick={() => handleOpenLocationDialog(location)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleLocationDelete(location.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#408dfb] flex-shrink-0">
                        <LocationIcon sx={{ fontSize: 14 }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-800">
                            {location.name}
                          </h4>
                          {location.isDefault && (
                            <span className="px-1 py-0.2 bg-green-100 text-green-700 text-[8px] font-bold rounded-full uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {location.address}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium">
                          {location.city}, {location.country}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {locations.length === 0 && (
                  <div className="col-span-full text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <LocationIcon className="text-slate-300 mb-1" sx={{ fontSize: 20 }} />
                    <p className="text-slate-400 text-[10px] font-bold uppercase">
                      No locations defined
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Location Dialog */}
      <Dialog
        open={openLocationDialog}
        onClose={() => setOpenLocationDialog(false)}
        PaperProps={{
          className: "rounded-xl w-full max-w-md",
        }}
      >
        <DialogTitle className="font-semibold text-base border-b border-slate-100 py-3">
          {editingLocation ? "Edit Location" : "Add Location"}
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Name</label>
              <TextField
                fullWidth
                size="small"
                value={locationFormData.name}
                onChange={(e) =>
                  setLocationFormData({
                    ...locationFormData,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., Main Store"
                sx={{ bgcolor: "white" }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Address</label>
              <TextField
                fullWidth
                size="small"
                value={locationFormData.address}
                onChange={(e) =>
                  setLocationFormData({
                    ...locationFormData,
                    address: e.target.value,
                  })
                }
                sx={{ bgcolor: "white" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">City</label>
                <TextField
                  fullWidth
                  size="small"
                  value={locationFormData.city}
                  onChange={(e) =>
                    setLocationFormData({
                      ...locationFormData,
                      city: e.target.value,
                    })
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Country</label>
                <TextField
                  fullWidth
                  size="small"
                  value={locationFormData.country}
                  onChange={(e) =>
                    setLocationFormData({
                      ...locationFormData,
                      country: e.target.value,
                    })
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Phone</label>
              <TextField
                fullWidth
                size="small"
                value={locationFormData.phone}
                onChange={(e) =>
                  setLocationFormData({
                    ...locationFormData,
                    phone: e.target.value,
                  })
                }
                sx={{ bgcolor: "white" }}
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <FormControlLabel
                control={
                  <Switch
                    checked={locationFormData.isDefault}
                    onChange={(e) =>
                      setLocationFormData({
                        ...locationFormData,
                        isDefault: e.target.checked,
                      })
                    }
                    color="primary"
                    size="small"
                  />
                }
                label={<span className="text-xs font-medium text-slate-700">Set as Default Location</span>}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4 pt-2 border-t border-slate-100">
          <Button
            onClick={() => setOpenLocationDialog(false)}
            size="small"
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLocationSubmit}
            variant="contained"
            disabled={loading}
            size="small"
            sx={{
              textTransform: "none",
              bgcolor: "#408dfb",
              "&:hover": { bgcolor: "#337bdf" },
              boxShadow: "none"
            }}
          >
            {loading ? "Saving..." : "Save Location"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
