"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Upload, X, Check, ArrowRight } from "lucide-react";

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderItemId?: string; 
  productName?: string;
  productId?: string;
  currentVariantId?: string;
  initialType?: "RETURN" | "REPLACEMENT";
  onSuccess: () => void;
}

const REASONS = [
  "Size too small",
  "Size too large",
  "Damaged product",
  "Quality not as expected",
  "Wrong item received",
  "Defective product",
  "Others",
];

export function ReturnRequestModal({
  isOpen,
  onClose,
  orderId,
  orderItemId,
  productName,
  productId,
  currentVariantId,
  initialType,
  onSuccess,
}: ReturnRequestModalProps) {
  const { token } = useAuth();
  const [type, setType] = useState<"RETURN" | "REPLACEMENT">(initialType || "RETURN");
  
  useEffect(() => {
    if (isOpen && initialType) {
      setType(initialType);
    }
  }, [isOpen, initialType]);

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [product, setProduct] = useState<any>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    // Reset product data when selected item changes
    if (productId) {
      setProduct(null);
      setSelectedVariant(null);
    }
  }, [productId]);

  useEffect(() => {
    if (isOpen && type === "REPLACEMENT" && productId && !product) {
      fetchProductData();
    }
  }, [isOpen, type, productId, product]);

  const fetchProductData = async () => {
    try {
      setIsLoadingProduct(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // 1. Initial fetch by productId
      const response = await fetch(`${apiUrl}/products/${productId}`, { headers });
      if (!response.ok) throw new Error("Failed to fetch product details");
      const data = await response.json();
      
      if (data.success) {
        let productData = data.data;
        
        // 2. Resolve Parent if it's a variant
        if (productData.parentId) {
          const parentResponse = await fetch(`${apiUrl}/products/${productData.parentId}`, { headers });
          if (parentResponse.ok) {
            const parentData = await parentResponse.json();
            if (parentData.success) {
              productData = parentData.data;
            }
          }
        }

        // 3. Fallback: If still no variants, try searching by name (Discovery Phase)
        if ((!productData.variants || productData.variants.length === 0) && productName) {
          console.log("No variants found by ID, attempting discovery by name:", productName);
          const searchResponse = await fetch(`${apiUrl}/products?search=${encodeURIComponent(productName)}&limit=1`, { headers });
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.success && searchData.data?.[0]) {
              const matchedProduct = searchData.data[0];
              // Ensure we only use it if it actually has variants
              if (matchedProduct.variants?.length > 0) {
                productData = matchedProduct;
              }
            }
          }
        }

        setProduct(productData);
        
        // Auto-adjust type if one is disabled
        if (productData.is_returnable === false && type === "RETURN") {
          setType("REPLACEMENT");
        } else if (productData.is_replaceable === false && type === "REPLACEMENT") {
          setType("RETURN");
        }

        if (productData.variants?.length > 0) {
          const current = productData.variants.find((v: any) => v.id === currentVariantId || v._id === currentVariantId);
          setSelectedVariant(current || productData.variants[0]);
        }
      }
    } catch (err) {
      console.error("Fetch product error:", err);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "returns");

      const response = await fetch(`${apiUrl}/admin/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setImages((prev) => [...prev, data.url]);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    try {
      setIsSubmitting(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const endpoint = orderItemId ? "return-requests" : "return-requests/bulk";
      
      const payload: any = {
        orderId,
        type,
        reason,
        customerNotes: notes,
        images,
      };

      if (orderItemId) {
        payload.orderItemId = orderItemId;
      }

      if (type === "REPLACEMENT" && selectedVariant) {
        payload.replacementVariantId = selectedVariant.id || selectedVariant._id;
        payload.replacementVariantInfo = {
          name: selectedVariant.name,
          sku: selectedVariant.sku,
          price: selectedVariant.price,
        };
      }

      const response = await fetch(`${apiUrl}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit request");
      }

      toast.success("Request submitted successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {orderItemId ? "Return/Replace Item" : "Return/Replace Entire Order"}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            {orderItemId ? productName : "All eligible items in this order will be processed."}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>What would you like to do?</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {(product?.is_returnable !== false) && (
                  <SelectItem value="RETURN">Return (Refund to original payment)</SelectItem>
                )}
                {(product?.is_replaceable !== false) && (
                  <SelectItem value="REPLACEMENT">Replacement (Get a new item)</SelectItem>
                )}
                {(product?.is_returnable === false && product?.is_replaceable === false) && (
                  <SelectItem value="NONE" disabled>Policy restricted</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {type === "REPLACEMENT" && (
            <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <Label className="text-blue-700 font-bold">Select Replacement Variant</Label>
                {selectedVariant && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {selectedVariant.stock > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                )}
              </div>
              
              {isLoadingProduct ? (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching options...
                </div>
              ) : product?.variants?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id || v._id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-2 text-xs rounded-md border transition-all text-left relative overflow-hidden ${
                        selectedVariant?._id === v._id
                          ? "bg-blue-600 text-white border-blue-600 font-bold shadow-md ring-2 ring-blue-200"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {v.name}
                      <span className="block opacity-70 font-normal mt-0.5">
                        ₹{v.price} {v.stock > 0 ? "" : "(Out of Stock)"}
                      </span>
                      {selectedVariant?._id === v._id && (
                        <div className="absolute top-0 right-0 w-6 h-6 bg-white/20 flex items-center justify-center rounded-bl-lg">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No other variants available.</p>
              )}

              {/* Replacement Preview */}
              {selectedVariant && (
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <Label className="text-[10px] uppercase tracking-wider text-blue-500 font-bold mb-2 block">Replacement Preview</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-2 bg-white rounded border border-gray-100">
                      <div className="text-[9px] text-gray-400 uppercase font-bold">Current</div>
                      <div className="text-xs font-medium truncate">{productName}</div>
                      <div className="text-[10px] text-gray-500">
                        {product?.variants?.find((v: any) => v.id === currentVariantId || v._id === currentVariantId)?.name || "Original Variant"}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <ArrowRight className="h-3 w-3 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 p-2 bg-blue-600 text-white rounded shadow-sm">
                      <div className="text-[9px] text-blue-200 uppercase font-bold">New</div>
                      <div className="text-xs font-bold truncate">{productName}</div>
                      <div className="text-[10px] text-blue-100 truncate">{selectedVariant.name}</div>
                    </div>
                  </div>
                  {selectedVariant.id !== currentVariantId && (
                    <p className="text-[10px] text-blue-600 mt-2 font-medium">
                      ✨ You are switching to a different variant.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Tell us more about the issue..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Upload Proof Images</Label>
            <div className="flex flex-wrap gap-3">
              {images.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} className="w-16 h-16 object-cover rounded-md border" alt="" />
                  <button
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                  {isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isUploading}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
