"use client";
import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  Flame,
  Search,
} from "lucide-react";
import StatCard from "@/components/Analytics/StatCard";
import ChartCard from "@/components/Analytics/ChartCard";
import EmptyState from "@/components/Analytics/EmptyState";
import StatusBadge from "@/components/Analytics/StatusBadge";

interface ProductsTabProps {
  productsData: any;
  formatCurrency: (val: number | string) => string;
  loading: boolean;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#f97316"];

export const ProductsTab: React.FC<ProductsTabProps> = ({
  productsData,
  formatCurrency,
  loading,
}) => {
  const [stockFilter, setStockFilter] = useState<"all" | "oos" | "low">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const kpis = productsData?.kpis ?? {
    totalSKUs: 0,
    outOfStock: 0,
    lowStock: 0,
    bestSeller: "None",
    topRevenueProduct: "None",
  };

  const topProducts = productsData?.topProducts ?? [];
  const categoryBreakdown = productsData?.categoryBreakdown ?? [];
  const deadStock = productsData?.deadStock ?? [];

  // Max revenue calculation for top progress bars
  const maxRevenue = React.useMemo(() => {
    if (topProducts.length === 0) return 1;
    return Math.max(...topProducts.map((p: any) => p.revenue), 1);
  }, [topProducts]);

  // Combined stock alerts data
  const stockAlerts = React.useMemo(() => {
    // Generate low stock alerts from productsData or deadStock representation
    const alerts: any[] = [];
    
    // Add low stock items from deadStock where stock <= 10
    deadStock.forEach((item: any) => {
      alerts.push({
        id: item.id,
        title: item.title,
        sku: item.sku,
        stock: item.stock,
        price: item.price,
        dailySales: (0.1 + Math.random() * 0.9).toFixed(1), // mock sales pace
      });
    });

    // Sort alerts by stock count ascending
    return alerts.sort((a, b) => a.stock - b.stock);
  }, [deadStock]);

  // Filtered stock alerts based on segment tab selection and search
  const filteredStockAlerts = React.useMemo(() => {
    return stockAlerts.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (stockFilter === "oos") return item.stock <= 0;
      if (stockFilter === "low") return item.stock > 0 && item.stock <= 10;
      return true;
    });
  }, [stockAlerts, stockFilter, searchQuery]);

  // Mock Return rate dataset
  const returnRateByProduct = React.useMemo(() => {
    if (topProducts.length === 0) return [];
    return topProducts.slice(0, 5).map((p: any, idx: number) => {
      const rates = [8.3, 4.5, 12.1, 1.2, 3.8];
      const rate = rates[idx % rates.length];
      return {
        id: p.productId,
        title: p.title,
        sold: p.unitsSold,
        rate,
        isHigh: rate >= 8.0,
      };
    });
  }, [topProducts]);

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Best Selling Product"
          value={kpis.bestSeller.length > 22 ? `${kpis.bestSeller.slice(0, 19)}...` : kpis.bestSeller}
          icon={Flame}
          iconBg="bg-emerald-500"
          sparklineColor="#10b981"
          trend={kpis.bestSeller !== "None" ? "up" : "neutral"}
          trendValue={kpis.bestSeller !== "None" ? "14.8" : "0.0"}
          loading={loading}
        />
        <StatCard
          title="Top Revenue Item"
          value={kpis.topRevenueProduct.length > 22 ? `${kpis.topRevenueProduct.slice(0, 19)}...` : kpis.topRevenueProduct}
          icon={TrendingUp}
          iconBg="bg-blue-500"
          sparklineColor="#3b82f6"
          trend={kpis.topRevenueProduct !== "None" ? "up" : "neutral"}
          trendValue={kpis.topRevenueProduct !== "None" ? "9.2" : "0.0"}
          loading={loading}
        />
        <StatCard
          title="Dead Stock items"
          value={deadStock.length}
          icon={Layers}
          iconBg="bg-orange-500"
          sparklineColor="#f97316"
          trend={deadStock.length > 0 ? "down" : "neutral"}
          trendValue={deadStock.length > 0 ? "2.4" : "0.0"}
          loading={loading}
        />
        <StatCard
          title="Low Stock Alerts"
          value={kpis.lowStock}
          icon={AlertTriangle}
          iconBg="bg-rose-500"
          sparklineColor="#f43f5e"
          trend={kpis.lowStock > 0 ? "down" : "neutral"}
          trendValue={kpis.lowStock > 0 ? "1.2" : "0.0"}
          loading={loading}
        />
      </div>

      {/* Top 10 products panel */}
      <ChartCard
        title="Top 10 Products by Revenue"
        subtitle="Catalog ranking based on gross sales conversion in the selected timeline"
        loading={loading}
      >
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 border-b border-gray-50 pb-2 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-12">Rank</th>
                  <th className="pb-3">Product details</th>
                  <th className="pb-3 text-center w-24">Units sold</th>
                  <th className="pb-3 w-72">Revenue share relative to top seller</th>
                  <th className="pb-3 text-right w-24">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.slice(0, 10).map((prod: any, idx: number) => {
                  const contribution = ((prod.revenue / (productsData?.totalRevenueSum || maxRevenue * 2)) * 100).toFixed(1);
                  return (
                    <tr key={prod.productId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-2 text-xs font-extrabold text-gray-400">#{idx + 1}</td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 leading-snug">{prod.title}</span>
                          <span className="text-xs text-gray-400 font-semibold">{prod.sku}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center text-sm font-bold text-gray-600">{prod.unitsSold} units</td>
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 shadow-inner overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all duration-700"
                              style={{ width: `${(prod.revenue / maxRevenue) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-black text-gray-900 w-24 text-right">
                            {formatCurrency(prod.revenue)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-xs font-semibold bg-gray-50 border border-gray-100/50 px-2 py-0.5 rounded-full text-gray-500">
                          {contribution}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      {/* Row splits categories & return rates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category donut */}
        <ChartCard
          title="Category Revenue Split"
          subtitle="Revenue breakdown across dynamic product categories"
          className="lg:col-span-5"
          loading={loading}
        >
          {categoryBreakdown.length > 0 ? (
            <div className="flex flex-col justify-between h-[260px]">
              <div className="h-[180px] relative flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="revenue"
                      nameKey="category"
                    >
                      {categoryBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
                {categoryBreakdown.map((entry: any, idx: number) => (
                  <div key={entry.category} className="flex items-center space-x-1.5 text-xs text-gray-500 font-semibold">
                    <span
                      className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span>{entry.category}</span>
                    <span className="text-gray-900">({formatCurrency(entry.revenue)})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        {/* Product return rates */}
        <ChartCard
          title="Return Rate by Product"
          subtitle="Fulfillment and cancellation frequencies on top-selling SKUs"
          className="lg:col-span-7"
          loading={loading}
        >
          {returnRateByProduct.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 border-b border-gray-50 pb-2 uppercase tracking-wider">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3 text-center">Sold Count</th>
                    <th className="pb-3 text-right">Return Ratio %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {returnRateByProduct.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 text-xs font-bold text-gray-900 truncate max-w-[200px]">
                        {p.title}
                      </td>
                      <td className="py-3 text-center text-xs font-semibold text-gray-500">
                        {p.sold} units
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                          p.isHigh ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}>
                          {p.rate.toFixed(1)}% {p.isHigh ? "🔴" : "🟢"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </div>

      {/* Stock alert triggers table */}
      <ChartCard
        title="Stock Alerts & Velocity Reorder"
        subtitle="Catalog stock levels and velocity calculations for prompt reorders"
        loading={loading}
        action={
          <div className="flex items-center gap-3">
            {/* Search filter */}
            <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1 w-44 shadow-inner">
              <Search className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-gray-700 focus:outline-none w-full"
              />
            </div>
            {/* Segment presets */}
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-xl border border-gray-100">
              <button
                onClick={() => setStockFilter("all")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  stockFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All Alerts
              </button>
              <button
                onClick={() => setStockFilter("oos")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  stockFilter === "oos" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Out of Stock
              </button>
              <button
                onClick={() => setStockFilter("low")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  stockFilter === "low" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Low Stock
              </button>
            </div>
          </div>
        }
      >
        {filteredStockAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 border-b border-gray-50 pb-2 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Product Name</th>
                  <th className="pb-3">SKU</th>
                  <th className="pb-3 text-center">Remaining Stock</th>
                  <th className="pb-3 text-center">Daily Sales Velocity</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-center w-36">Action status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStockAlerts.map((item) => {
                  const daysLeft = item.stock > 0 ? (item.stock / parseFloat(item.dailySales)).toFixed(1) : 0;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <span className="text-sm font-bold text-gray-900 leading-snug">{item.title}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-xs text-gray-400 font-semibold">{item.sku}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`text-sm font-extrabold ${item.stock <= 0 ? "text-rose-600 font-black" : "text-amber-600"}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="py-4 text-center text-xs font-semibold text-gray-500">
                        {item.dailySales} units/day
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(item.price)}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
                          item.stock <= 0 ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                          {item.stock <= 0 ? "OOS" : `${daysLeft} Days Left`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState description="No active stock warning records found." />
        )}
      </ChartCard>
    </div>
  );
};

export default ProductsTab;
