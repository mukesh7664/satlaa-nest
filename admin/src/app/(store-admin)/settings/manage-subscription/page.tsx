"use client";

import React from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  Divider,
  LinearProgress
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Language as LanguageIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  Storage as StorageIcon,
  Group as GroupIcon
} from "@mui/icons-material";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { plansApiService } from "@/services/plans.api";
import { subscriptionApiService, Subscription, Plan } from "@/services/subscription.api";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from "@mui/material";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ManageSubscriptionPage() {
  const { subscription, usage, limits, loading, refresh } = usePlanLimits();
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);
  const [upgradePreview, setUpgradePreview] = React.useState<any>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [processingUpgrade, setProcessingUpgrade] = React.useState(false);
  const [history, setHistory] = React.useState<Subscription[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(true);
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');

  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = React.useState(true);

  const fetchHistory = React.useCallback(async () => {
    try {
      const data = await subscriptionApiService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchInvoices = React.useCallback(async () => {
    try {
      setInvoicesLoading(true);
      const response = await apiService.get('/subscriptions/store/invoices');
      setInvoices(response.data || response || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHistory();
    fetchInvoices();
  }, [fetchHistory, fetchInvoices]);

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await plansApiService.getAllPlans();
        setPlans(data);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      }
    };
    fetchPlans();
  }, []);

  const handleOpenUpgrade = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleSelectPlan = async (plan: Plan, cycle: 'monthly' | 'yearly' = billingCycle) => {
    setSelectedPlan(plan);
    setPreviewLoading(true);
    try {
      const preview = await subscriptionApiService.getChangePreview(plan.id, cycle);
      setUpgradePreview(preview);
    } catch (error) {
      console.error("Failed to fetch upgrade preview:", error);
      toast.error("Failed to calculate upgrade price");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCycleChange = (newCycle: 'monthly' | 'yearly') => {
    setBillingCycle(newCycle);
    if (selectedPlan) {
      handleSelectPlan(selectedPlan, newCycle);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan || !upgradePreview) return;

    setProcessingUpgrade(true);
    try {
      // 1. If it's a scheduled change (downgrade), call requestPlanChange
      if (upgradePreview?.shouldSchedule) {
        await subscriptionApiService.requestPlanChange(selectedPlan.id, billingCycle);
        toast.success("Plan change requested for next billing cycle!");
        setIsUpgradeModalOpen(false);
        refresh();
        return;
      }

      // 2. If it's a free change (immediate), call handleFreeChange (for same-price or credit)
      if (upgradePreview?.payableAmount === 0 || upgradePreview?.isDowngrade) {
        await subscriptionApiService.executeFreeChange(selectedPlan.id, billingCycle);
        toast.success("Plan updated successfully!");
        setIsUpgradeModalOpen(false);
        refresh();
        fetchHistory();
        fetchInvoices();
        return;
      }

      // 2. Otherwise process with Razorpay
      const { order, attemptId, razorpayKey } = await subscriptionApiService.createPlanChangeOrder(selectedPlan.id, billingCycle);

      const options = {
        key: razorpayKey || "rzp_test_zV4jB2V4jB2V4j",
        amount: order.amount,
        currency: order.currency,
        name: "SaaS Subscription Upgrade",
        description: `Upgrade to ${selectedPlan.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await subscriptionApiService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              attemptId: attemptId,
            });
            toast.success("Plan upgraded successfully!");
            setIsUpgradeModalOpen(false);
            refresh(); // Refresh plan data
            fetchInvoices();
          } catch (err) {
            console.error("Payment verification failed:", err);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Upgrade failed:", error);
      toast.error("Failed to initiate upgrade");
    } finally {
      setProcessingUpgrade(false);
    }
  };

  const handleCancelPending = async () => {
    try {
      await subscriptionApiService.cancelPlanChange();
      toast.success("Plan change request cancelled");
      refresh();
    } catch (error) {
      console.error("Failed to cancel pending change:", error);
      toast.error("Failed to cancel plan change request");
    }
  };

  const getPlanNameById = (id: string) => {
    return plans.find(p => p.id === id)?.name || "New Plan";
  };

  const isExpired = subscription && new Date(subscription.expiry_date) < new Date();

  const handleRenewWithPending = async () => {
    if (!subscription?.pending_plan_id) return;
    const plan = plans.find(p => p.id === subscription.pending_plan_id);
    if (plan) {
      handleSelectPlan(plan, (subscription.pending_billing_cycle as any) || 'monthly');
      setIsUpgradeModalOpen(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPercentage = (used: number, limit: number) => {
    if (limit === -1) return 0;
    if (limit === 0) return 100;
    return Math.min(100, (used / limit) * 100);
  };

  return (
    <>
      <style>
        {`
          .MuiOutlinedInput-root {
            border-radius: 8px !important;
          }
        `}
      </style>
      <div className="max-w-6xl mx-auto space-y-5 pb-10 text-slate-800">
        {/* Header Section */}
        <div className="flex justify-between items-center pb-2">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Subscription & Billing</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage your active plan, usage quotas, and download invoices.</p>
          </div>
          <Button
            variant="contained"
            onClick={handleOpenUpgrade}
            size="small"
            sx={{ 
              textTransform: 'none', 
              borderRadius: '8px', 
              px: 3, 
              py: 0.8,
              bgcolor: '#4f46e5', 
              fontWeight: 700,
              fontSize: '12px',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#4338ca', boxShadow: 'none' }
            }}
          >
            Upgrade Plan
          </Button>
        </div>

        {/* Plan Cards & Feature List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Plan Overview Card */}
          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-xl shadow-inner">
                      💎
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        {subscription?.plan?.name || "Active Plan"}
                        {subscription?.plan?.category && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            subscription.plan.category === 'ecommerce' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'
                          }`}>
                            {subscription.plan.category.replace('_', ' ')}
                          </span>
                        )}
                      </h2>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red-500' : subscription?.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span className={`text-[10px] ${isExpired ? 'text-red-500 font-bold' : 'text-slate-400 font-bold'} tracking-wider`}>
                          {isExpired ? "EXPIRED" : subscription?.status?.toUpperCase() || "PENDING"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-indigo-600 block">
                      {subscription?.plan?.monthlyPrice ? formatCurrency(Number(subscription.plan.monthlyPrice)) : "FREE"}
                      <span className="text-[10px] font-normal text-slate-400">/mo</span>
                    </span>
                  </div>
                </div>

                <Divider />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                      <CheckCircleIcon className="text-emerald-500" sx={{ fontSize: 14 }} />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Billing Status</span>
                      <span className="text-xs font-bold text-slate-700">ACTIVE</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                      <ScheduleIcon className="text-blue-500" sx={{ fontSize: 14 }} />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                        {isExpired ? "EXPIRED ON" : "EXPIRES ON"}
                      </span>
                      <span className={`text-xs font-bold ${isExpired ? 'text-red-500' : 'text-slate-700'}`}>
                        {subscription?.expiry_date ? new Date(subscription.expiry_date).toLocaleDateString() : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature List Card */}
          <div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-full space-y-3">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                Included Features
              </h3>
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                {subscription?.plan?.features && typeof subscription.plan.features === 'object' && !Array.isArray(subscription.plan.features) &&
                  Object.entries(subscription.plan.features).map(([key, value]) => (
                    <div key={key} className="flex items-start space-x-1.5 text-xs text-slate-600 capitalize">
                      <CheckCircleIcon sx={{ fontSize: 14, mt: 0.2 }} className="text-emerald-500 flex-shrink-0" />
                      <span><strong>{key.replace('_', ' ')}:</strong> {String(value)}</span>
                    </div>
                  ))
                }
                {Array.isArray(subscription?.plan?.features?.list) &&
                  subscription.plan.features.list.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-1.5 text-xs text-slate-600">
                      <CheckCircleIcon sx={{ fontSize: 14, mt: 0.2 }} className="text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>

        {/* Pending Plan Change Notice */}
        {subscription?.pending_plan_id && (
          <div className={`p-4 border-l-4 ${isExpired ? 'border-l-indigo-500 bg-indigo-50/50' : 'border-l-amber-500 bg-amber-50/50'} rounded-xl border border-slate-200`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2.5">
                {isExpired ? <CheckCircleIcon className="text-indigo-600" sx={{ fontSize: 18 }} /> : <ScheduleIcon className="text-amber-600" sx={{ fontSize: 18 }} />}
                <div>
                  <h4 className={`text-xs font-bold ${isExpired ? 'text-indigo-900' : 'text-amber-900'}`}>
                    {isExpired ? 'Action Required: Activate ' : 'Scheduled Plan Change: '}
                    {getPlanNameById(subscription.pending_plan_id)}
                  </h4>
                  <p className={`text-[11px] ${isExpired ? 'text-indigo-700' : 'text-amber-700'} mt-0.5`}>
                    {isExpired
                      ? "Your previous plan has expired. Click below to pay and activate your new plan."
                      : `This change will request payment and take effect after your current plan expires on ${new Date(subscription.expiry_date).toLocaleDateString()}.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {isExpired && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleRenewWithPending}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '11px',
                      bgcolor: '#4f46e5'
                    }}
                  >
                    Pay & Activate
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={handleCancelPending}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '11px',
                    borderColor: isExpired ? '#cbd5e1' : '#fcd34d',
                    color: isExpired ? '#475569' : '#78350f',
                    '&:hover': {
                      bgcolor: isExpired ? '#f1f5f9' : '#fef3c7'
                    }
                  }}
                >
                  Cancel {isExpired ? "" : "Request"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Current Usage & Limits Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800">Current Usage & Limits</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Products Usage */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-50 rounded text-indigo-500">
                    <InventoryIcon sx={{ fontSize: 16 }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Products</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base font-black text-slate-900">
                  {usage?.products?.used || 0}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">
                  Max: {usage?.products?.limit === -1 ? '∞' : (usage?.products?.limit || limits.products)}
                </span>
              </div>
              <LinearProgress
                variant="determinate"
                value={getPercentage(usage?.products?.used || 0, usage?.products?.limit || limits.products)}
                className="h-1.5 rounded-full"
                sx={{ bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }}
              />
            </div>

            {/* Pages Usage */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-pink-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-pink-50 rounded text-pink-500">
                    <DescriptionIcon sx={{ fontSize: 16 }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Pages</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base font-black text-slate-900">
                  {usage?.pages?.used || 0}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">
                  Max: {usage?.pages?.limit === -1 ? '∞' : (usage?.pages?.limit || limits.pages)}
                </span>
              </div>
              <LinearProgress
                variant="determinate"
                value={getPercentage(usage?.pages?.used || 0, usage?.pages?.limit || limits.pages)}
                className="h-1.5 rounded-full"
                sx={{ bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#ec4899' } }}
              />
            </div>

            {/* Domains Usage */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-50 rounded text-blue-500">
                    <LanguageIcon sx={{ fontSize: 16 }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Domains</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base font-black text-slate-900">
                  {usage?.custom_domains?.used || 0}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">
                  Max: {usage?.custom_domains?.limit === -1 ? '∞' : (usage?.custom_domains?.limit || limits.custom_domains)}
                </span>
              </div>
              <LinearProgress
                variant="determinate"
                value={getPercentage(usage?.custom_domains?.used || 0, usage?.custom_domains?.limit || limits.custom_domains)}
                className="h-1.5 rounded-full"
                sx={{ bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6' } }}
              />
            </div>

            {/* Storage Usage */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-amber-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-50 rounded text-amber-500">
                    <StorageIcon sx={{ fontSize: 16 }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Storage</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base font-black text-slate-900">
                  {usage?.storage?.used || 0} MB
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">
                  Max: {usage?.storage?.limit || limits.storageMb} MB
                </span>
              </div>
              <LinearProgress
                variant="determinate"
                value={getPercentage(usage?.storage?.used || 0, usage?.storage?.limit || limits.storageMb)}
                className="h-1.5 rounded-full"
                sx={{ bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b' } }}
              />
            </div>

            {/* Users Usage */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-teal-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-teal-50 rounded text-teal-500">
                    <GroupIcon sx={{ fontSize: 16 }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Admins</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base font-black text-slate-900">
                  {usage?.users?.used || 0}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">
                  Max: {usage?.users?.limit || limits.users}
                </span>
              </div>
              <LinearProgress
                variant="determinate"
                value={getPercentage(usage?.users?.used || 0, usage?.users?.limit || limits.users)}
                className="h-1.5 rounded-full"
                sx={{ bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#14b8a6' } }}
              />
            </div>
          </div>
        </div>

        {/* Subscription History Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <ScheduleIcon className="text-indigo-500" sx={{ fontSize: 16 }} />
            Subscription History
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {historyLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center">
                        <CircularProgress size={20} />
                      </td>
                    </tr>
                  ) : history.length > 0 ? (
                    history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors text-xs">
                        <td className="px-4 py-2.5">
                          <span className="font-bold text-slate-700">{item.plan?.name}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 font-medium">
                          {formatCurrency(Number(item.plan?.monthlyPrice))}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            item.status === 'expired' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {new Date(item.start_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {new Date(item.expiry_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                        No subscription history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SaaS Subscription Invoices Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            🧾
            Billing History & Invoices
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice Number</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billing Cycle</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {invoicesLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center">
                        <CircularProgress size={20} />
                      </td>
                    </tr>
                  ) : invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors text-xs">
                        <td className="px-4 py-2.5 font-bold text-slate-700">{inv.invoiceNumber}</td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {new Date(inv.invoice_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 font-medium">
                          {inv.plan?.name || "SaaS Plan"}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 capitalize">
                          {inv.billing_cycle}
                        </td>
                        <td className="px-4 py-2.5 text-slate-900 font-bold">
                          {inv.currency} {Number(inv.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {inv.pdf_url && (
                            <Button
                              variant="outlined"
                              size="small"
                              component="a"
                              href={inv.pdf_url.startsWith('http') ? inv.pdf_url : `http://localhost:3000${inv.pdf_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ 
                                textTransform: 'none', 
                                borderRadius: '6px', 
                                fontSize: '10px',
                                fontWeight: 700,
                                py: 0.4,
                                px: 1.5
                              }}
                            >
                              Download PDF
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                        No invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <Dialog
        open={isUpgradeModalOpen}
        onClose={() => !processingUpgrade && setIsUpgradeModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem', pb: 0.5 }}>
          Choose a Plan
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 1 }}>
          <Typography className="text-slate-500 mb-4 text-xs">
            Upgrade your plan to unlock more features and higher limits. Your payment will be prorated.
          </Typography>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-5">
            <div className="bg-slate-100 p-0.5 rounded-lg flex gap-1">
              <Button
                onClick={() => handleCycleChange('monthly')}
                sx={{
                  textTransform: 'none',
                  borderRadius: '6px',
                  px: 3,
                  py: 0.5,
                  fontSize: '11px',
                  fontWeight: 700,
                  bgcolor: billingCycle === 'monthly' ? 'white' : 'transparent',
                  color: billingCycle === 'monthly' ? '#4f46e5' : '#64748b',
                  boxShadow: billingCycle === 'monthly' ? '0 1px 3px 0 rgba(0,0,0,0.1)' : 'none',
                  '&:hover': {
                    bgcolor: billingCycle === 'monthly' ? 'white' : 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                Monthly
              </Button>
              <Button
                onClick={() => handleCycleChange('yearly')}
                sx={{
                  textTransform: 'none',
                  borderRadius: '6px',
                  px: 3,
                  py: 0.5,
                  fontSize: '11px',
                  fontWeight: 700,
                  bgcolor: billingCycle === 'yearly' ? 'white' : 'transparent',
                  color: billingCycle === 'yearly' ? '#4f46e5' : '#64748b',
                  boxShadow: billingCycle === 'yearly' ? '0 1px 3px 0 rgba(0,0,0,0.1)' : 'none',
                  '&:hover': {
                    bgcolor: billingCycle === 'yearly' ? 'white' : 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                Yearly
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {plans.filter(p => p.id !== subscription?.plan_id).map((plan) => (
              <Card
                key={plan.id}
                onClick={() => !processingUpgrade && handleSelectPlan(plan)}
                className={`p-4 cursor-pointer border-2 transition-all rounded-xl ${selectedPlan?.id === plan.id
                  ? 'border-indigo-500 bg-indigo-50/30'
                  : 'border-slate-100 hover:border-slate-200'
                  }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Typography sx={{ fontWeight: 700, fontSize: '13px' }} className="text-slate-800">{plan.name}</Typography>
                    {plan.category && (
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${plan.category === 'ecommerce' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'
                        }`}>
                        {plan.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  {selectedPlan?.id === plan.id && <CheckCircleIcon className="text-indigo-600" sx={{ fontSize: 18 }} />}
                </div>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 900 }} className="text-indigo-600">
                  {formatCurrency(billingCycle === 'yearly' ? Number(plan.yearlyPrice) : Number(plan.monthlyPrice))}
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">/{billingCycle === 'yearly' ? 'year' : 'mo'}</span>
                </Typography>
                <Box sx={{ mt: 1.5 }}>
                  {plan.pageLimit !== undefined && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '10px' }} className="flex items-center gap-1 mb-0.5">
                      <CheckCircleIcon sx={{ fontSize: 10, color: '#10b981' }} /> {plan.pageLimit === -1 ? 'Unlimited' : plan.pageLimit} Pages
                    </Typography>
                  )}
                  {plan.category === 'ecommerce' && plan.productLimit !== undefined && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '10px' }} className="flex items-center gap-1 mb-0.5">
                      <CheckCircleIcon sx={{ fontSize: 10, color: '#10b981' }} /> {plan.productLimit === -1 ? 'Unlimited' : plan.productLimit} Products
                    </Typography>
                  )}
                  {plan.storageMb !== undefined && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '10px' }} className="flex items-center gap-1 mb-0.5">
                      <CheckCircleIcon sx={{ fontSize: 10, color: '#10b981' }} /> {plan.storageMb >= 1000 ? `${plan.storageMb / 1000}GB` : `${plan.storageMb}MB`} Storage
                    </Typography>
                  )}
                  {plan.features && typeof plan.features === 'object' && !Array.isArray(plan.features) &&
                    Object.entries(plan.features).slice(0, 4).map(([key, value]) => (
                      <Typography key={key} variant="caption" display="block" color="text.secondary" sx={{ fontSize: '10px' }} className="flex items-center gap-1 mb-0.5 capitalize">
                        <CheckCircleIcon sx={{ fontSize: 10, color: '#10b981' }} /> <strong>{key.replace('_', ' ')}:</strong> {String(value)}
                      </Typography>
                    ))
                  }
                  {Array.isArray(plan.features?.list) && plan.features.list.slice(0, 3).map((f: string, i: number) => (
                    <Typography key={`f-${i}`} variant="caption" display="block" color="text.secondary" sx={{ fontSize: '10px' }} className="flex items-center gap-1 mb-0.5">
                      <CheckCircleIcon sx={{ fontSize: 10, color: '#10b981' }} /> {f}
                    </Typography>
                  ))}
                </Box>
              </Card>
            ))}
          </div>

          {selectedPlan && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Order Summary</Typography>
              {previewLoading ? (
                <CircularProgress size={20} />
              ) : upgradePreview && (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unused credit from current plan:</span>
                    <span className="text-green-600 font-semibold">-{formatCurrency(upgradePreview.unusedCredit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      {isExpired ? "Plan cost for new cycle:" : `New plan for remaining ${upgradePreview.remainingDays} days:`}
                    </span>
                    <span className="text-slate-700 font-semibold">{formatCurrency(upgradePreview.newPlanCost)}</span>
                  </div>
                  <Divider sx={{ my: 1 }} />
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Total Payable ({billingCycle}):</span>
                    <span className="font-black text-indigo-600 text-lg">{formatCurrency(upgradePreview.payableAmount)}</span>
                  </div>
                </div>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setIsUpgradeModalOpen(false)} 
            disabled={processingUpgrade}
            sx={{ textTransform: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!selectedPlan || previewLoading || processingUpgrade}
            onClick={handleUpgrade}
            sx={{ 
              bgcolor: '#4f46e5', 
              fontWeight: 700, 
              px: 3, 
              borderRadius: '8px', 
              textTransform: 'none',
              fontSize: '12px',
              '&:hover': { bgcolor: '#4338ca' } 
            }}
          >
            {processingUpgrade ? <CircularProgress size={18} color="inherit" /> :
              upgradePreview?.shouldSchedule ? 'Request Change' :
                upgradePreview?.isDowngrade ? 'Change Plan' :
                  `Pay ${upgradePreview ? formatCurrency(upgradePreview.payableAmount) : ''}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
