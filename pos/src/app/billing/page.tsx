"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Minus, Trash2, X, PauseCircle, PlayCircle } from "lucide-react";
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
  discount: number; // ₹ amount off this line's subtotal
  discountMode: "amount" | "percent"; // input mode (percent resolved to ₹ on submit/compute)
  discountInput: number; // raw value the operator typed
}

interface Courier { id: string; name: string; company?: string }

interface HeldSale {
  id: number;
  cart: CartLine[];
  channel: "online" | "offline";
  paymentMethod: "cash" | "card" | "upi";
  courierId: string;
  custName: string;
  custPhone: string;
  custCity: string;
  custId: string | null;
  label: string;
}

// Resolve a line's ₹ discount from its input + mode, clamped to the line subtotal.
function lineDiscountAmount(l: CartLine): number {
  const sub = l.price * l.quantity;
  const raw = l.discountMode === "percent" ? (sub * (l.discountInput || 0)) / 100 : (l.discountInput || 0);
  return Math.min(Math.max(raw, 0), sub);
}

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ProductUnit[]>([]);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const [channel, setChannel] = useState<"online" | "offline">("offline");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">("cash");

  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [courierId, setCourierId] = useState("");

  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custCity, setCustCity] = useState("");
  const [custId, setCustId] = useState<string | null>(null);

  const [billDiscountMode, setBillDiscountMode] = useState<"amount" | "percent">("amount");
  const [billDiscountInput, setBillDiscountInput] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<number>(0);

  const [held, setHeld] = useState<HeldSale[]>([]);
  const heldSeq = useRef(1);

  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{ url: string | null; changeDue?: number } | null>(null);

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
      return [...prev, { ...u, quantity: 1, discount: 0, discountMode: "amount", discountInput: 0 }];
    });
    setSearch("");
    setResults([]);
    searchRef.current?.focus();
  };

  // Barcode / exact-SKU quick add: Enter in the search box adds an exact SKU match,
  // or the single result, immediately.
  const onSearchKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const term = search.trim();
    if (!term) return;
    e.preventDefault();

    // Prefer an exact SKU match already loaded, else fetch fresh.
    let pool = results;
    if (pool.length === 0) {
      try {
        const r = await apiService.get(`/pos/products?search=${encodeURIComponent(term)}`);
        pool = r.data || [];
      } catch (err: any) {
        toast.error(err.message);
        return;
      }
    }
    const exact = pool.find((p) => (p.sku || "").toLowerCase() === term.toLowerCase());
    if (exact) return addToCart(exact);
    if (pool.length === 1) return addToCart(pool[0]);
    if (pool.length === 0) toast.error("No product found for that code");
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, quantity: Math.max(0, l.quantity + delta) } : l))
        .filter((l) => l.quantity > 0)
    );
  };

  const setLineDiscount = (id: string, input: number, mode: "amount" | "percent") => {
    setCart((prev) =>
      prev.map((l) => (l.id === id ? { ...l, discountInput: input, discountMode: mode } : l))
    );
  };

  const removeLine = (id: string) => setCart((prev) => prev.filter((l) => l.id !== id));

  const totals = useMemo(() => {
    const subtotal = cart.reduce((a, l) => a + l.price * l.quantity, 0);
    const lineDiscountTotal = cart.reduce((a, l) => a + lineDiscountAmount(l), 0);
    const afterLine = subtotal - lineDiscountTotal;
    const billDiscRaw =
      billDiscountMode === "percent" ? (afterLine * (billDiscountInput || 0)) / 100 : billDiscountInput || 0;
    const billDiscount = Math.min(Math.max(billDiscRaw, 0), afterLine);
    const tax = cart.reduce((a, l) => {
      const lineSub = l.price * l.quantity - lineDiscountAmount(l);
      return a + (lineSub * l.tax_rate) / 100;
    }, 0);
    const discountTotal = lineDiscountTotal + billDiscount;
    const total = subtotal - discountTotal + tax;
    const changeDue = paymentMethod === "cash" ? Math.max(0, (cashTendered || 0) - total) : 0;
    return { subtotal, discountTotal, billDiscount, tax, total, changeDue };
  }, [cart, billDiscountInput, billDiscountMode, cashTendered, paymentMethod]);

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

  const clearSaleFields = () => {
    setCart([]);
    setCustId(null);
    setCustName("");
    setCustPhone("");
    setCustCity("");
    setCourierId("");
    setBillDiscountInput(0);
    setCashTendered(0);
  };

  const resetSale = () => {
    clearSaleFields();
    setReceipt(null);
  };

  // Hold / park the current sale, then start fresh.
  const holdSale = () => {
    if (cart.length === 0) {
      toast.error("Nothing to hold");
      return;
    }
    const id = heldSeq.current++;
    setHeld((prev) => [
      ...prev,
      {
        id,
        cart,
        channel,
        paymentMethod,
        courierId,
        custName,
        custPhone,
        custCity,
        custId,
        label: custName || custPhone || `Bill #${id}`,
      },
    ]);
    clearSaleFields();
    toast.success("Sale held");
  };

  const resumeSale = (h: HeldSale) => {
    setCart(h.cart);
    setChannel(h.channel);
    setPaymentMethod(h.paymentMethod);
    setCourierId(h.courierId);
    setCustName(h.custName);
    setCustPhone(h.custPhone);
    setCustCity(h.custCity);
    setCustId(h.custId);
    setHeld((prev) => prev.filter((x) => x.id !== h.id));
    toast.info("Sale resumed");
  };

  const checkout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (paymentMethod === "cash" && cashTendered > 0 && cashTendered < totals.total) {
      toast.error("Cash tendered is less than the total");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((l) => ({
          productId: l.productId,
          variantId: l.variantId || undefined,
          quantity: l.quantity,
          discount: lineDiscountAmount(l),
        })),
        saleChannel: channel,
        paymentMethod,
        courierId: courierId || undefined,
        billDiscount: totals.billDiscount || undefined,
        cashTendered: paymentMethod === "cash" && cashTendered > 0 ? cashTendered : undefined,
        customer:
          custName || custPhone
            ? { id: custId || undefined, name: custName, phone: custPhone, city: custCity }
            : undefined,
      };
      const res = await apiService.post("/pos/sales", payload);
      toast.success("Sale completed");
      setReceipt({ url: res.invoicePdfUrl || null, changeDue: res.summary?.changeDue });
      clearSaleFields();
    } catch (e: any) {
      toast.error(e.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
      {/* LEFT: product search + cart */}
      <div className="flex flex-col gap-4">
        {/* Held sales bar */}
        {held.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
            <span className="text-xs font-semibold uppercase text-slate-400">Held</span>
            {held.map((h) => (
              <button
                key={h.id}
                onClick={() => resumeSale(h)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-gray-50"
              >
                <PlayCircle size={14} className="text-[#408dfb]" />
                {h.label} ({h.cart.length})
              </button>
            ))}
          </div>
        )}

        <div className="relative rounded-2xl bg-white p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5">
            <Search size={18} className="text-slate-400" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Scan barcode / SKU, or search product name... (Enter to add)"
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
              Scan or search products to start billing
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {cart.map((l) => {
                const disc = lineDiscountAmount(l);
                const lineTotal = l.price * l.quantity - disc;
                return (
                  <div key={l.id} className="flex flex-col gap-2 py-3">
                    <div className="flex items-center gap-3">
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
                        ₹{lineTotal.toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeLine(l.id)}
                        className="text-slate-300 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {/* Per-line discount */}
                    <div className="flex items-center gap-2 pl-1">
                      <span className="text-xs text-slate-400">Discount</span>
                      <input
                        type="number"
                        min={0}
                        value={l.discountInput || ""}
                        onChange={(e) =>
                          setLineDiscount(l.id, parseFloat(e.target.value) || 0, l.discountMode)
                        }
                        placeholder="0"
                        className="w-20 rounded-md border border-gray-200 bg-[#f8fafc] px-2 py-1 text-xs outline-none focus:border-[#408dfb]"
                      />
                      <div className="flex overflow-hidden rounded-md border border-gray-200">
                        {(["amount", "percent"] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setLineDiscount(l.id, l.discountInput, mode)}
                            className={`px-2 py-1 text-xs font-medium ${
                              l.discountMode === mode
                                ? "bg-[#408dfb] text-white"
                                : "bg-white text-slate-500 hover:bg-gray-50"
                            }`}
                          >
                            {mode === "amount" ? "₹" : "%"}
                          </button>
                        ))}
                      </div>
                      {disc > 0 && (
                        <span className="text-xs text-green-600">−₹{disc.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
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

          {/* Bill-level discount */}
          <div className="mb-3 flex items-center gap-2">
            <span className="flex-1 text-sm text-slate-500">Bill discount</span>
            <input
              type="number"
              min={0}
              value={billDiscountInput || ""}
              onChange={(e) => setBillDiscountInput(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-24 rounded-md border border-gray-200 bg-[#f8fafc] px-2 py-1.5 text-sm outline-none focus:border-[#408dfb]"
            />
            <div className="flex overflow-hidden rounded-md border border-gray-200">
              {(["amount", "percent"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBillDiscountMode(mode)}
                  className={`px-2.5 py-1.5 text-xs font-medium ${
                    billDiscountMode === mode
                      ? "bg-[#408dfb] text-white"
                      : "bg-white text-slate-500 hover:bg-gray-50"
                  }`}
                >
                  {mode === "amount" ? "₹" : "%"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountTotal > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>−₹{totals.discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Tax</span>
              <span>₹{totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-semibold text-slate-800">
              <span>Total</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Cash tendered → change */}
          {paymentMethod === "cash" && (
            <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-sm text-slate-500">Cash received</span>
                <input
                  type="number"
                  min={0}
                  value={cashTendered || ""}
                  onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-28 rounded-md border border-gray-200 bg-[#f8fafc] px-2 py-1.5 text-sm outline-none focus:border-[#408dfb]"
                />
              </div>
              {cashTendered > 0 && (
                <div className="flex justify-between text-sm font-semibold text-slate-800">
                  <span>Change due</span>
                  <span>₹{totals.changeDue.toFixed(2)}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {[100, 200, 500, 2000].map((d) => (
                  <button
                    key={d}
                    onClick={() => setCashTendered((c) => (c || 0) + d)}
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-gray-50"
                  >
                    +{d}
                  </button>
                ))}
                <button
                  onClick={() => setCashTendered(Math.ceil(totals.total))}
                  className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-gray-50"
                >
                  Exact
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={holdSale}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-3 text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <PauseCircle size={16} />
              Hold
            </button>
            <button
              onClick={checkout}
              disabled={submitting || cart.length === 0}
              className="flex-1 rounded-lg bg-[#408dfb] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Processing..." : `Complete Sale · ₹${totals.total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <button
              onClick={resetSale}
              className="ml-auto flex text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            <div className="mb-2 text-lg font-semibold text-slate-800">Sale Complete</div>
            {receipt.changeDue != null && receipt.changeDue > 0 && (
              <div className="mb-3 rounded-lg bg-amber-50 px-4 py-3 text-amber-800">
                <div className="text-xs uppercase">Change to return</div>
                <div className="text-2xl font-bold">₹{receipt.changeDue.toFixed(2)}</div>
              </div>
            )}
            {receipt.url ? (
              <a
                href={receipt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 block w-full rounded-lg bg-[#408dfb] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                View / Print Receipt
              </a>
            ) : (
              <p className="mb-3 text-sm text-slate-500">Receipt PDF unavailable.</p>
            )}
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
