"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  PauseCircle,
  PlayCircle,
  ShoppingCart,
  Package,
} from "lucide-react";
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
  discountMode: "amount" | "percent";
  discountInput: number;
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

function lineDiscountAmount(l: CartLine): number {
  const sub = l.price * l.quantity;
  const raw = l.discountMode === "percent" ? (sub * (l.discountInput || 0)) / 100 : l.discountInput || 0;
  return Math.min(Math.max(raw, 0), sub);
}

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductUnit[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
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
  const [showCustomer, setShowCustomer] = useState(false);

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

  // Load products (debounced). Empty search = full catalog grid.
  useEffect(() => {
    const term = search.trim();
    setLoadingProducts(true);
    const t = setTimeout(
      () => {
        apiService
          .get(`/pos/products?search=${encodeURIComponent(term)}`)
          .then((r) => setProducts(r.data || []))
          .catch((e) => toast.error(e.message))
          .finally(() => setLoadingProducts(false));
      },
      term.length < 1 ? 0 : 300
    );
    return () => clearTimeout(t);
  }, [search]);

  const cartQty = (unitId: string) => cart.find((l) => l.id === unitId)?.quantity || 0;

  const addToCart = (u: ProductUnit) => {
    if (u.stock !== null && cartQty(u.id) >= u.stock) {
      toast.error(`Only ${u.stock} in stock`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.id === u.id);
      if (existing) {
        return prev.map((l) => (l.id === u.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { ...u, quantity: 1, discountMode: "amount", discountInput: 0 }];
    });
  };

  // Barcode / exact-SKU: Enter adds an exact SKU match or the only result.
  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    const term = search.trim();
    if (!term) return;
    e.preventDefault();
    const exact = products.find((p) => (p.sku || "").toLowerCase() === term.toLowerCase());
    if (exact) {
      addToCart(exact);
      setSearch("");
      return;
    }
    if (products.length === 1) {
      addToCart(products[0]);
      setSearch("");
      return;
    }
    if (products.length === 0) toast.error("No product found for that code");
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, quantity: Math.max(0, l.quantity + delta) } : l))
        .filter((l) => l.quantity > 0)
    );
  };

  const setLineDiscount = (id: string, input: number, mode: "amount" | "percent") => {
    setCart((prev) => prev.map((l) => (l.id === id ? { ...l, discountInput: input, discountMode: mode } : l)));
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
    const itemCount = cart.reduce((a, l) => a + l.quantity, 0);
    return { subtotal, discountTotal, billDiscount, tax, total, changeDue, itemCount };
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
        toast.info("New customer — will be saved");
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
    setShowCustomer(false);
  };

  const resetSale = () => {
    clearSaleFields();
    setReceipt(null);
  };

  const holdSale = () => {
    if (cart.length === 0) return toast.error("Nothing to hold");
    const id = heldSeq.current++;
    setHeld((prev) => [
      ...prev,
      { id, cart, channel, paymentMethod, courierId, custName, custPhone, custCity, custId, label: custName || custPhone || `Bill #${id}` },
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
    if (cart.length === 0) return toast.error("Cart is empty");
    if (paymentMethod === "cash" && cashTendered > 0 && cashTendered < totals.total) {
      return toast.error("Cash received is less than total");
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
        customer: custName || custPhone ? { id: custId || undefined, name: custName, phone: custPhone, city: custCity } : undefined,
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
    <div className="grid h-[calc(100vh-108px)] grid-cols-1 gap-5 lg:grid-cols-[1fr_400px] 2xl:h-[calc(100vh-120px)]">
      {/* ============ LEFT: search + product grid ============ */}
      <div className="flex flex-col gap-4 overflow-hidden">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
          <Search size={18} className="text-slate-400" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Scan barcode / SKU or search product name..."
            className="w-full bg-transparent text-sm text-slate-800 outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Held sales */}
        {held.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Held bills:</span>
            {held.map((h) => (
              <button
                key={h.id}
                onClick={() => resumeSale(h)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
              >
                <PlayCircle size={14} />
                {h.label} ({h.cart.length})
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-slate-400">
              <Package size={40} strokeWidth={1.5} />
              <p className="text-sm">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((u) => {
                const inCart = cartQty(u.id);
                const soldOut = u.stock !== null && u.stock <= 0;
                return (
                  <button
                    key={u.id}
                    onClick={() => addToCart(u)}
                    disabled={soldOut}
                    className={`relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                      soldOut
                        ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                        : "border-gray-200 bg-white hover:border-[#408dfb] hover:shadow-md"
                    }`}
                  >
                    {inCart > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#408dfb] px-1.5 text-xs font-bold text-white">
                        {inCart}
                      </span>
                    )}
                    <div className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-tight text-slate-800">
                      {u.name}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-base font-semibold text-slate-900">₹{u.price}</div>
                        <div className="text-[11px] text-slate-400">
                          {soldOut ? "Sold out" : u.stock === null ? "In stock" : `${u.stock} left`}
                        </div>
                      </div>
                      {!soldOut && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#408dfb]/10 text-[#408dfb]">
                          <Plus size={16} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============ RIGHT: cart + checkout ============ */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.04)]">
        {/* Cart header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <ShoppingCart size={18} className="text-[#408dfb]" />
            Cart
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-slate-500">
              {totals.itemCount}
            </span>
          </div>
          {cart.length > 0 && (
            <button onClick={clearSaleFields} className="text-xs font-medium text-red-500 hover:underline">
              Clear
            </button>
          )}
        </div>

        {/* Cart lines (scrollable) */}
        <div className="flex-1 overflow-y-auto px-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-slate-400">
              <ShoppingCart size={36} strokeWidth={1.5} />
              <p className="text-sm">Tap a product to add it</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {cart.map((l) => {
                const disc = lineDiscountAmount(l);
                const lineTotal = l.price * l.quantity - disc;
                return (
                  <div key={l.id} className="flex flex-col gap-2 py-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium leading-tight text-slate-800">{l.name}</div>
                        <div className="text-xs text-slate-400">₹{l.price} · {l.tax_rate}% tax</div>
                      </div>
                      <button onClick={() => removeLine(l.id)} className="text-slate-300 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => changeQty(l.id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-slate-600 hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{l.quantity}</span>
                        <button
                          onClick={() => changeQty(l.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-slate-600 hover:bg-gray-50"
                        >
                          <Plus size={14} />
                        </button>
                        {/* line discount */}
                        <input
                          type="number"
                          min={0}
                          value={l.discountInput || ""}
                          onChange={(e) => setLineDiscount(l.id, parseFloat(e.target.value) || 0, l.discountMode)}
                          placeholder="disc"
                          className="ml-1 w-14 rounded-md border border-gray-200 bg-[#f8fafc] px-1.5 py-1 text-xs outline-none focus:border-[#408dfb]"
                        />
                        <button
                          onClick={() =>
                            setLineDiscount(l.id, l.discountInput, l.discountMode === "amount" ? "percent" : "amount")
                          }
                          className="rounded-md border border-gray-200 px-1.5 py-1 text-xs font-medium text-slate-500 hover:bg-gray-50"
                        >
                          {l.discountMode === "amount" ? "₹" : "%"}
                        </button>
                      </div>
                      <div className="text-sm font-semibold text-slate-800">₹{lineTotal.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Checkout footer (sticky) */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
          {/* Compact options row */}
          <div className="mb-3 flex flex-col gap-2">
            {/* channel + customer toggle */}
            <div className="flex gap-2">
              <div className="flex flex-1 overflow-hidden rounded-lg border border-gray-200">
                {(["offline", "online"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setChannel(c)}
                    className={`flex-1 py-1.5 text-xs font-medium capitalize ${
                      channel === c ? "bg-[#408dfb] text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowCustomer((s) => !s)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  custName || custPhone
                    ? "border-[#408dfb] bg-[#408dfb]/10 text-[#408dfb]"
                    : "border-gray-200 bg-white text-slate-600"
                }`}
              >
                {custName || custPhone ? custName || custPhone : "+ Customer"}
              </button>
            </div>

            {/* customer panel */}
            {showCustomer && (
              <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-2">
                <div className="flex gap-2">
                  <input
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full rounded-md border border-gray-200 bg-[#f8fafc] px-2 py-1.5 text-xs outline-none focus:border-[#408dfb]"
                  />
                  <button
                    onClick={lookupPhone}
                    className="whitespace-nowrap rounded-md border border-gray-200 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-gray-50"
                  >
                    Find
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded-md border border-gray-200 bg-[#f8fafc] px-2 py-1.5 text-xs outline-none focus:border-[#408dfb]"
                  />
                  <input
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    placeholder="City"
                    className="w-full rounded-md border border-gray-200 bg-[#f8fafc] px-2 py-1.5 text-xs outline-none focus:border-[#408dfb]"
                  />
                </div>
                <select
                  value={courierId}
                  onChange={(e) => setCourierId(e.target.value)}
                  className="w-full rounded-md border border-gray-200 bg-[#f8fafc] px-2 py-1.5 text-xs outline-none focus:border-[#408dfb]"
                >
                  <option value="">Courier (optional)</option>
                  {couriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.company ? ` (${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* payment method */}
            <div className="flex overflow-hidden rounded-lg border border-gray-200">
              {(["cash", "card", "upi"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`flex-1 py-1.5 text-xs font-medium uppercase ${
                    paymentMethod === m ? "bg-[#408dfb] text-white" : "bg-white text-slate-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* bill discount + cash */}
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2">
                <span className="text-[11px] text-slate-400">Bill disc</span>
                <input
                  type="number"
                  min={0}
                  value={billDiscountInput || ""}
                  onChange={(e) => setBillDiscountInput(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-transparent py-1.5 text-xs outline-none"
                />
                <button
                  onClick={() => setBillDiscountMode((m) => (m === "amount" ? "percent" : "amount"))}
                  className="text-xs font-medium text-[#408dfb]"
                >
                  {billDiscountMode === "amount" ? "₹" : "%"}
                </button>
              </div>
              {paymentMethod === "cash" && (
                <div className="flex flex-1 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2">
                  <span className="text-[11px] text-slate-400">Cash</span>
                  <input
                    type="number"
                    min={0}
                    value={cashTendered || ""}
                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-transparent py-1.5 text-xs outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* totals */}
          <div className="mb-3 flex flex-col gap-1 text-sm">
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
            <div className="flex justify-between border-t border-gray-200 pt-1 text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
            {paymentMethod === "cash" && cashTendered > 0 && (
              <div className="flex justify-between font-semibold text-amber-700">
                <span>Change</span>
                <span>₹{totals.changeDue.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* actions */}
          <div className="flex gap-2">
            <button
              onClick={holdSale}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <PauseCircle size={16} />
              Hold
            </button>
            <button
              onClick={checkout}
              disabled={submitting || cart.length === 0}
              className="flex-1 rounded-lg bg-[#408dfb] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Processing..." : `Pay ₹${totals.total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <button onClick={resetSale} className="ml-auto flex text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
            <div className="mb-2 text-lg font-semibold text-slate-800">Sale Complete ✓</div>
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
