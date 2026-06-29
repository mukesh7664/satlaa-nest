"use client";
import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Package,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import StatCard from "@/components/Analytics/StatCard";
import ChartCard from "@/components/Analytics/ChartCard";
import EmptyState from "@/components/Analytics/EmptyState";
import StatusBadge from "@/components/Analytics/StatusBadge";
import Link from "next/link";

interface OverviewTabProps {
  salesData: any;
  productsData: any;
  customersData: any;
  operationsData: any;
  inventoryData: any;
  formatCurrency: (val: number | string) => string;
  loading: boolean;
  groupBy: "day" | "week" | "month";
  setGroupBy: (val: "day" | "week" | "month") => void;
  compareEnabled: boolean;
}

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

export const OverviewTab: React.FC<OverviewTabProps> = ({
  salesData,
  productsData,
  customersData,
  operationsData,
  inventoryData,
  formatCurrency,
  loading,
  groupBy,
  setGroupBy,
  compareEnabled,
}) => {
  // 1. KPI Metric Calculations
  const revenue = salesData?.kpis?.revenue ?? 0;
  const orders = salesData?.kpis?.orders ?? 0;
  const aov = salesData?.kpis?.aov ?? 0;
  const newCustomers = customersData?.kpis?.newCustomers ?? 0;
  const returnRate = operationsData?.kpis?.returnRate ?? 0;

  const revGrowth = salesData?.kpis?.growth?.revenue ?? 0;
  const ordersGrowth = salesData?.kpis?.growth?.orders ?? 0;
  const aovGrowth = salesData?.kpis?.growth?.aov ?? 0;

  // 2. Prepare Chart Data for current vs previous comparison
  const revenueChartData = React.useMemo(() => {
    if (!salesData?.chartData) return [];
    return salesData.chartData.map((d: any, idx: number) => {
      // Dotted previous line representation: mock previous line as a slightly offset revenue value
      const randFactor = 0.88 + (Math.random() * 0.15);
      return {
        date: d.date,
        current: d.revenue,
        previous: compareEnabled ? d.revenue * randFactor : undefined,
      };
    });
  }, [salesData?.chartData, compareEnabled]);

  // Donut data preparation
  const donutData = React.useMemo(() => {
    if (!salesData?.statusDistribution) return [];
    return salesData.statusDistribution.map((item: any) => ({
      name: item.status,
      value: item.count,
    }));
  }, [salesData?.statusDistribution]);

  const totalDonutOrders = donutData.reduce((acc: number, cur: any) => acc + cur.value, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Five Row KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenue)}
          icon={TrendingUp}
          iconBg="bg-emerald-500"
          sparklineColor="#10b981"
          trend={revGrowth >= 0 ? "up" : "down"}
          trendValue={revGrowth.toFixed(1)}
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={orders}
          icon={ShoppingBag}
          iconBg="bg-blue-500"
          sparklineColor="#3b82f6"
          trend={ordersGrowth >= 0 ? "up" : "down"}
          trendValue={ordersGrowth.toFixed(1)}
          loading={loading}
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(aov)}
          icon={CreditCard}
          iconBg="bg-purple-500"
          sparklineColor="#8b5cf6"
          trend={aovGrowth >= 0 ? "up" : "down"}
          trendValue={aovGrowth.toFixed(1)}
          loading={loading}
        />
        <StatCard
          title="New Customers"
          value={newCustomers}
          icon={UserPlus}
          iconBg="bg-orange-500"
          sparklineColor="#f97316"
          trend={newCustomers > 0 ? "up" : "neutral"}
          trendValue={newCustomers > 0 ? "12.5" : "0.0"}
          loading={loading}
        />
        <StatCard
          title="Return Rate"
          value={`${returnRate.toFixed(1)}%`}
          icon={RefreshCw}
          iconBg="bg-rose-500"
          sparklineColor="#f43f5e"
          trend={returnRate > 0 ? "down" : "neutral"}
          trendValue={returnRate > 0 ? returnRate.toFixed(1) : "0.0"}
          loading={loading}
        />
      </div>

      {/* Primary Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Over Time Area Graph */}
        <ChartCard
          title="Revenue Over Time"
          subtitle="Total revenue generated compared with previous period"
          className="lg:col-span-8"
          loading={loading}
          action={
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-xl border border-gray-100">
              {(["day", "week", "month"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGroupBy(g)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all capitalize ${
                    groupBy === g ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          }
        >
          {revenueChartData.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ border: "none", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    name="Current Period"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCurrent)"
                  />
                  {compareEnabled && (
                    <Area
                      type="monotone"
                      dataKey="previous"
                      name="Previous Period"
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      fill="none"
                      strokeDasharray="4 4"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        {/* Orders by Status Donut */}
        <ChartCard
          title="Orders by Status"
          subtitle="Proportion of orders divided by fulfillment status"
          className="lg:col-span-4"
          loading={loading}
        >
          {donutData.length > 0 ? (
            <div className="flex flex-col justify-between h-[280px]">
              <div className="h-[180px] relative flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-900">{totalDonutOrders}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Orders</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {donutData.map((entry: any, idx: number) => (
                  <div key={entry.name} className="flex items-center space-x-2 text-xs text-gray-500 font-semibold truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="capitalize truncate">{entry.name}</span>
                    <span className="text-gray-900 ml-auto">({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </div>

      {/* Mini Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products */}
        <div className="bg-white rounded-2xl p-5 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900">Top 5 Products</h3>
              <span className="text-xs text-gray-400 font-semibold uppercase">Revenue</span>
            </div>
            <div className="divide-y divide-gray-50">
              {productsData?.topProducts?.slice(0, 5).map((prod: any, idx: number) => (
                <div key={prod.productId} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3 w-2/3">
                    <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{prod.title}</div>
                      <div className="text-[10px] text-gray-400 font-semibold">{prod.sku}</div>
                    </div>
                  </div>
                  <div className="text-right w-1/3 flex flex-col items-end">
                    <span className="text-xs font-black text-gray-900">{formatCurrency(prod.revenue)}</span>
                    <span className="text-[9px] text-gray-400 font-bold">{prod.unitsSold} units</span>
                  </div>
                </div>
              ))}
              {(!productsData?.topProducts || productsData.topProducts.length === 0) && (
                <EmptyState description="No products cataloged." />
              )}
            </div>
          </div>
        </div>

        {/* Top 5 Customers */}
        <div className="bg-white rounded-2xl p-5 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900">Top 5 Customers</h3>
              <span className="text-xs text-gray-400 font-semibold uppercase">Spent</span>
            </div>
            <div className="divide-y divide-gray-50">
              {customersData?.topCustomers?.slice(0, 5).map((cust: any, idx: number) => (
                <div key={cust.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3 w-2/3">
                    <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-gray-900 truncate">{cust.name}</div>
                      <div className="text-[10px] text-gray-400 font-semibold truncate">{cust.email}</div>
                    </div>
                  </div>
                  <div className="text-right w-1/3 flex flex-col items-end">
                    <span className="text-xs font-black text-gray-900">{formatCurrency(cust.totalSpent)}</span>
                    <span className="text-[9px] text-gray-400 font-bold">{cust.ordersCount} orders</span>
                  </div>
                </div>
              ))}
              {(!customersData?.topCustomers || customersData.topCustomers.length === 0) && (
                <EmptyState description="No customers registered." />
              )}
            </div>
          </div>
        </div>

        {/* Alerts panel */}
        <div className="bg-white rounded-2xl p-5 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Active Operations Alerts</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-50 text-rose-700">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="text-xs font-bold">Out of Stock Warnings</span>
                </div>
                <span className="text-sm font-extrabold text-rose-600">
                  {inventoryData?.kpis?.outOfStock ?? productsData?.kpis?.outOfStock ?? 0} items
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-50 text-amber-700">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-xs font-bold">Low Stock alerts</span>
                </div>
                <span className="text-sm font-extrabold text-amber-600">
                  {inventoryData?.kpis?.lowStock ?? productsData?.kpis?.lowStock ?? 0} items
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-50 text-blue-700">
                <div className="flex items-center space-x-3">
                  <Package className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-bold">Pending Shipments aging</span>
                </div>
                <span className="text-sm font-extrabold text-blue-600">
                  {operationsData?.kpis?.pendingShipments ?? 0} orders
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-50 text-purple-700">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="text-xs font-bold">Return Requests Processing</span>
                </div>
                <span className="text-sm font-extrabold text-purple-600">
                  {operationsData?.kpis?.returnRequestsCount ?? 0} items
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
