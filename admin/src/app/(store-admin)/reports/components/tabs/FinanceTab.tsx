"use client";
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  TrendingUp,
  Receipt,
  DollarSign,
  Scale,
  Download,
} from "lucide-react";
import StatCard from "@/components/Analytics/StatCard";
import ChartCard from "@/components/Analytics/ChartCard";
import EmptyState from "@/components/Analytics/EmptyState";

interface FinanceTabProps {
  financeData: any;
  formatCurrency: (val: number | string) => string;
  loading: boolean;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

// Custom Waterfall Row component mapping positive, negative, and totals
const WaterfallRow: React.FC<{
  label: string;
  amount: number;
  type: "total" | "positive" | "negative";
  max: number;
  formatCurrency: (val: number | string) => string;
}> = ({ label, amount, type, max, formatCurrency }) => {
  const width = max > 0 ? (Math.abs(amount) / max) * 100 : 0;
  return (
    <div className="flex items-center gap-4 py-2 hover:bg-gray-50/30 transition-colors">
      <div className="w-40 text-xs font-bold text-gray-500 text-right">{label}</div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 bg-gray-50 rounded-full h-7 relative border border-gray-100/50 shadow-inner overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              type === "total"
                ? "bg-blue-500/80 border-r border-blue-600/30 shadow-md"
                : type === "negative"
                ? "bg-rose-400/80 border-r border-rose-500/30"
                : "bg-emerald-400/80 border-r border-emerald-500/30"
            }`}
            style={{ width: `${width}%` }}
          />
        </div>
        <span
          className={`text-xs font-black w-24 text-right ${
            type === "negative" ? "text-rose-600" : "text-gray-900"
          }`}
        >
          {type === "negative" ? "-" : ""}
          {formatCurrency(Math.abs(amount))}
        </span>
      </div>
    </div>
  );
};

export const FinanceTab: React.FC<FinanceTabProps> = ({
  financeData,
  formatCurrency,
  loading,
}) => {
  const grossRevenue = financeData?.kpis?.grossRevenue ?? 0;
  const discountAmount = financeData?.kpis?.discountAmount ?? 0;
  const refundAmount = financeData?.kpis?.refundAmount ?? 0;
  const netRevenue = financeData?.kpis?.netRevenue ?? 0;
  const shippingAmount = financeData?.kpis?.shippingAmount ?? 0;
  const taxAmount = financeData?.kpis?.taxAmount ?? 0;

  // Calculate intermediate values
  const totalCollected = netRevenue + shippingAmount;
  const revenueExTax = totalCollected - taxAmount;

  // Waterfall rows data structures
  const waterfallRows = React.useMemo(() => {
    return [
      { label: "Gross Revenue", amount: grossRevenue, type: "total" as const },
      { label: "Discounts Given", amount: discountAmount, type: "negative" as const },
      { label: "Refunds/Returns", amount: refundAmount, type: "negative" as const },
      { label: "Net Revenue", amount: netRevenue, type: "total" as const },
      { label: "Shipping Collected", amount: shippingAmount, type: "positive" as const },
      { label: "Total Collected", amount: totalCollected, type: "total" as const },
      { label: "GST Taxes Portion", amount: taxAmount, type: "negative" as const },
      { label: "Revenue Ex-Tax", amount: revenueExTax, type: "total" as const },
    ];
  }, [grossRevenue, discountAmount, refundAmount, netRevenue, shippingAmount, taxAmount, totalCollected, revenueExTax]);

  // Max value to scale waterfall bars
  const maxWaterfallValue = React.useMemo(() => {
    return Math.max(...waterfallRows.map((r) => r.amount), 1);
  }, [waterfallRows]);

  // Payment methods donut values
  const paymentBreakdown = React.useMemo(() => {
    if (!financeData?.paymentMethods) return [];
    return financeData.paymentMethods.map((pm: any) => ({
      name: pm.method || "COD",
      value: pm.value || 0,
      count: pm.count || 0,
    }));
  }, [financeData?.paymentMethods]);

  const totalPaymentValue = paymentBreakdown.reduce((acc: number, cur: any) => acc + cur.value, 0);

  // Monthly tax records
  const taxRecords = React.useMemo(() => {
    if (!financeData?.taxRecords) return [];
    return financeData.taxRecords.map((tr: any) => ({
      month: tr.month,
      taxable: tr.taxable || 0,
      cgst: tr.cgst || 0,
      sgst: tr.sgst || 0,
      gst: tr.cgst + tr.sgst,
    }));
  }, [financeData?.taxRecords]);

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Finance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Revenue"
          value={formatCurrency(grossRevenue)}
          icon={DollarSign}
          iconBg="bg-emerald-500"
          sparklineColor="#10b981"
          trend={grossRevenue > 0 ? "up" : "neutral"}
          trendValue={grossRevenue > 0 ? "12.5" : "0.0"}
          loading={loading}
        />
        <StatCard
          title="Net Revenue"
          value={formatCurrency(netRevenue)}
          icon={TrendingUp}
          iconBg="bg-blue-500"
          sparklineColor="#3b82f6"
          trend={netRevenue > 0 ? "up" : "neutral"}
          trendValue={netRevenue > 0 ? "8.4" : "0.0"}
          loading={loading}
        />
        <StatCard
          title="Taxes Collected"
          value={formatCurrency(taxAmount)}
          icon={Receipt}
          iconBg="bg-purple-500"
          sparklineColor="#8b5cf6"
          trend={taxAmount > 0 ? "up" : "neutral"}
          trendValue={taxAmount > 0 ? "4.2" : "0.0"}
          loading={loading}
        />
        <StatCard
          title="Refunded amount"
          value={formatCurrency(refundAmount)}
          icon={Scale}
          iconBg="bg-orange-500"
          sparklineColor="#f97316"
          trend={refundAmount > 0 ? "down" : "neutral"}
          trendValue={refundAmount > 0 ? "1.5" : "0.0"}
          loading={loading}
        />
      </div>

      {/* Waterfall Breakdown Chart */}
      <ChartCard
        title="Revenue Waterfall Reconciliation"
        subtitle="Step-by-step gross-to-net waterfall valuation in the selected timeline"
        loading={loading}
      >
        <div className="flex flex-col gap-1 p-2">
          {waterfallRows.map((row) => (
            <WaterfallRow
              key={row.label}
              label={row.label}
              amount={row.amount}
              type={row.type}
              max={maxWaterfallValue}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      </ChartCard>

      {/* Split payment channels and tax summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment methods donut */}
        <ChartCard
          title="Completed Payment Methods"
          subtitle="Breakdown of checkout invoices by payment portal channels"
          className="lg:col-span-5"
          loading={loading}
        >
          {paymentBreakdown.length > 0 ? (
            <div className="flex flex-col justify-between h-[250px]">
              <div className="h-[180px] relative flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {paymentBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
                {paymentBreakdown.map((entry: any, idx: number) => {
                  const pct = totalPaymentValue > 0 ? ((entry.value / totalPaymentValue) * 100).toFixed(0) : 0;
                  return (
                    <div key={entry.name} className="flex items-center space-x-1.5 text-xs text-gray-500 font-semibold">
                      <span
                        className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="capitalize">{entry.name}</span>
                      <span className="text-gray-900">({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        {/* Tax report ledger */}
        <ChartCard
          title="Monthly Tax Liability Report"
          subtitle="Breakdown of CGST & SGST taxes cataloged from transactions (Prepared for audit reports)"
          className="lg:col-span-7"
          loading={loading}
          action={
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all">
              <Download className="w-3.5 h-3.5" />
              Export for CA
            </button>
          }
        >
          {taxRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 border-b border-gray-50 pb-2 uppercase tracking-wider">
                    <th className="pb-3">Reporting Month</th>
                    <th className="pb-3 text-right">Taxable Turnover</th>
                    <th className="pb-3 text-right">CGST Portion</th>
                    <th className="pb-3 text-right">SGST Portion</th>
                    <th className="pb-3 text-right">Total GST due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {taxRecords.map((record: any) => (
                    <tr key={record.month} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-xs font-bold text-gray-900">{record.month}</td>
                      <td className="py-4 text-right text-xs font-bold text-gray-600">
                        {formatCurrency(record.taxable)}
                      </td>
                      <td className="py-4 text-right text-xs font-semibold text-gray-500">
                        {formatCurrency(record.cgst)}
                      </td>
                      <td className="py-4 text-right text-xs font-semibold text-gray-500">
                        {formatCurrency(record.sgst)}
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-xs font-black text-rose-600">
                          {formatCurrency(record.gst)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState description="No tax reporting liability records found." />
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default FinanceTab;
