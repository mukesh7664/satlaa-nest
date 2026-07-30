"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface Sale {
  id: string;
  orderNumber: string;
  totalAmount: number;
  saleChannel: string;
  paymentMethod: string;
  customerName: string | null;
  customerPhone: string | null;
  createdAt: string;
  courier?: { name: string } | null;
  items?: any[];
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [channel, setChannel] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const q = channel ? `?channel=${channel}` : "";
    apiService
      .get(`/pos/sales${q}`)
      .then((r) => setSales(r.data || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [channel]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {["", "offline", "online"].map((c) => (
          <button
            key={c || "all"}
            onClick={() => setChannel(c)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              channel === c
                ? "bg-[#408dfb] text-white"
                : "border border-gray-200 bg-white text-slate-600 hover:bg-gray-50"
            }`}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-slate-400">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Channel</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Courier</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  No sales yet
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{s.orderNumber}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.customerName || "Walk-in"}
                    {s.customerPhone ? (
                      <span className="block text-xs text-slate-400">{s.customerPhone}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        s.saleChannel === "offline"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {s.saleChannel}
                    </span>
                  </td>
                  <td className="px-4 py-3 uppercase text-slate-600">{s.paymentMethod}</td>
                  <td className="px-4 py-3 text-slate-600">{s.courier?.name || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-700">
                    ₹{Number(s.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(s.createdAt).toLocaleString()}
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
