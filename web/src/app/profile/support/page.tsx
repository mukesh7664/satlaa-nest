"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  Loader2,
  X,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  supportService,
  SupportTicket,
  TicketStatus,
  TicketPriority,
} from "@/services/support.service";

const STATUS_META: Record<
  TicketStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  open: { label: "Open", className: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Loader2,
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-600 border-slate-200", icon: X },
};

const CATEGORIES = ["Order", "Payment", "Delivery", "Return / Refund", "Product", "Other"];
const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [description, setDescription] = useState("");

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supportService.getMyTickets();
      setTickets(data);
    } catch {
      toast.error("Failed to load your tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const resetForm = () => {
    setSubject("");
    setCategory(CATEGORIES[0]);
    setPriority("medium");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in the subject and description");
      return;
    }
    try {
      setSubmitting(true);
      await supportService.createTicket({ subject, description, category, priority });
      toast.success("Your complaint has been submitted");
      resetForm();
      setShowForm(false);
      loadTickets();
    } catch {
      toast.error("Could not submit your complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Support</h1>
            <p className="text-sm text-slate-500">Log a complaint and track its resolution</p>
          </div>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New Complaint"}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the issue"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm capitalize outline-none focus:border-blue-500"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p} className="capitalize">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe your issue in detail"
                  className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Complaint
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-bold text-slate-700">No support tickets yet</p>
          <p className="text-sm text-slate-500">
            Have an issue? Log a complaint and we&apos;ll help you out.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const meta = STATUS_META[t.status];
            const StatusIcon = meta.icon;
            return (
              <Link key={t.id} href={`/profile/support/${t.id}`}>
                <div className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="truncate font-bold text-slate-900">{t.subject}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {t.category} · Updated {new Date(t.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
