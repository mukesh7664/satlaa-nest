"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Minus, Trash2, X } from "lucide-react";
import { apiService } from "@/services/api";

interface ProductUnit {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  sku: string;
  price: number;
  tax_rate: number;
  stock: number | null;
}

interface CartLine extends ProductUnit {
  quantity: number;
}

interface Courier { id: string; name: string; company?: string }

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ProductUnit[]>([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);

  const [channel, setChannel] = useState<"online" | "offline">("offline");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">("cash");

  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [courierId, setCourierId] = useState("");

  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custCity, setCustCity] = useState("");
  const [custId, setCustId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  useEffect(() => {
    apiService.get("/pos/couriers").then((r) => setCouriers(r.data || [])).catch(() => {});
  }, []);

  // Debounced product search
  useEffect(() => {
    const term = search.trim();
    if (term.length < 1) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      apiService
        .get(`/pos/products?search=${encodeURIComponent(term)}`)
        .then((r) => setResults(r.data || []))
        .catch((e) => toast.error(e.message))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const addToCart = (u: ProductUnit) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.id === u.id);
      if (existing) {
        return prev.map((l) => (l.id === u.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { ...u, quantity: 1 }];
    });
    setSearch("");
    setResults([]);
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, quantity: Math.max(0, l.quantity + delta) } : l))
        .filter((l) => l.quantity > 0)
    );
  };

  const removeLine = (id: string) => setCart((prev) => prev.filter((l) => l.id !== id));

  const totals = useMemo(() => {
    const subtotal = cart.reduce((a, l) => a + l.price * l.quantity, 0);
    const tax = cart.reduce((a, l) => a + (l.price * l.quantity * l.tax_rate) / 100, 0);
    return { subtotal, tax, total: subtotal + tax };
  }, [cart]);

  const lookupPhone = async () => {
    const phone = custPhone.trim();
    if (!phone) return;
    try {
      const r = await apiService.get(`/pos/customers?phone=${encodeURIComponent(phone)}`);
      if (r.data) {
        setCustId(r.data.id);
        setCustName(r.data.name || "");
        setCustCity(r.data.city || "");
        toast.success("Customer found");
      } else {
        setCustId(null);
        toast.info("No customer with that phone — will create new");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const resetSale = () => {
    setCart([]);
    setCustId(null);
    setCustName("");
    setCustPhone("");
    setCustCity("");
    setCourierId("");
    setReceiptUrl(null);
  };

  const checkout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((l) => ({
          productId: l.productId,
          variantId: l.variantId || undefined,
          quantity: l.quantity,
        })),
        saleChannel: channel,
        paymentMethod,
        courierId: courierId || undefined,
        customer:
          custName || custPhone
            ? { id: custId || undefined, name: custName, phone: custPhone, city: custCity }
            : undefined,
      };
      const res = await apiService.post("/pos/sales", payload);
      toast.success("Sale completed");
      setReceiptUrl(res.invoicePdfUrl || null);
      setCart([]);
      setCustId(null);
      setCustName("");
      setCustPhone("");
      setCustCity("");
      setCourierId("");
    } catch (e: any) {
      toast.error(e.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      {/* LEFT: product search + cart */}
      <div className="flex flex-col gap-4">
        <div className="relative rounded-2xl bg-white p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name or SKU..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none"
            />
          </div>
          {(results.length > 0 || searching) && (
            <div className="absolute left-4 right-4 z-20 mt-2 max-h-72 overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg">
              {searching && <div className="px-4 py-3 text-sm text-slate-400">Searching...</div>}
              {results.map((u) => (
                <button
                  key={u.id}
                  onClick={() => addToCart(u)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-800">{u.name}</div>
                    <div className="text-xs text-slate-400">
                      {u.sku || "No SKU"} ·{" "}
                      {u.stock === null ? "∞ stock" : `${u.stock} in stock`}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">₹{u.price}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
          <div className="mb-3 text-sm font-semibold text-slate-700">Cart ({cart.length})</div>
          {cart.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Search and add products to start billing
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {cart.map((l) => (
                <div key={l.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{l.name}</div>
                    <div className="text-xs text-slate-400">
                      ₹{l.price} · {l.tax_rate}% tax
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => changeQty(l.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-slate-600 hover:bg-gray-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{l.quantity}</span>
                    <button
                      onClick={() => changeQty(l.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-slate-600 hover:bg-gray-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold text-slate-700">
                    ₹{(l.price * l.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeLine(l.id)}
                    className="text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: sale details + checkout */}
      <div className="flex flex-col gap-4">
        {/* Channel toggle */}
        <div className="rounded-2xl bg-white p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
          <div className="mb-2 text-sm font-semibold text-slate-700">Sale Channel</div>
          <div className="grid grid-cols-2 gap-2">
            {(["offline", "online"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  channel === c
                    ? "bg-[#408dfb] text-white"
                    : "border border-gray-200 text-slate-600 hover:bg-gray-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Customer */}
        <div className="rounded-2xl bg-white p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
          <div className="mb-2 text-sm font-semibold text-slate-700">Customer</div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="Phone"
                className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:border-[#408dfb]"
              />
              <button
                onClick={lookupPhone}
                className="whitespace-nowrap rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50"
              >
                Look up
              </button>
            </div>
            <input
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="Name"
              className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:border-[#408dfb]"
            />
            <input
              value={custCity}
              onChange={(e) => setCustCity(e.target.value)}
              placeholder="City"
              className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:border-[#408dfb]"
            />
          </div>
        </div>

        {/* Courier */}
        <div className="rounded-2xl bg-white p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
          <div className="mb-2 text-sm font-semibold text-slate-700">Courier (optional)</div>
          <select
            value={courierId}
            onChange={(e) => setCourierId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:border-[#408dfb]"
          >
            <option value="">— None —</option>
            {couriers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` (${c.company})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Payment + totals */}
        <div className="rounded-2xl bg-white p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
          <div className="mb-2 text-sm font-semibold text-slate-700">Payment</div>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {(["cash", "card", "upi"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`rounded-lg px-3 py-2 text-sm font-medium uppercase transition-colors ${
                  paymentMethod === m
                    ? "bg-[#408dfb] text-white"
                    : "border border-gray-200 text-slate-600 hover:bg-gray-50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax</span>
              <span>₹{totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-semibold text-slate-800">
              <span>Total</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={checkout}
            disabled={submitting || cart.length === 0}
            className="mt-4 w-full rounded-lg bg-[#408dfb] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Processing..." : `Complete Sale · ₹${totals.total.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* Receipt modal */}
      {receiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <button
              onClick={resetSale}
              className="ml-auto flex text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            <div className="mb-2 text-lg font-semibold text-slate-800">Sale Complete</div>
            <p className="mb-4 text-sm text-slate-500">Receipt generated successfully.</p>
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 block w-full rounded-lg bg-[#408dfb] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              View / Print Receipt
            </a>
            <button
              onClick={resetSale}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-gray-50"
            >
              New Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
