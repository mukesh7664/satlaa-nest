"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { settingsApi } from "@/services/settings.api";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import {
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import {
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";

interface StoreDomain {
  id: string;
  domain: string;
  type: "subdomain" | "custom";
  is_primary: boolean;
  status: string;
  is_verified: boolean;
}

export default function DomainManagementPage() {
  const [domains, setDomains] = useState<StoreDomain[]>([]);
  const [customDomain, setCustomDomain] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { limits, subscription, loading: limitsLoading } = usePlanLimits();
  const customDomainLimit = limits?.custom_domains ?? 0;
  const customDomainCount = domains.filter(d => d.type === "custom").length;
  const isLimitReached = customDomainLimit !== -1 && customDomainCount >= customDomainLimit;

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setFetching(true);
      const data = await settingsApi.getDomains();
      if (Array.isArray(data)) {
        setDomains(data);
      }
    } catch (err) {
      console.error("Failed to fetch domains:", err);
      toast.error("Failed to load domains");
    } finally {
      setFetching(false);
    }
  };

  const handleAddDomain = async () => {
    if (!customDomain || !customDomain.includes(".")) {
      toast.error("Please enter a valid domain name");
      return;
    }

    setAddingDomain(true);
    try {
      await settingsApi.addDomain(customDomain);
      toast.success("Domain added successfully. Please point your DNS to our servers.");
      setCustomDomain("");
      fetchDomains(); // Refresh list
    } catch (err: any) {
      console.error("Failed to add domain:", err);
      const message = err.response?.data?.message || "Failed to add domain";
      toast.error(message);
    } finally {
      setAddingDomain(false);
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
    <div className="max-w-6xl mx-auto space-y-6 font-sans pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Domain Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your store's custom domains and subdomains
        </p>
      </div>

        {/* Domain Management Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-slate-800">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <LanguageIcon className="text-slate-400" />
                Domains
              </h2>
              <p className="text-sm text-slate-500">
                Plan: {subscription?.plan?.name || "Loading..."} ({customDomainCount} / {customDomainLimit === -1 ? 'Unlimited' : customDomainLimit} used)
              </p>
            </div>

            <div className="space-y-4">
              {/* Subdomain Display */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Default Subdomain</p>
                <div className="flex items-center justify-between">
                  {fetching ? (
                    <CircularProgress size={16} />
                  ) : (
                    <span className="font-mono text-sm bg-white px-2 py-1 rounded border border-slate-200">
                      {domains.find(d => d.type === "subdomain")?.domain || "Loading..."}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircleIcon sx={{ fontSize: 12 }} />
                    PRIMARY
                  </span>
                </div>
              </div>

              {/* Custom Domains List */}
              {domains.filter(d => d.type === "custom").length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom Domains</p>
                  {domains.filter(d => d.type === "custom").map(domain => (
                    <div key={domain.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                      <span className="text-sm font-medium">{domain.domain}</span>
                      <div className="flex items-center gap-2">
                        {domain.status === "pending" ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <PendingIcon sx={{ fontSize: 12 }} />
                            PENDING VERIFICATION
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            <CheckCircleIcon sx={{ fontSize: 12 }} />
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Domain */}
              <div className="pt-2">
                {!isLimitReached ? (
                  <>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Add Custom Domain</p>
                    <div className="flex gap-2">
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. www.yourshop.com"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        sx={{ bgcolor: "white" }}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          handleAddDomain();
                        }}
                        disabled={addingDomain || limitsLoading}
                        sx={{
                          textTransform: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {addingDomain ? "Adding..." : "Add Domain"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
                      <PendingIcon sx={{ fontSize: 18 }} />
                      Domain Limit Reached
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Your current plan allows for {customDomainLimit} custom domain{customDomainLimit > 1 ? 's' : ''}. Upgrade your plan to add more.
                    </p>
                  </div>
                )}
                <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-lg space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-blue-800 mb-1">DNS Configuration Required</p>
                    <p className="text-[11px] text-blue-600">
                      To connect your custom domain, add the following records to your domain's DNS manager. Verification and SSL generation usually take a few minutes but can take up to 24 hours.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* A Record */}
                    <div className="bg-white border border-blue-100 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">Option 1: A Record (Recommended for Root)</p>
                      <div className="grid grid-cols-[60px_1fr] gap-x-3 gap-y-1.5 text-[11px] font-mono">
                        <span className="text-slate-400 font-sans">Type:</span> <span className="text-blue-700 font-bold">A</span>
                        <span className="text-slate-400 font-sans">Name:</span> <span className="text-slate-700">@ <span className="text-[10px] font-sans text-slate-400">(or your root domain)</span></span>
                        <span className="text-slate-400 font-sans">Value:</span> <span className="text-green-700 font-bold">{process.env.NEXT_PUBLIC_EXPECTED_DNS_A_RECORD || '13.204.121.129'}</span>
                      </div>
                    </div>

                    {/* CNAME Record */}
                    <div className="bg-white border border-blue-100 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-2">Option 2: CNAME Record (For Subdomains/WWW)</p>
                      <div className="grid grid-cols-[60px_1fr] gap-x-3 gap-y-1.5 text-[11px] font-mono">
                        <span className="text-slate-400 font-sans">Type:</span> <span className="text-blue-700 font-bold">CNAME</span>
                        <span className="text-slate-400 font-sans">Name:</span> <span className="text-slate-700">www <span className="text-[10px] font-sans text-slate-400">(or your subdomain)</span></span>
                        <span className="text-slate-400 font-sans">Value:</span> <span className="text-green-700 font-bold">{process.env.NEXT_PUBLIC_EXPECTED_DNS_CNAME || 'webs.prefyn.com'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-100/50">
                    <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                      <span className="bg-amber-100 px-1 rounded text-[10px]">IMPORTANT</span>
                      Set "Proxy status" to "DNS only" (OFF)
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      If you use Cloudflare, ensure the orange cloud is turned <b>OFF</b> for these records. This is required for SSL generation to complete successfully.
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
