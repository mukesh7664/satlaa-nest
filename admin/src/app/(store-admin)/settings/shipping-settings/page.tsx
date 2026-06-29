"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { settingsApi } from "@/services/settings.api";
import { shiprocketApi } from "@/services/shiprocket.api";
import {
  Save as SaveIcon,
  LocalShipping as ShippingIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  OfflineBolt as OfflineBoltIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Switch,
  TextField,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";

export default function ShippingSettingsPage() {
  const router = useRouter();
  
  // Settings Form State
  const [isEnabled, setIsEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pickupPincode, setPickupPincode] = useState("");
  const [isConnectionTested, setIsConnectionTested] = useState(true);
  
  // UI Control State
  const [showPassword, setShowPassword] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  // Connection Test Status
  const [testResult, setTestResult] = useState<{
    status: "idle" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const config = await shiprocketApi.getConfig();
      
      if (config) {
        setIsEnabled(config.isEnabled ?? false);
        setEmail(config.email || "");
        setPassword(config.password || "");
        setPickupPincode(config.pickupPincode || "");
        setIsConnectionTested(!!config.email && !!config.password);
      } else {
        setIsConnectionTested(false);
      }
    } catch (error) {
      console.error("Failed to load shipping settings:", error);
      toast.error("Failed to load shipping settings");
    } finally {
      setFetching(false);
    }
  };

  const handleTestConnection = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password to test connection");
      return;
    }

    setTesting(true);
    setTestResult({ status: "idle", message: "" });

    try {
      const response = await shiprocketApi.testConnection(email, password);
      if (response.success) {
        setTestResult({
          status: "success",
          message: response.message || "Connection successful! Credentials are valid.",
        });
        setIsConnectionTested(true);
        toast.success("Shiprocket credentials verified successfully!");
      } else {
        setTestResult({
          status: "error",
          message: response.message || "Connection failed. Please check your credentials.",
        });
        setIsConnectionTested(false);
        toast.error("Shiprocket credentials verification failed");
      }
    } catch (error: any) {
      console.error("Test connection failed:", error);
      const errMsg = error.response?.data?.message || error.message || "Authentication failed.";
      setTestResult({
        status: "error",
        message: `Failed: ${errMsg}`,
      });
      setIsConnectionTested(false);
      toast.error(`Verification Failed: ${errMsg}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        isEnabled,
        email,
        password,
        pickupPincode,
      };

      await shiprocketApi.saveConfig(payload);
      toast.success("Shipping settings updated successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save shipping settings");
    } finally {
      setSaving(false);
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
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShippingIcon className="text-[#408dfb]" sx={{ fontSize: 24 }} />
            Shipping Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Shiprocket integration and setup credentials for your individual store
          </p>
        </div>
      </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Header and Toggle */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-2">
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-slate-800">
                  Shiprocket Credentials
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Toggle to enable or disable Shiprocket orders pushing for your store.
                </p>
              </div>
              <FormControlLabel
                control={
                  <Switch
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    color="primary"
                    size="medium"
                  />
                }
                label={
                  <span className="text-xs font-bold text-slate-700">
                    {isEnabled ? "Enabled" : "Disabled"}
                  </span>
                }
              />
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">
                  Shiprocket Registered Email *
                </label>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  placeholder="e.g. ship@yourbrand.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsConnectionTested(false);
                    setTestResult({ status: "idle", message: "" });
                  }}
                  required={isEnabled}
                  sx={{ bgcolor: "white" }}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">
                  Shiprocket Account Password *
                </label>
                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Shiprocket Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setIsConnectionTested(false);
                    setTestResult({ status: "idle", message: "" });
                  }}
                  required={isEnabled}
                  sx={{ bgcolor: "white" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-500">
                  Default Pickup Pincode (Optional)
                </label>
                <TextField
                  fullWidth
                  size="small"
                  type="text"
                  placeholder="e.g. 110001 (Uses store address if left empty)"
                  value={pickupPincode}
                  onChange={(e) => setPickupPincode(e.target.value)}
                  sx={{ bgcolor: "white" }}
                  inputProps={{ maxLength: 6 }}
                />
              </div>
            </div>

            {/* Test Connection Alert Box */}
            {testResult.status !== "idle" && (
              <div className="pt-2 animate-in fade-in duration-300">
                <Alert
                  severity={testResult.status === "success" ? "success" : "error"}
                  icon={testResult.status === "success" ? <CheckCircleIcon /> : <ErrorIcon />}
                  sx={{ borderRadius: "8px" }}
                >
                  {testResult.message}
                </Alert>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <Button
                  variant="outlined"
                  onClick={handleTestConnection}
                  disabled={testing || saving || !email || !password}
                  startIcon={testing ? <CircularProgress size={16} color="inherit" /> : <OfflineBoltIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 3,
                    fontWeight: 700,
                    borderColor: "#3b82f6", // Beautiful blue border
                    color: "#2563eb",       // Beautiful blue text
                    "&:hover": {
                      borderColor: "#2563eb",
                      bgcolor: "rgba(37, 99, 235, 0.04)",
                    },
                    "&.Mui-disabled": {
                      borderColor: "#e2e8f0",
                      color: "#94a3b8",
                    }
                  }}
                >
                  {testing ? "Testing..." : "Test Connection"}
                </Button>
                {!isConnectionTested && email && password && (
                  <span className="text-[11px] text-amber-600 font-semibold mt-1">
                    ⚠️ Please test the connection to verify your credentials.
                  </span>
                )}
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="contained"
                  type="submit"
                  disabled={saving || testing || (isEnabled && !isConnectionTested)}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 4,
                    fontWeight: 700,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  {saving ? "Saving Changes..." : "Save Settings"}
                </Button>
              </div>
            </div>

          </form>
        </div>

        {/* Webhook Instruction Card */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            💡 Shiprocket Webhook Configuration Instruction
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In order to synchronize shipping statuses (like Shipped, Ready for Dispatch, Out for Delivery, Delivered) automatically to your store in real-time, please copy the webhook URL below and configure it inside your **Shiprocket Dashboard &gt; Settings &gt; Webhooks**:
          </p>
          <div className="bg-slate-200/60 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
            <code className="text-xs font-mono select-all text-slate-800 break-all">
              {`${typeof window !== "undefined" ? window.location.origin.replace("admin.", "api.") : "https://your-api-domain.com"}/api/v1/admin/shiprocket/webhook`}
            </code>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            Note: All events (e.g., shipment status updates) must be routed to this URL for automatic order state management.
          </p>
        </div>

    </div>
    </>
  );
}
