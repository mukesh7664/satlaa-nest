"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface Row {
  operatorId: string;
  operatorName: string;
  ordersCount: number;
  revenue: number;
  codCollected: number;
}

export default function StaffReportPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .get("/pos/reports/staff")
      .then((r) => setRows(r.data || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totals = rows.reduce(
    (a, r) => ({
      orders: a.orders + r.ordersCount,
      revenue: a.revenue + r.revenue,
      cod: a.cod + r.codCollected,
    }),
    { orders: 0, revenue: 0, cod: 0 }
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Orders" value={totals.orders.toString()} />
        <StatCard label="Revenue" value={`₹${totals.revenue.toFixed(2)}`} />
        <StatCard label="Cash Collected" value={`₹${totals.cod.toFixed(2)}`} />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-slate-400">
              <th className="px-4 py-3 font-medium">Staff</th>
              <th className="px-4 py-3 text-right font-medium">Orders</th>
              <th className="px-4 py-3 text-right font-medium">Revenue</th>
              <th className="px-4 py-3 text-right font-medium">Cash Collected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">Loading...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-400">No data yet</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.operatorId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{r.operatorName}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{r.ordersCount}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-700">
                    ₹{r.revenue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    ₹{r.codCollected.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
      <div className="text-xs uppercase text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-800">{value}</div>
    </div>
  );
}
