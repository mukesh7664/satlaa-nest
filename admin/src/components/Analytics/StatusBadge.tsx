"use client";
import React from "react";

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  paid: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  pending: "bg-amber-50 text-amber-700 border border-amber-100",
  processing: "bg-blue-50 text-blue-700 border border-blue-100",
  shipped: "bg-blue-50 text-blue-700 border border-blue-100",
  cancelled: "bg-rose-50 text-rose-700 border border-rose-100",
  returned: "bg-purple-50 text-purple-700 border border-purple-100",
  failed: "bg-rose-50 text-rose-700 border border-rose-100",
  available: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  "not available": "bg-rose-50 text-rose-700 border border-rose-100",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const norm = status?.toLowerCase().trim() || "pending";
  const badgeClass = statusColors[norm] || "bg-gray-50 text-gray-700 border border-gray-100";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
