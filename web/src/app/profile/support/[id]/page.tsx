"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Send,
  Clock,
  CheckCircle2,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  supportService,
  SupportTicket,
  TicketMessage,
  TicketStatus,
} from "@/services/support.service";

const STATUS_META: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", className: "bg-amber-50 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", className: "bg-green-50 text-green-700 border-green-200" },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function SupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [t, m] = await Promise.all([
        supportService.getTicketDetails(id),
        supportService.getTicketMessages(id),
      ]);
      setTicket(t);
      setMessages(m);
    } catch {
      toast.error("Could not load this ticket");
      router.push("/profile/support");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      setSending(true);
      await supportService.sendMessage(id, reply.trim());
      setReply("");
      await load();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    try {
      setClosing(true);
      await supportService.closeTicket(id);
      toast.success("Ticket closed");
      await load();
    } catch {
      toast.error("Failed to close ticket");
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!ticket) return null;

  const meta = STATUS_META[ticket.status];
  const isClosed = ticket.status === "closed";

  return (
    <div>
      <Link
        href="/profile/support"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Support
      </Link>

      {/* Ticket header */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h1 className="text-xl font-black text-slate-900">{ticket.subject}</h1>
          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${meta.className}`}
          >
            {meta.label}
          </span>
        </div>
        <p className="mb-4 whitespace-pre-wrap text-sm text-slate-600">{ticket.description}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-400">
          <span>Category: {ticket.category}</span>
          <span className="capitalize">Priority: {ticket.priority}</span>
          <span>Opened: {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Message thread */}
      <div className="mb-6 space-y-4">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No replies yet. Our team will respond shortly.
          </p>
        ) : (
          messages.map((m) => {
            const isCustomer = m.senderRole === "customer";
            return (
              <div
                key={m.id}
                className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] ${isCustomer ? "items-end" : "items-start"}`}>
                  <div
                    className={`mb-1 flex items-center gap-1.5 text-xs font-semibold ${
                      isCustomer ? "justify-end text-blue-600" : "text-slate-500"
                    }`}
                  >
                    {!isCustomer && <ShieldCheck className="h-3.5 w-3.5 text-green-600" />}
                    {m.senderName || (isCustomer ? "You" : "Support Team")}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                      isCustomer
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm border border-slate-100 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.message}</p>
                  </div>
                  <div
                    className={`mt-1 text-[10px] text-slate-400 ${
                      isCustomer ? "text-right" : "text-left"
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={threadEndRef} />
      </div>

      {/* Reply box */}
      {isClosed ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center text-sm text-slate-500">
          This ticket is closed. Send a message to reopen it.
        </div>
      ) : null}

      <form onSubmit={handleSend} className="mt-4">
        <div className="flex items-end gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            placeholder="Type your message..."
            className="flex-1 resize-none border-none bg-transparent px-2 py-1 text-sm outline-none"
          />
          <Button type="submit" disabled={sending || !reply.trim()} className="gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send
          </Button>
        </div>
      </form>

      {!isClosed && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={closing}
            className="gap-2 text-slate-600"
          >
            {closing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Close Ticket
          </Button>
        </div>
      )}
    </div>
  );
}
