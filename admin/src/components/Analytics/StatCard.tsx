"use client";
import React from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg: string;
  sparklineColor: string;
  trend: "up" | "down" | "neutral";
  trendValue?: number | string;
  period?: string;
  loading?: boolean;
}

// Sparkline mock data generator
const generateSparklineData = (baseValue: number, trend: "up" | "down" | "neutral") => {
  return Array.from({ length: 12 }).map((_, i) => {
    const factor = trend === "up" ? 1.03 : trend === "down" ? 0.97 : 1;
    return {
      value: baseValue * Math.pow(factor, i) + (Math.random() * 8 - 4),
    };
  });
};

export const StatCard: React.FC<StatCardProps> = React.memo(({
  title,
  value,
  icon: Icon,
  iconBg,
  sparklineColor,
  trend,
  trendValue,
  period = "vs last period",
  loading = false,
}) => {
  const sparkData = React.useMemo(() => generateSparklineData(100, trend), [trend]);
  const gradientId = `color${title.replace(/\s+/g, "")}`;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col h-32 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-6 w-16 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
        <div className="mt-auto h-8 bg-gray-50 rounded" />
      </div>
    );
  }

  const isUp = trend === "up";
  const isDown = trend === "down";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col relative overflow-hidden transition-all hover:shadow-[0px_4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-4">
          <div
            className={`w-11 h-11 flex items-center justify-center text-white ${iconBg} shadow-sm`}
            style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
          >
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{title}</div>
            <div className="text-2xl font-bold text-gray-900 leading-tight">
              {value}
            </div>
          </div>
        </div>

        {trendValue !== undefined && (
          <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
            isUp ? "bg-emerald-50 text-emerald-600" : isDown ? "bg-rose-50 text-rose-600" : "bg-gray-50 text-gray-500"
          }`}>
            {isUp && <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
            {isDown && <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
            <span>
              {isUp ? "+" : ""}{trendValue}%
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end mt-4">
        <div className="text-[10px] text-gray-400 font-medium">
          {period}
        </div>
        <div className="h-10 w-24 -mr-2 -mb-2">
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
                strokeWidth={1.8}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = "StatCard";
export default StatCard;
