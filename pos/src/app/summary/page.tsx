"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface DaySummary {
  date: string;
  ordersCount: number;
  revenue: number;
  discountTotal: number;
  byMethod: Record<string, number>;
  byChannel: Record<string, number>;
}

function todayStr() {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function SummaryPage() {
  const [date, setDate] = useState(todayStr());
  const [mine, setMine] = useState(false);
  const [data, setData] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiService
      .get(`/pos/summary?date=${date}${mine ? "&mine=true" : ""}`)
      .then((r) => setData(r.data))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [date, mine]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#408dfb]"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={mine}
            onChange={(e) => setMine(e.target.checked)}
            className="h-4 w-4 accent-[#408dfb]"
          />
          My sales only
        </label>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
          Loading...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Orders" value={`${data?.ordersCount ?? 0}`} />
            <StatCard label="Revenue" value={`₹${(data?.revenue ?? 0).toFixed(2)}`} />
            <StatCard label="Discounts" value={`₹${(data?.discountTotal ?? 0).toFixed(2)}`} />
            <StatCard
              label="Cash in drawer"
              value={`₹${(data?.byMethod?.cash ?? 0).toFixed(2)}`}
              highlight
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BreakdownCard title="By Payment Method" rows={data?.byMethod || {}} />
            <BreakdownCard title="By Channel" rows={data?.byChannel || {}} />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)] ${
        highlight ? "bg-[#408dfb] text-white" : "bg-white"
      }`}
    >
      <div className={`text-xs uppercase ${highlight ? "text-white/80" : "text-slate-400"}`}>
        {label}
      </div>
      <div className={`mt-1 text-xl font-semibold ${highlight ? "text-white" : "text-slate-800"}`}>
        {value}
      </div>
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: Record<string, number> }) {
  const entries = Object.entries(rows);
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
      <div className="mb-3 text-sm font-semibold text-slate-700">{title}</div>
      <div className="flex flex-col divide-y divide-gray-50">
        {entries.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 text-sm">
            <span className="capitalize text-slate-500">{k}</span>
            <span className="font-medium text-slate-700">₹{Number(v).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
