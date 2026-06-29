"use client";
import React from "react";
import { BarChart3 } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data yet",
  description = "No data available for the selected period.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center w-full h-full min-h-[220px]">
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100/60 shadow-sm">
        <BarChart3 className="w-7 h-7 text-gray-300" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{title}</h3>
      <p className="text-xs text-gray-400 max-w-[200px] font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
