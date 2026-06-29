"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import UserSelector from "@/components/UserSelector";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";
import {
  ArrowLeft, Plus, Trash2, FileText, User, Package, ChevronRight, Save, Loader2, Receipt,
} from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

interface ProductOption {
  id: string;
  name: string;
  productInfo?: { title: string; hsn_code?: string; tax_rate?: number };
  simplePricing?: { basePrice: number; discountedPrice?: number; minPrice?: number };
  images?: { url: string }[];
  hsn?: string;
}

interface InvoiceItem {
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  product: string;
  productImage: string;
  brand: string;
  brandName: string;
  productType: "software";
  hsn?: string;
  hsn_code?: string;
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const { themeColors, componentColors } = useAppSelector((state) => state.settings);
  const btnColor = (() => {
    const key = componentColors?.buttonContained || "primary";
    return (themeColors as any)[key] || themeColors.primary || "#7B3FF2";
  })();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isCustom, setIsCustom] = useState(false);

  const [formData, setFormData] = useState({
    customerId: "",
    customer: {
      name: "",
      email: "",
      phone: "",
      company: "",
      billingAddress: { street: "", city: "", state: "", country: "India", pincode: "" },
      shippingAddress: { street: "", city: "", state: "", country: "India", pincode: "" },
    },
    items: [] as InvoiceItem[],
    dueDate: "",
    notes: "",
  });

  const [newItem, setNewItem] = useState({ productName: "", quantity: 1, price: 0, discount: 0, tax: 0, hsn: "" });
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [productSearchOpen, setProductSearchOpen] = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/admin/invoices/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const invoice = response.data.data;
      setFormData({
        customerId: invoice.customer?.id || "",
        customer: {
          name: invoice.customer.name,
          email: invoice.customer.email,
          phone: typeof invoice.customer.phone === "object"
            ? invoice.customer.phone?.number || ""
            : invoice.customer.phone || "",
          company: invoice.customer.company || "",
          billingAddress: invoice.customer.billingAddress || invoice.customer.address || { street: "", city: "", state: "", country: "India", pincode: "" },
          shippingAddress: invoice.customer.shippingAddress || invoice.customer.address || { street: "", city: "", state: "", country: "India", pincode: "" },
        },
        items: (invoice.items || []).map((item: any) => ({
          ...item,
          price: Number(item.price) || 0,
          discount: Number(item.discount) || 0,
          tax: Number(item.tax) || 0,
          subtotal: Number(item.subtotal) || 0,
          total: Number(item.total) || 0,
          quantity: Number(item.quantity) || 1,
        })),
        dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
        notes: invoice.notes || "",
      });
    } catch {
      toast.error("Failed to fetch invoice details");
    } finally {
      setInitialLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

  const calculateItemTotal = (item: typeof newItem) =>
    item.price * item.quantity - (item.discount || 0) + (item.tax || 0);

  const calculatePricing = () => {
    const subtotal = formData.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = formData.items.reduce((s, i) => s + (i.discount || 0), 0);
    const tax = formData.items.reduce((s, i) => s + (i.tax || 0), 0);
    return { subtotal, discount, tax, total: subtotal - discount + tax, currency: "INR" };
  };

  const searchProducts = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) { setProductOptions([]); return; }
    try {
      setProductLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/admin/products-manage?search=${encodeURIComponent(searchTerm)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProductOptions(res.data.products || res.data.data || []);
    } catch { setProductOptions([]); } finally { setProductLoading(false); }
  };

  const handleProductSelect = (product: ProductOption | null) => {
    if (!product) { setSelectedProduct(null); return; }
    setSelectedProduct(product);
    const base = product.simplePricing?.discountedPrice || product.simplePricing?.basePrice || product.simplePricing?.minPrice || 0;
    const taxPercent = product.productInfo?.tax_rate !== undefined ? product.productInfo.tax_rate : 18;
    const taxAmount = base * (taxPercent / 100);
    setNewItem({ ...newItem, productName: product.productInfo?.title || product.name, price: base, tax: taxAmount, hsn: product.productInfo?.hsn_code || product.hsn || "" });
  };

  const addItem = () => {
    if (!newItem.productName || newItem.price <= 0) { toast.error("Enter product name and price"); return; }
    if (!isCustom && !selectedProduct) { toast.error("Select a valid product from the list"); return; }
    const item: InvoiceItem = {
      ...newItem,
      productType: "software",
      subtotal: newItem.price * newItem.quantity,
      total: calculateItemTotal(newItem),
      product: isCustom ? "custom" : (selectedProduct?.id || ""),
      productImage: isCustom ? "" : (selectedProduct?.images?.[0]?.url || ""),
      brand: "custom",
      brandName: "Default Brand",
      hsn_code: newItem.hsn,
    };
    setFormData({ ...formData, items: [...formData.items, item] });
    setNewItem({ productName: "", quantity: 1, price: 0, discount: 0, tax: 0, hsn: "" });
    setSelectedProduct(null);
  };

  const removeItem = (index: number) => {
    const items = [...formData.items];
    items.splice(index, 1);
    setFormData({ ...formData, items });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!formData.customer.name || !formData.customer.email) { toast.error("Enter customer name and email"); return; }
      if (formData.items.length === 0) { toast.error("Add at least one item"); return; }
      const pricing = calculatePricing();
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/admin/invoices/${params.id}`, {
        customer: formData.customer,
        customerId: formData.customerId,
        items: formData.items,
        pricing,
        dueDate: formData.dueDate,
        notes: formData.notes,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Invoice updated successfully!");
      router.push(`/invoices/${params.id}`);
    } catch { toast.error("Failed to update invoice"); } finally { setLoading(false); }
  };

  const pricing = calculatePricing();

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Invoice</h1>
          <p className="text-sm text-slate-500 mt-1">Update invoice details and line items</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(`/invoices/${params.id}`)} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-60 flex items-center gap-1.5 transition-all" style={{ background: btnColor }}>
            <Save size={14} />{loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Customer */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><User size={16} className="text-blue-600" /></div>
              <h2 className="text-sm font-semibold text-slate-700">Bill To</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="max-w-xl">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Change Customer <span className="text-slate-400">(Optional)</span>
                </label>
                <UserSelector
                  value={null}
                  onChange={(user) => {
                    if (user) {
                      let billingAddress = { street: "", city: "", state: "", country: "India", pincode: "" };
                      let shippingAddress = { street: "", city: "", state: "", country: "India", pincode: "" };

                      if (user.addresses?.length > 0) {
                        const bAddr = user.addresses.find((a: any) => a.type === "billing" || a.type === "both") || user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
                        const sAddr = user.addresses.find((a: any) => a.type === "shipping" || a.type === "both") || user.addresses.find((a: any) => a.isDefault) || user.addresses[0];

                        billingAddress = {
                          street: bAddr.street || bAddr.addressLine1 || "",
                          city: bAddr.city || "",
                          state: bAddr.state || "",
                          country: bAddr.country || "India",
                          pincode: bAddr.pincode || bAddr.pinCode || bAddr.postalCode || ""
                        };
                        shippingAddress = {
                          street: sAddr.street || sAddr.addressLine1 || "",
                          city: sAddr.city || "",
                          state: sAddr.state || "",
                          country: sAddr.country || "India",
                          pincode: sAddr.pincode || sAddr.pinCode || sAddr.postalCode || ""
                        };
                      } else if (user.address || user.shippingAddress || user.billingAddress) {
                        const b = user.billingAddress || user.address || {};
                        const s = user.shippingAddress || user.address || {};
                        billingAddress = {
                          street: b.street || b.addressLine1 || "",
                          city: b.city || "",
                          state: b.state || "",
                          country: b.country || "India",
                          pincode: b.pincode || b.pinCode || b.postalCode || ""
                        };
                        shippingAddress = {
                          street: s.street || s.addressLine1 || "",
                          city: s.city || "",
                          state: s.state || "",
                          country: s.country || "India",
                          pincode: s.pincode || s.pinCode || s.postalCode || ""
                        };
                      }

                      setFormData({
                        ...formData,
                        customerId: user._id || user.id,
                        customer: {
                          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "",
                          email: user.email,
                          phone: user.phone?.number || user.phone || "",
                          company: user.companyName || "",
                          billingAddress,
                          shippingAddress
                        }
                      });
                    }
                  }}
                  label=""
                  size="small"
                  showCreateButton={true}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      height: "36px",
                      fontSize: "13px",
                      backgroundColor: "#ffffff !important",
                    }
                  }}
                />
              </div>
              {formData.customer.name && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/80 space-y-4">
                  {/* Customer General Info */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Selected Customer</p>
                      <p className="text-sm font-bold text-slate-800">{formData.customer.name}</p>
                    </div>
                    {formData.customer.email && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Email</p>
                        <p className="text-xs font-medium text-slate-700">{formData.customer.email}</p>
                      </div>
                    )}
                    {formData.customer.phone && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Phone</p>
                        <p className="text-xs font-medium text-slate-700">{formData.customer.phone}</p>
                      </div>
                    )}
                    {formData.customer.company && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Company</p>
                        <p className="text-xs font-medium text-slate-700">{formData.customer.company}</p>
                      </div>
                    )}
                  </div>

                  {/* Addresses Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-blue-100/50">
                    {/* Left: Billing Address */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Billing Address</p>
                      {formData.customer.billingAddress.street ? (
                        <div className="text-xs text-slate-600 space-y-0.5">
                          <p className="font-semibold text-slate-700">{formData.customer.name}</p>
                          <p>{formData.customer.billingAddress.street}</p>
                          <p>
                            {formData.customer.billingAddress.city}
                            {formData.customer.billingAddress.state && `, ${formData.customer.billingAddress.state}`}
                            {formData.customer.billingAddress.pincode && ` - ${formData.customer.billingAddress.pincode}`}
                          </p>
                          <p className="text-[10px] text-slate-500">{formData.customer.billingAddress.country}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No billing address provided</p>
                      )}
                    </div>

                    {/* Right: Shipping Address */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Shipping Address</p>
                      {formData.customer.shippingAddress.street ? (
                        <div className="text-xs text-slate-600 space-y-0.5">
                          <p className="font-semibold text-slate-700">{formData.customer.name}</p>
                          <p>{formData.customer.shippingAddress.street}</p>
                          <p>
                            {formData.customer.shippingAddress.city}
                            {formData.customer.shippingAddress.state && `, ${formData.customer.shippingAddress.state}`}
                            {formData.customer.shippingAddress.pincode && ` - ${formData.customer.shippingAddress.pincode}`}
                          </p>
                          <p className="text-[10px] text-slate-500">{formData.customer.shippingAddress.country}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No shipping address provided</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><Receipt size={16} className="text-purple-600" /></div>
              <h2 className="text-sm font-semibold text-slate-700">Invoice Details</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Due Date
                </label>
                <TextField fullWidth size="small" type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Notes / Terms
                </label>
                <TextField fullWidth size="small" multiline rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Payment terms, bank details, or additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><Package size={16} className="text-green-600" /></div>
                <h2 className="text-sm font-semibold text-slate-700">Invoice Items</h2>
              </div>
              <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
                <button
                  onClick={() => { setIsCustom(false); setSelectedProduct(null); setNewItem({ productName: "", quantity: 1, price: 0, discount: 0, tax: 0, hsn: "" }); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${!isCustom ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                >From Catalog</button>
                <button
                  onClick={() => { setIsCustom(true); setSelectedProduct(null); setNewItem({ productName: "", quantity: 1, price: 0, discount: 0, tax: 0, hsn: "" }); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${isCustom ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                >Custom Item</button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 md:col-span-8 2xl:col-span-4">
                  {!isCustom ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Search Product
                      </label>
                      <Autocomplete
                        fullWidth options={productOptions}
                        open={productSearchOpen}
                        onOpen={() => setProductSearchOpen(true)}
                        onClose={() => setProductSearchOpen(false)}
                        filterOptions={(x) => x}
                        getOptionLabel={(o) => typeof o === "string" ? o : (o.productInfo?.title || o.name || "")}
                        loading={productLoading}
                        value={selectedProduct}
                        onChange={(_, v) => { if (typeof v !== "string") handleProductSelect(v); }}
                        onInputChange={(_, v) => searchProducts(v)}
                        renderInput={(params) => (
                          <TextField {...params} size="small"
                            InputProps={{ ...params.InputProps, endAdornment: (<>{productLoading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>) }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            <div className="flex items-center gap-2 py-1">
                              <div className="w-9 h-9 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 relative">
                                {option.images?.[0]?.url
                                  ? <Image src={option.images[0].url} alt={option.productInfo?.title || option.name} fill style={{ objectFit: "cover" }} />
                                  : <span className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">No img</span>}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">{option.productInfo?.title || option.name}</p>
                                <p className="text-xs text-slate-500">₹{option.simplePricing?.discountedPrice || option.simplePricing?.basePrice || option.simplePricing?.minPrice || 0}</p>
                              </div>
                            </div>
                          </li>
                        )}
                        freeSolo clearOnBlur={false}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Product / Service name
                      </label>
                      <TextField fullWidth size="small" placeholder="e.g. Web Design Service"
                        value={newItem.productName}
                        onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <div className="col-span-6 md:col-span-4 2xl:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    HSN/SAC
                  </label>
                  <TextField fullWidth size="small" value={newItem.hsn} onChange={(e) => setNewItem({ ...newItem, hsn: e.target.value })} />
                </div>
                <div className="col-span-6 md:col-span-2 2xl:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Qty
                  </label>
                  <TextField fullWidth size="small" type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="col-span-6 md:col-span-3 2xl:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Rate (₹)
                  </label>
                  <TextField fullWidth size="small" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-6 md:col-span-3 2xl:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Disc (₹)
                  </label>
                  <TextField fullWidth size="small" type="number" value={newItem.discount} onChange={(e) => setNewItem({ ...newItem, discount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-6 md:col-span-2 2xl:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Tax (₹)
                  </label>
                  <TextField fullWidth size="small" type="number" value={newItem.tax} onChange={(e) => setNewItem({ ...newItem, tax: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-6 md:col-span-2 2xl:col-span-1">
                  <button onClick={addItem} className="w-full h-9 flex items-center justify-center gap-1 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-all" style={{ background: btnColor }}>
                    <Plus size={15} />Add
                  </button>
                </div>
              </div>

              {formData.items.length > 0 && (
                <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {["Item/Service", "HSN", "Qty", "Rate", "Disc", "Tax", "Amount", ""].map((h, i) => (
                          <th key={i} className={`px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 0 ? "text-left pl-4" : i === 7 ? "" : "text-right"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">{item.productName}</td>
                          <td className="px-3 py-3 text-slate-500 text-xs">{item.hsn || "—"}</td>
                          <td className="px-3 py-3 text-right text-slate-700">{item.quantity}</td>
                          <td className="px-3 py-3 text-right text-slate-700">₹{Number(item.price || 0).toFixed(2)}</td>
                          <td className="px-3 py-3 text-right text-red-500">₹{Number(item.discount || 0).toFixed(2)}</td>
                          <td className="px-3 py-3 text-right text-slate-600">₹{Number(item.tax || 0).toFixed(2)}</td>
                          <td className="px-3 py-3 text-right font-semibold text-slate-800">₹{Number(item.total || 0).toFixed(2)}</td>
                          <td className="px-3 py-3 text-center">
                            <button onClick={() => removeItem(index)} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {formData.items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <FileText size={36} className="mb-3 opacity-30" />
                  <p className="text-sm">No items added yet</p>
                  <p className="text-xs mt-1">Add products from catalog or enter custom services above</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Summary */}
        <div className="space-y-6 lg:sticky lg:top-6 h-fit">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-700">Invoice Summary</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span className="font-medium text-slate-800">₹{pricing.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-slate-600"><span>Discount</span><span className="font-medium text-red-500">-₹{pricing.discount.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-slate-600"><span>Tax (GST)</span><span className="font-medium text-slate-800">₹{pricing.tax.toFixed(2)}</span></div>
              <div className="border-t border-dashed border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-slate-800">Total Due</span>
                  <span className="text-base font-bold" style={{ color: btnColor }}>₹{pricing.total.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">{formData.items.length} item{formData.items.length !== 1 ? "s" : ""} · Due {formData.dueDate}</p>
            </div>
            <div className="px-5 pb-5 space-y-2">
              <button onClick={handleSubmit} disabled={loading} className="w-full py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 transition-all" style={{ background: btnColor }}>
                <Save size={14} />{loading ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => router.push(`/invoices/${params.id}`)} className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-all">
                Cancel
              </button>
            </div>
          </div>

          {/* Invoice meta */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice Info</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Due Date</span>
                <span className="font-medium text-slate-700">
                  {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">Editing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
