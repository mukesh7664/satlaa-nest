"use client";
import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { getImageUrl } from "@/utils/imageUtils";
import { dashboardApiService, DashboardData } from "@/services/dashboard.api";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Page } from "@/services/pages.api";
import StoreSetupWidget from "@/components/StoreSetupWidget";
import {
  ShoppingBag,
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";

// Mock data for sparklines
const generateSparklineData = (baseValue: number, trend: 'up' | 'down') => {
  return Array.from({ length: 10 }).map((_, i) => ({
    value: trend === 'up'
      ? baseValue * (1 + (i * 0.05) + (Math.random() * 0.1 - 0.05))
      : baseValue * (1 - (i * 0.05) + (Math.random() * 0.1 - 0.05))
  }));
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

// Stat Card Component
const StatCard = React.memo(({ title, value, icon: Icon, iconBg, sparklineColor, trend, trendValue, isCurrency = false }: any) => {
  const sparkData = React.useMemo(() => generateSparklineData(10, trend), [trend]);
  const gradientId = `color${title.replace(/\s+/g, '')}`;
  return (
    <div className="bg-white rounded-2xl p-4 2xl:p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-start mb-3 2xl:mb-4">
        <div className="flex items-center space-x-3 2xl:space-x-4">
          <div
            className={`w-10 h-10 2xl:w-12 2xl:h-12 flex items-center justify-center text-white ${iconBg}`}
            style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
          >
            <Icon className="w-4.5 h-4.5 2xl:w-5 2xl:h-5" />
          </div>
          <div>
            <div className="text-xs 2xl:text-sm font-medium text-gray-500 mb-0.5 2xl:mb-1">{title}</div>
            <div className="text-xl 2xl:text-2xl font-bold text-gray-900 leading-tight">
              {isCurrency ? formatCurrency(value) : value.toLocaleString()}
            </div>
          </div>
        </div>
        <div className={`flex items-center text-xs 2xl:text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 mr-1" />}
          {trendValue}%
        </div>
      </div>
      <div className="h-12 w-full mt-auto -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={sparklineColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={sparklineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={sparklineColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { admin } = useAppSelector((state) => state.auth);

  const hasDashboardAccess = React.useMemo(() => {
    if (!admin) return false;
    if (admin.role === "admin") return true;
    return admin.permissions?.includes("dashboard.view") || admin.permissions?.includes('*');
  }, [admin]);

  const permissions = React.useMemo(() => admin?.permissions || [], [admin]);

  const getAccessibleRoutes = () => {
    const routes = [];
    if (permissions.includes("orders.view")) {
      routes.push({ title: "Orders", path: "/orders", icon: "📦", color: "bg-blue-100 text-blue-600" });
    }
    if (permissions.includes("products.view")) {
      routes.push({ title: "Products", path: "/products", icon: "🛍️", color: "bg-green-100 text-green-600" });
    }
    if (permissions.includes("customers.view")) {
      routes.push({ title: "Customers", path: "/customers", icon: "👥", color: "bg-purple-100 text-purple-600" });
    }
    if (permissions.includes("reports.view")) {
      routes.push({ title: "Reports", path: "/reports", icon: "📊", color: "bg-orange-100 text-orange-600" });
    }
    if (permissions.includes("settings.view")) {
      routes.push({ title: "Settings", path: "/settings", icon: "⚙️", color: "bg-gray-100 text-gray-600" });
    }
    return routes;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!hasDashboardAccess) {
        setLoading(false);
        return;
      }
      try {
        // Only show loading spinner on the initial fetch to prevent flickering
        if (!dashboardData && pages.length === 0) {
          setLoading(true);
        }
        const data = await dashboardApiService.getDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    if (admin) fetchDashboardData();
  }, [admin?.id, hasDashboardAccess]);

  if (loading) {
    return <div className="p-6 flex items-center justify-center py-20"><div className="text-gray-600">Loading dashboard...</div></div>;
  }

  if (!hasDashboardAccess) {
    const accessibleRoutes = getAccessibleRoutes();
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back, {admin?.name}!</h1>
          <p className="text-slate-500 mb-8">Select a module to get started.</p>
          {accessibleRoutes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {accessibleRoutes.map((route) => (
                <a key={route.path} href={route.path} className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-slate-300 group text-decoration-none">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 ${route.color} group-hover:scale-110 transition-transform`}>{route.icon}</div>
                  <span className="font-medium text-slate-700">{route.title}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-slate-500">You don't have access to any modules. Please contact your administrator.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return <div className="p-6 flex items-center justify-center py-20"><div className="text-red-600">Error: {error || "Failed to load data"}</div></div>;
  }

  const { summary, yearlyData, topProducts, topCustomers, topCategories, orderStats, setupStatus } = dashboardData;



  return (
    <div className="p-4 2xl:p-6 font-sans">
      {/* Store Completion Progress Bar */}
      {setupStatus && !setupStatus.isComplete && (
        <StoreSetupWidget setupStatus={setupStatus} />
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6 mb-4 2xl:mb-6">
        <StatCard
          title="Total Sales"
          value={summary.totalRevenue}
          icon={ShoppingBag}
          iconBg="bg-emerald-500"
          sparklineColor="#10b981"
          trend={(summary.trends?.salesTrend ?? 0) >= 0 ? "up" : "down"}
          trendValue={Math.abs(summary.trends?.salesTrend ?? 0).toFixed(2)}
          isCurrency={true}
        />
        <StatCard
          title="Total Income"
          value={summary.monthlyRevenue}
          icon={DollarSign}
          iconBg="bg-orange-500"
          sparklineColor="#f97316"
          trend={(summary.trends?.incomeTrend ?? 0) >= 0 ? "up" : "down"}
          trendValue={Math.abs(summary.trends?.incomeTrend ?? 0).toFixed(2)}
          isCurrency={true}
        />
        <StatCard
          title="Orders Paid"
          value={summary.paidOrdersCount ?? 0}
          icon={FileText}
          iconBg="bg-slate-500"
          sparklineColor="#94a3b8"
          trend={(summary.trends?.deliveredTrend ?? 0) >= 0 ? "up" : "down"}
          trendValue={Math.abs(summary.trends?.deliveredTrend ?? 0).toFixed(2)}
        />
        <StatCard
          title="Total Customers"
          value={summary.totalCustomers}
          icon={Users}
          iconBg="bg-blue-500"
          sparklineColor="#3b82f6"
          trend={(summary.trends?.customersTrend ?? 0) >= 0 ? "up" : "down"}
          trendValue={Math.abs(summary.trends?.customersTrend ?? 0).toFixed(2)}
        />
      </div>

      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Recent Order Chart */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl p-4 2xl:p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50">
          <div className="flex justify-between items-center mb-4 2xl:mb-6">
            <h3 className="text-base 2xl:text-lg font-bold text-gray-900">Recent Order</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4 2xl:w-5 2xl:h-5" /></button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-4 2xl:p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50">
          <div className="flex justify-between items-center mb-4 2xl:mb-6">
            <h3 className="text-base 2xl:text-lg font-bold text-gray-900">Top Products</h3>
            <button className="flex items-center text-[10px] 2xl:text-xs text-gray-500 hover:text-gray-700 font-medium">
              View all <ChevronDown className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 ml-1" />
            </button>
          </div>
          <div className="space-y-5">
            {topProducts.slice(0, 5).map((product, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 w-1/2">
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {getImageUrl(product.image) ? (
                      <img src={getImageUrl(product.image)!} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.quantity} items</div>
                  </div>
                </div>
                <div className="flex flex-col items-center w-1/4">
                  <span className="text-xs text-gray-500">Unit Price</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(product.quantity > 0 ? product.price / product.quantity : product.price)}
                  </span>
                </div>
                <div className="flex flex-col items-end w-1/4">
                  <span className="text-xs text-gray-500">Revenue</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers (Adapted from Top Countries) */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-2xl p-4 2xl:p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50">
          <div className="flex justify-between items-center mb-4 2xl:mb-6">
            <h3 className="text-base 2xl:text-lg font-bold text-gray-900">Top Customers</h3>
            <button className="flex items-center text-[10px] 2xl:text-xs text-gray-500 hover:text-gray-700 font-medium">
              View all <ChevronDown className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 ml-1" />
            </button>
          </div>
          <div className="mb-3 2xl:mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl 2xl:text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</span>
              <span className={`text-[10px] 2xl:text-xs font-medium flex items-center ${(summary.trends?.salesTrend ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {(summary.trends?.salesTrend ?? 0) >= 0 ? (
                  <TrendingUp className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 mr-0.5 2xl:mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 mr-0.5 2xl:mr-1" />
                )}
                {Math.abs(summary.trends?.salesTrend ?? 0).toFixed(2)}%
              </span>
            </div>
            <div className="text-xs text-gray-400">since last month</div>
          </div>
          <div className="space-y-4 mt-6">
            {topCustomers.slice(0, 5).map((customer, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs overflow-hidden">
                    {getImageUrl(customer.image) ? (
                      <img src={getImageUrl(customer.image)!} alt={customer.name} className="w-full h-full object-cover" />
                    ) : (
                      customer.name.charAt(0)
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[100px]">{customer.name}</span>
                </div>
                <div className="w-8 h-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generateSparklineData(10, idx % 2 === 0 ? 'up' : 'down')}>
                      <Line type="monotone" dataKey="value" stroke={idx % 2 === 0 ? "#10b981" : "#ef4444"} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Top Categories By Sales (Adapted from Best Shop Sellers) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-4 2xl:p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50">
          <div className="flex justify-between items-center mb-4 2xl:mb-6">
            <h3 className="text-base 2xl:text-lg font-bold text-gray-900">Top Categories</h3>
            <button className="flex items-center text-[10px] 2xl:text-xs text-gray-500 hover:text-gray-700 font-medium">
              View all <ChevronDown className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 ml-1" />
            </button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-gray-900 pb-2 border-b border-gray-50">
                <th className="pb-3">Category</th>
                <th className="pb-3 text-right">Revenue</th>
                <th className="pb-3 text-right">Products</th>
              </tr>
            </thead>
            <tbody>
              {topCategories.slice(0, 5).map((category, idx) => {
                const colors = ['bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500'];
                return (
                  <tr key={idx} className="border-b border-gray-50 last:border-0">
                    <td className="py-4">
                      <div className="text-sm font-semibold text-gray-900">{category.name}</div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(category.revenue)}</div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm font-medium text-gray-600">{category.productsCount} Products</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Product Overview */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-4 2xl:p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50">
          <div className="flex justify-between items-center mb-4 2xl:mb-6">
            <h3 className="text-base 2xl:text-lg font-bold text-gray-900">Product overview</h3>
            <Link href="/manage-products/product-list">
              <button className="flex items-center text-[10px] 2xl:text-xs text-gray-500 hover:text-gray-700 font-medium">
                View all <ChevronDown className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 ml-1" />
              </button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="text-xs font-semibold text-gray-900 border-b border-gray-50">
                  <th className="pb-3 pl-2">Name</th>
                  <th className="pb-3">Product ID</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.slice(0, 10).map((product, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pl-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {getImageUrl(product.image) ? (
                            <img src={getImageUrl(product.image)!} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag size={16} className="text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-600">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm text-gray-500">#{300 + idx}</td>
                    <td className="py-3 text-sm text-gray-900 font-medium">{formatCurrency(product.price)}</td>
                    <td className="py-3 text-sm text-gray-900 font-medium">{formatCurrency(product.price * product.quantity)}</td>
                    <td className="py-3">
                      {product.isActive !== false && (product.stock === null || product.stock === undefined || product.stock > 0) ? (
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded">Available</span>
                      ) : (
                        <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded">Not Available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
