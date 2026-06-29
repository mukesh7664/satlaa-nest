"use client";
import React from "react";
import LoadingSkeleton from "./LoadingSkeleton";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  action,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-[0px_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>

      {loading ? (
        <div className="py-4">
          <LoadingSkeleton className="h-[280px] w-full" />
        </div>
      ) : (
        <div className="flex-1 w-full relative">{children}</div>
      )}
    </div>
  );
};

export default ChartCard;
