"use client";
import React, { useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";
import UserSelector from "@/components/UserSelector";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ShoppingCart,
  User,
  FileText,
  Package,
  ChevronRight,
} from "lucide-react";
import { TextField } from "@mui/material";
import { toast } from "sonner";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

interface ProductOption {
  _id: string;
  name: string;
  productInfo?: { title: string; hsn_code?: string; tax_rate?: number };
  simplePricing?: { basePrice: number; discountedPrice?: number; minPrice?: number };
  images?: { url: string }[];
  hsn?: string;
}

interface OrderItem {
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
}

export default function CreateOrderPage() {
  const router = useRouter();
  const { themeColors, componentColors } = useAppSelector((state) => state.settings);
  const btnColor = (() => {
    const key = componentColors?.buttonContained || "primary";
    return (themeColors as any)[key] || themeColors.primary || "#7B3FF2";
  })();
  const [loading, setLoading] = useState(false);
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
    items: [] as OrderItem[],
    orderType: "manual_invoice",
    status: "pending",
    notes: "",
  });

  const [newItem, setNewItem] = useState({
    productName: "",
    quantity: 1,
    price: 0,
    discount: 0,
    tax: 0,
    hsn: "",
  });

  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [productSearchOpen, setProductSearchOpen] = useState(false);

  const calculateItemTotal = (item: typeof newItem) => {
    return item.price * item.quantity - (item.discount || 0) + (item.tax || 0);
  };

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
      let apiUrl = `${API_URL}/admin/products-manage?search=${encodeURIComponent(searchTerm)}`;
      const response = await axios.get(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
      setProductOptions(response.data.products || response.data.data || []);
    } catch { setProductOptions([]); } finally { setProductLoading(false); }
  };

  const handleProductSelect = (product: ProductOption | null) => {
    if (!product) { setSelectedProduct(null); return; }
    setSelectedProduct(product);
    const basePrice = product.simplePricing?.discountedPrice || product.simplePricing?.basePrice || product.simplePricing?.minPrice || 0;
    const taxPercent = product.productInfo?.tax_rate !== undefined ? product.productInfo.tax_rate : 18;
    const taxAmount = basePrice * (taxPercent / 100);
    setNewItem({ ...newItem, productName: product.productInfo?.title || product.name, price: basePrice, tax: taxAmount, hsn: product.productInfo?.hsn_code || product?.hsn || "" });
  };

  const addItem = () => {
    const prodName = isCustom ? newItem.productName : (selectedProduct?.productInfo?.title || selectedProduct?.name || newItem.productName);
    
    if (!prodName) {
      toast.error("Enter product name");
      return;
    }
    if (newItem.price < 0) {
      toast.error("Price cannot be negative");
      return;
    }
    
    const isActuallyCustom = isCustom || !selectedProduct;
    


    const item: OrderItem = {
      ...newItem,
      productName: prodName,
      productType: "software",
      subtotal: newItem.price * newItem.quantity,
      total: calculateItemTotal(newItem),
      product: isActuallyCustom ? "custom" : (selectedProduct?._id || ""),
      productImage: isActuallyCustom ? "" : (selectedProduct?.images?.[0]?.url || ""),
      brand: "custom",
      brandName: "Default Brand",
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
      const orderData = {
        customer: formData.customerId || null,
        billingAddress: {
          fullName: formData.customer.name, email: formData.customer.email, phone: formData.customer.phone,
          street: formData.customer.billingAddress?.street || "", city: formData.customer.billingAddress?.city || "",
          state: formData.customer.billingAddress?.state || "", country: formData.customer.billingAddress?.country || "India", pincode: formData.customer.billingAddress?.pincode || "",
        },
        shippingAddress: {
          fullName: formData.customer.name, email: formData.customer.email, phone: formData.customer.phone,
          street: formData.customer.shippingAddress?.street || "", city: formData.customer.shippingAddress?.city || "",
          state: formData.customer.shippingAddress?.state || "", country: formData.customer.shippingAddress?.country || "India", pincode: formData.customer.shippingAddress?.pincode || "",
        },
        items: formData.items, pricing, orderType: formData.orderType, status: formData.status, notes: formData.notes,
      };
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/admin/orders`, orderData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Order created successfully!");
      router.push("/orders");
    } catch { toast.error("Failed to create order"); } finally { setLoading(false); }
  };

  const pricing = calculatePricing();

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create New Order</h1>
          <p className="text-sm text-slate-500 mt-1">Fill in the details below to create a manual order</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/orders")}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-slate-50 transition-all"
            style={{ borderColor: btnColor, color: btnColor }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: btnColor }}
          >
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Main Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Customer Information</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="max-w-xl">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Search Customer <span className="text-red-500">*</span>
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

          {/* Order Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <FileText size={16} className="text-purple-600" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Order Details</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Order Type
                </label>
                <TextField
                  select fullWidth size="small"
                  value={formData.orderType}
                  onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                >
                  <MenuItem value="manual_invoice">Manual Invoice</MenuItem>
                  <MenuItem value="direct_purchase">Direct Purchase</MenuItem>
                  <MenuItem value="quote_request">Quote Request</MenuItem>
                </TextField>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Status
                </label>
                <TextField
                  select fullWidth size="small"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {["pending","confirmed","processing","ready_to_ship","shipped","out_for_delivery","delivered","cancelled","returned","refunded","failed"].map(s => (
                    <MenuItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>
                  ))}
                </TextField>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Notes (optional)
                </label>
                <TextField
                  fullWidth size="small" multiline rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes about this order..."
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Package size={16} className="text-green-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-700">Order Items</h2>
              </div>
              {/* Toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
                <button
                  onClick={() => { setIsCustom(false); setSelectedProduct(null); setNewItem({ productName: "", quantity: 1, price: 0, discount: 0, tax: 0, hsn: "" }); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${!isCustom ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                >
                  From Catalog
                </button>
                <button
                  onClick={() => { setIsCustom(true); setSelectedProduct(null); setNewItem({ productName: "", quantity: 1, price: 0, discount: 0, tax: 0, hsn: "" }); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${isCustom ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Custom Item
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Item entry row */}
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
                        onChange={(_, v) => {
                          if (v && typeof v !== "string") {
                            handleProductSelect(v);
                          } else {
                            const strVal = typeof v === "string" ? v : "";
                            setNewItem(prev => ({ ...prev, productName: strVal }));
                          }
                        }}
                        onInputChange={(_, v) => {
                          searchProducts(v);
                          setNewItem(prev => ({ ...prev, productName: v }));
                        }}
                        renderInput={(params) => (
                          <TextField {...params} size="small"
                            InputProps={{ ...params.InputProps, endAdornment: (<>{productLoading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>) }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option._id}>
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
                        Product Name
                      </label>
                      <TextField fullWidth size="small" placeholder="Enter product name..."
                        value={newItem.productName}
                        onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <div className="col-span-6 md:col-span-4 2xl:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    HSN
                  </label>
                  <TextField fullWidth size="small" value={newItem.hsn}
                    onChange={(e) => setNewItem({ ...newItem, hsn: e.target.value })} />
                </div>
                <div className="col-span-6 md:col-span-2 2xl:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Qty
                  </label>
                  <TextField fullWidth size="small" type="number" value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="col-span-6 md:col-span-3 2xl:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Price (₹)
                  </label>
                  <TextField fullWidth size="small" type="number" value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-6 md:col-span-3 2xl:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Disc (₹)
                  </label>
                  <TextField fullWidth size="small" type="number" value={newItem.discount}
                    onChange={(e) => setNewItem({ ...newItem, discount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-6 md:col-span-2 2xl:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Tax (₹)
                  </label>
                  <TextField fullWidth size="small" type="number" value={newItem.tax}
                    onChange={(e) => setNewItem({ ...newItem, tax: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-6 md:col-span-2 2xl:col-span-1">
                  <button
                    onClick={addItem}
                    className="w-full h-10 flex items-center justify-center gap-1 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
                    style={{ background: btnColor }}
                  >
                    <Plus size={15} />
                    Add
                  </button>
                </div>
              </div>

              {/* Items table */}
              {formData.items.length > 0 && (
                <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item</th>
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">HSN</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Disc</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tax</th>
                        <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                        <th className="px-3 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">{item.productName}</td>
                          <td className="px-3 py-3 text-slate-500 text-xs">{item.hsn || "—"}</td>
                          <td className="px-3 py-3 text-right text-slate-700">{item.quantity}</td>
                          <td className="px-3 py-3 text-right text-slate-700">₹{item.price.toFixed(2)}</td>
                          <td className="px-3 py-3 text-right text-red-500">₹{item.discount.toFixed(2)}</td>
                          <td className="px-3 py-3 text-right text-slate-600">₹{item.tax.toFixed(2)}</td>
                          <td className="px-3 py-3 text-right font-semibold text-slate-800">₹{item.total.toFixed(2)}</td>
                          <td className="px-3 py-3 text-center">
                            <button onClick={() => removeItem(index)} className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {formData.items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <ShoppingCart size={36} className="mb-3 opacity-30" />
                  <p className="text-sm">No items added yet</p>
                  <p className="text-xs mt-1">Search for a product or add a custom item above</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Summary */}
        <div className="space-y-6 lg:sticky lg:top-6 h-fit">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-700">Order Summary</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-800">₹{pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Discount</span>
                <span className="font-medium text-red-500">-₹{pricing.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span className="font-medium text-slate-800">₹{pricing.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-slate-800">Total</span>
                  <span className="text-base font-bold" style={{ color: btnColor }}>
                    ₹{pricing.total.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                <span>{formData.items.length} item{formData.items.length !== 1 ? "s" : ""} added</span>
              </div>
            </div>
            <div className="px-5 pb-5 space-y-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: btnColor }}
              >
                {loading ? "Creating..." : "Create Order"}
              </button>
              <button
                onClick={() => router.push("/orders")}
                className="w-full py-2.5 text-sm font-medium border rounded-lg hover:bg-slate-50 transition-all"
                style={{ borderColor: btnColor, color: btnColor }}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Order Config Summary */}
          {(formData.orderType || formData.status) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Configuration</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Type</span>
                  <span className="font-medium text-slate-700 capitalize">{formData.orderType.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    formData.status === "confirmed" ? "bg-green-50 text-green-700" :
                    formData.status === "cancelled" ? "bg-red-50 text-red-700" :
                    "bg-amber-50 text-amber-700"
                  }`}>{formData.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
