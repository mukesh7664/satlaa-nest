"use client";

import React, { useState, useEffect } from "react";
import {
  Save as SaveIcon,
  Public as SeoIcon,
  Analytics as AnalyticsIcon,
  Code as CodeIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import {
  settingsApi,
  SEOSettings,
  CustomScripts,
} from "@/services/settings.api";
import { toast } from "sonner";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

export default function SEOSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    siteName: "",
    siteDescription: "",
    keywords: [],
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    metaImage: "",
  });
  const [customScripts, setCustomScripts] = useState<CustomScripts>({
    headerScripts: "",
    footerScripts: "",
  });
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getSEOSettings();

      if (data.seo) {
        setSeoSettings({
          siteName: data.seo.siteName || data.siteName || "",
          siteDescription:
            data.seo.siteDescription || data.siteDescription || "",
          keywords: data.seo.keywords || [],
          googleAnalyticsId: data.seo.googleAnalyticsId || "",
          googleTagManagerId: data.seo.googleTagManagerId || "",
          facebookPixelId: data.seo.facebookPixelId || "",
          metaImage: data.seo.metaImage || "",
        });
      }

      if (data.customScripts) {
        setCustomScripts(data.customScripts);
      }
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      toast.error("Failed to load SEO settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.updateSEOSettings({
        seo: seoSettings,
        customScripts: customScripts,
      });
      toast.success("SEO settings saved successfully!");
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      toast.error("Failed to save SEO settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSEOChange = (
    field: keyof SEOSettings,
    value: string | string[]
  ) => {
    setSeoSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleScriptChange = (field: keyof CustomScripts, value: string) => {
    setCustomScripts((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !seoSettings.keywords.includes(keyword)) {
      setSeoSettings((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keyword],
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setSeoSettings((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keywordToRemove),
    }));
  };
  
  const handleFixAnalyticsId = () => {
    if (seoSettings.googleTagManagerId?.startsWith("G-")) {
      setSeoSettings(prev => ({
        ...prev,
        googleAnalyticsId: prev.googleTagManagerId,
        googleTagManagerId: ""
      }));
      toast.info("ID moved to Google Analytics field. Don't forget to save!");
    }
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddKeyword();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">SEO Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your website&apos;s SEO settings, analytics tracking, and custom scripts
          </p>
        </div>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            size="small"
            startIcon={saving ? undefined : <SaveIcon sx={{ fontSize: { xs: 16, '2xl': 18 } }} />}
            sx={{ 
              px: { xs: 2, '2xl': 4 }, 
              textTransform: "none", 
              borderRadius: "8px",
              fontSize: { xs: 12, '2xl': 14 },
              fontWeight: 700
            }}
          >
            {saving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Save SEO Settings"
            )}
          </Button>
        </div>

        {/* Global SEO Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 2xl:p-6">
          <div className="flex items-center gap-2 mb-4 2xl:mb-6">
            <div className="p-1.5 2xl:p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
              <SeoIcon sx={{ fontSize: { xs: 20, '2xl': 24 } }} />
            </div>
            <h2 className="text-base 2xl:text-lg font-bold text-slate-800">
              Global SEO Settings
            </h2>
          </div>

          <div className="space-y-4 2xl:space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 2xl:p-4 mb-2 2xl:mb-4">
              <p className="text-[11px] 2xl:text-sm text-blue-800">
                <strong>Note:</strong> Site Name and Description are now managed
                in{" "}
                <a href="/settings/general-settings" className="underline font-medium">
                  General Settings
                </a>
                .
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                Default Keywords
              </label>
              <TextField
                size="small"
                fullWidth
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                placeholder="Press Enter to add a keyword"
                sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {seoSettings.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 px-2 py-0.5 2xl:px-2.5 2xl:py-1 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded-full text-[10px] 2xl:text-xs font-bold"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-[var(--primary)] transition-colors"
                    >
                      <CloseIcon style={{ fontSize: 12 }} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <ShopifyImagePicker
                label="Default Meta Image"
                value={seoSettings.metaImage || ""}
                onChange={(url) => handleSEOChange("metaImage", url)}
              />

              <p className="text-[10px] 2xl:text-xs text-slate-400 font-medium">
                URL to the default image for social media sharing (Open Graph)
              </p>
            </div>
          </div>
        </div>

        {/* Analytics & Tracking */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 2xl:p-6">
          <div className="flex items-center gap-2 mb-4 2xl:mb-6">
            <div className="p-1.5 2xl:p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
              <AnalyticsIcon sx={{ fontSize: { xs: 20, '2xl': 24 } }} />
            </div>
            <h2 className="text-base 2xl:text-lg font-bold text-slate-800">
              Analytics & Tracking
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
            <div className="space-y-1">
              <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                Google Analytics ID
              </label>
              <TextField
                size="small"
                fullWidth
                value={seoSettings.googleAnalyticsId}
                onChange={(e) =>
                  handleSEOChange("googleAnalyticsId", e.target.value)
                }
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
              />
              <p className="text-[10px] 2xl:text-xs text-slate-400 font-medium">
                Your Google Analytics tracking ID (Expected format: G-XXXXXXXXXX)
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                Google Tag Manager ID
              </label>
              <TextField
                size="small"
                fullWidth
                value={seoSettings.googleTagManagerId}
                onChange={(e) =>
                  handleSEOChange("googleTagManagerId", e.target.value)
                }
                placeholder="GTM-XXXXXXX"
                sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
              />
              <p className="text-[10px] 2xl:text-xs text-slate-400 font-medium">
                Your Google Tag Manager container ID (Expected format: GTM-XXXXXXX)
              </p>
              {seoSettings.googleTagManagerId?.startsWith("G-") && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded flex items-center justify-between gap-4">
                  <p className="text-[10px] text-amber-700 font-bold">
                    ⚠️ Measurement ID in GTM field? Move to GA field.
                  </p>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="warning"
                    onClick={handleFixAnalyticsId}
                    sx={{ textTransform: 'none', py: 0.2, fontSize: '10px' }}
                  >
                    Move
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                Facebook Pixel ID
              </label>
              <TextField
                size="small"
                fullWidth
                value={seoSettings.facebookPixelId}
                onChange={(e) =>
                  handleSEOChange("facebookPixelId", e.target.value)
                }
                placeholder="XXXXXXXXXXXXXXX"
                sx={{ bgcolor: "white", '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } } }}
              />
              <p className="text-[10px] 2xl:text-xs text-slate-400 font-medium">
                Your Facebook Pixel ID for conversion tracking
              </p>
            </div>
          </div>
        </div>

        {/* Custom Scripts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 2xl:p-6">
          <div className="flex items-center gap-2 mb-4 2xl:mb-6">
            <div className="p-1.5 2xl:p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
              <CodeIcon sx={{ fontSize: { xs: 20, '2xl': 24 } }} />
            </div>
            <h2 className="text-base 2xl:text-lg font-bold text-slate-800">
              Custom Scripts
            </h2>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 2xl:p-4 mb-4 2xl:mb-6">
            <p className="text-[11px] 2xl:text-sm text-amber-800 font-bold">
              ⚠️ Only add scripts from trusted sources to ensure website security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-8">
            <div className="space-y-1">
              <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                Header Scripts
              </label>
              <TextField
                size="small"
                fullWidth
                multiline
                rows={4}
                value={customScripts.headerScripts}
                onChange={(e) =>
                  handleScriptChange("headerScripts", e.target.value)
                }
                placeholder='<script>console.log("Header script");</script>'
                sx={{
                  bgcolor: "white",
                  "& .MuiInputBase-input": {
                    fontFamily: "monospace",
                    fontSize: { xs: "10px", '2xl': "0.75rem" },
                  },
                }}
              />
              <p className="text-[10px] 2xl:text-xs text-slate-400 font-medium">
                Scripts to be injected in the &lt;head&gt; section.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                Footer Scripts
              </label>
              <TextField
                size="small"
                fullWidth
                multiline
                rows={4}
                value={customScripts.footerScripts}
                onChange={(e) =>
                  handleScriptChange("footerScripts", e.target.value)
                }
                placeholder='<script>console.log("Footer script");</script>'
                sx={{
                  bgcolor: "white",
                  "& .MuiInputBase-input": {
                    fontFamily: "monospace",
                    fontSize: { xs: "10px", '2xl': "0.75rem" },
                  },
                }}
              />
              <p className="text-[10px] 2xl:text-xs text-slate-400 font-medium">
                Scripts to be injected before &lt;/body&gt;.
              </p>
            </div>
          </div>
      </div>
    </div>
    </>
  );
}
