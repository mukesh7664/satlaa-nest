"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { apiService } from "@/services/api";

interface Courier {
  id: string;
  name: string;
  phone?: string;
  company?: string;
  isActive: boolean;
}

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Courier | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", company: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    apiService
      .get("/pos/couriers?includeInactive=true")
      .then((r) => setCouriers(r.data || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", phone: "", company: "" });
    setModalOpen(true);
  };

  const openEdit = (c: Courier) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone || "", company: c.company || "" });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await apiService.put(`/pos/couriers/${editing.id}`, form);
        toast.success("Courier updated");
      } else {
        await apiService.post("/pos/couriers", form);
        toast.success("Courier added");
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (c: Courier) => {
    if (!confirm(`Deactivate courier "${c.name}"?`)) return;
    try {
      await apiService.delete(`/pos/couriers/${c.id}`);
      toast.success("Courier deactivated");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-[#408dfb] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} />
          Add Courier
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-slate-400">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : couriers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No couriers yet
                </td>
              </tr>
            ) : (
              couriers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{c.company || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-slate-400 hover:text-[#408dfb]"
                      >
                        <Pencil size={16} />
                      </button>
                      {c.isActive && (
                        <button
                          onClick={() => deactivate(c)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">
                {editing ? "Edit Courier" : "Add Courier"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name *"
                className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:border-[#408dfb]"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone"
                className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:border-[#408dfb]"
              />
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company"
                className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:border-[#408dfb]"
              />
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="mt-4 w-full rounded-lg bg-[#408dfb] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
