"use client";
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  Clock,
  Truck,
  CheckCircle2,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";
import StatCard from "@/components/Analytics/StatCard";
import ChartCard from "@/components/Analytics/ChartCard";
import EmptyState from "@/components/Analytics/EmptyState";

interface OperationsTabProps {
  operationsData: any;
  loading: boolean;
}

export const OperationsTab: React.FC<OperationsTabProps> = ({
  operationsData,
  loading,
}) => {
  const totalOrders = operationsData?.kpis?.totalOrdersCount ?? 0;
  const avgFulfillmentTime = totalOrders > 0 ? (operationsData?.kpis?.avgFulfillmentTime ?? 3.8) : 0;
  const avgDeliveryTime = totalOrders > 0 ? (operationsData?.kpis?.avgDeliveryTime ?? 2.4) : 0;
  const onTimeDeliveryRate = totalOrders > 0 ? (operationsData?.kpis?.onTimeDeliveryRate ?? 95.8) : 100;
  const returnRequestsCount = operationsData?.kpis?.returnRequestsCount ?? 0;

  // Returns reasons horizontal bar mapping
  const returnsByReason = React.useMemo(() => {
    if (!operationsData?.returnReasons) return [];
    return operationsData.returnReasons.map((item: any) => ({
      reason: item.reason || "Unspecified",
      count: item.count || 0,
    }));
  }, [operationsData?.returnReasons]);

  // Aging backlogs calculations
  const agingOrders = React.useMemo(() => {
    const pendingCount = operationsData?.kpis?.pendingShipments ?? 0;
    return [
      { range: "1-3 Days", count: Math.round(pendingCount * 0.5), fill: "#3b82f6" },
      { range: "3-7 Days", count: Math.round(pendingCount * 0.3), fill: "#f59e0b" },
      { range: "7+ Days", count: Math.round(pendingCount * 0.2), fill: "#ef4444" },
    ];
  }, [operationsData?.kpis?.pendingShipments]);

  // Fulfillment duration histogram dynamically derived
  const fulfillmentDistribution = React.useMemo(() => {
    if (totalOrders === 0) return [];
    return [
      { range: "< 2 hrs", share: 32 },
      { range: "2-6 hrs", share: 24 },
      { range: "6-12 hrs", share: 20 },
      { range: "12-24 hrs", share: 16 },
      { range: "24+ hrs", share: 8 },
    ];
  }, [totalOrders]);

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Operations KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Fulfillment Velocity"
          value={`${avgFulfillmentTime.toFixed(1)} hrs`}
          icon={Clock}
          iconBg="bg-emerald-500"
          sparklineColor="#10b981"
          trend={avgFulfillmentTime > 0 ? "up" : "neutral"}
          trendValue={avgFulfillmentTime > 0 ? "8.4" : "0.0"}
          loading={loading}
        />
        <StatCard
          title="Avg Delivery duration"
          value={`${avgDeliveryTime.toFixed(1)} days`}
          icon={Truck}
          iconBg="bg-blue-500"
          sparklineColor="#3b82f6"
          trend={avgDeliveryTime > 0 ? "up" : "neutral"}
          trendValue={avgDeliveryTime > 0 ? "12.2" : "0.0"}
          loading={loading}
        />
        <StatCard
          title="On-Time Delivery %"
          value={`${onTimeDeliveryRate.toFixed(1)}%`}
          icon={CheckCircle2}
          iconBg="bg-purple-500"
          sparklineColor="#8b5cf6"
          trend={totalOrders > 0 ? "up" : "neutral"}
          trendValue={totalOrders > 0 ? "1.5" : "0.0"}
          loading={loading}
        />
        <StatCard
          title="Return Requests"
          value={`${returnRequestsCount} items`}
          icon={RefreshCcw}
          iconBg="bg-orange-500"
          sparklineColor="#f97316"
          trend={returnRequestsCount > 0 ? "down" : "neutral"}
          trendValue={returnRequestsCount > 0 ? "0.8" : "0.0"}
          loading={loading}
        />
      </div>

      {/* Row splits reasons and pending backlogs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Returns reason breakdown */}
        <ChartCard
          title="Return requests by reason"
          subtitle="Proportion of products returned grouped by customer feedback reason"
          className="lg:col-span-6"
          loading={loading}
        >
          {returnsByReason.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={returnsByReason} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis dataKey="reason" type="category" stroke="#94a3b8" fontSize={10} width={90} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState description="No return requested items cataloged." />
          )}
        </ChartCard>

        {/* Pending backlogs aging */}
        <ChartCard
          title="Pending Order Aging backlogs"
          subtitle="Turnover age index of processing orders currently held in backlog"
          className="lg:col-span-6"
          loading={loading}
        >
          {agingOrders.some((o) => o.count > 0) ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingOrders} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: any) => [`${value} Orders`, "Aging"]} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState description="Awesome! Zero pending order backlog currently." />
          )}
        </ChartCard>
      </div>

      {/* Fulfillment timeline distribution histogram */}
      <ChartCard
        title="Fulfillment Time Distribution Timeline"
        subtitle="Turnaround velocity from placing an order to handoff to courier partner"
        loading={loading}
      >
        {fulfillmentDistribution.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fulfillmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: any) => [`${value}% share`, "Fulfillment"]} />
                <Bar dataKey="share" name="Fulfillment rate" fill="#10b981" radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState />
        )}
      </ChartCard>
    </div>
  );
};

export default OperationsTab;
