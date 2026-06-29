"use client";

import React, { useEffect, useState } from "react";
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { Box, Button, TextField, IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { toast } from "sonner";
import {
  emailSettingsService,
  EmailSettings,
} from "@/services/emailSettings.service";

const EmailSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: 465,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
  });
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await emailSettingsService.getSettings();
      // API returns settings directly or nested depending on implementation
      // Based on controller it returns settings.emailSettings directly
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch email settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === "smtpPort" ? Number(value) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await emailSettingsService.updateSettings(settings);
      toast.success("Email settings updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update email settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address to test");
      return;
    }
    setTesting(true);
    try {
      await emailSettingsService.testConnection(settings, testEmail);
      toast.success(`Test email sent to ${testEmail}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send test email. Check your configuration.");
    } finally {
      setTesting(false);
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
    <>
      <style>
        {`
          .MuiOutlinedInput-root {
            border-radius: 8px !important;
          }
        `}
      </style>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Email Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure SMTP settings for sending emails
        </p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 2xl:gap-6">
          {/* Main Settings Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 2xl:p-6 text-slate-800">
              <h2 className="text-base 2xl:text-lg font-bold text-slate-800 mb-4 2xl:mb-6">
                SMTP Settings
              </h2>
              <form onSubmit={handleSave} className="space-y-4 2xl:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 2xl:gap-6">
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                      SMTP Host
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      name="smtpHost"
                      value={settings.smtpHost || ""}
                      onChange={handleChange}
                      placeholder="e.g., smtp.gmail.com"
                      sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                      SMTP Port
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      name="smtpPort"
                      value={settings.smtpPort || ""}
                      onChange={handleChange}
                      placeholder="e.g., 465"
                      sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
                  <div className="space-y-1">
                    <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                      SMTP User
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      name="smtpUser"
                      value={settings.smtpUser || ""}
                      onChange={handleChange}
                      sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                      SMTP Password
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      type={showPassword ? "text" : "password"}
                      name="smtpPassword"
                      value={settings.smtpPassword || ""}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff sx={{ fontSize: { xs: 16, '2xl': 20 } }} />
                              ) : (
                                <Visibility sx={{ fontSize: { xs: 16, '2xl': 20 } }} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
                  <div className="space-y-1">
                    <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                      From Email
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      name="fromEmail"
                      value={settings.fromEmail || ""}
                      onChange={handleChange}
                      placeholder="e.g., noreply@example.com"
                      sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                      From Name
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      name="fromName"
                      value={settings.fromName || ""}
                      onChange={handleChange}
                      placeholder="e.g., Store Support"
                      sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 2xl:pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    variant="contained"
                    size="small"
                    startIcon={saving ? null : <SaveIcon sx={{ fontSize: { xs: 16, '2xl': 20 } }} />}
                    sx={{ textTransform: "none", borderRadius: "8px", px: 4, py: 1, fontWeight: 700, fontSize: { xs: 12, '2xl': 14 } }}
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Test Connection Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 2xl:p-6 sticky top-6 text-slate-800">
              <h2 className="text-base 2xl:text-lg font-bold text-slate-800 mb-1 2xl:mb-2">
                Test Connection
              </h2>
              <p className="text-[11px] 2xl:text-sm text-slate-500 mb-4 2xl:mb-6 font-medium">
                Verify your SMTP configuration.
              </p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                    Recipient Email
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email address"
                    sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
                  />
                </div>

                <Button
                  onClick={handleTestConnection}
                  disabled={testing || !testEmail}
                  variant="outlined"
                  fullWidth
                  size="small"
                  startIcon={testing ? null : <SendIcon sx={{ fontSize: { xs: 16, '2xl': 20 } }} />}
                  sx={{ textTransform: "none", borderRadius: "8px", py: 1, fontWeight: 700, fontSize: { xs: 12, '2xl': 14 } }}
                >
                  {testing ? "Sending..." : "Send Test Email"}
                </Button>
              </div>
            </div>
          </div>
        </div>
    </div>
    </>
  );
};

export default EmailSettingsPage;
