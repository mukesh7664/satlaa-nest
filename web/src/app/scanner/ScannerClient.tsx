"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import {
  Camera,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  ExternalLink,
  Info,
  RefreshCw,
  Tag,
  Hash,
  Layers,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { PriceDisplay } from "@/components/common/PriceDisplay";

// Define TypeScript interfaces for our product data structures
interface ProductData {
  _id: string;
  slug: string;
  isActive?: boolean;
  sku?: string;
  tax_rate?: number;
  is_returnable?: boolean;
  is_replaceable?: boolean;
  return_window_days?: number;
  productPricingType?: "simple" | "variable";
  simplePricing?: {
    basePrice: number;
    discountedPrice?: number;
    stockQuantity?: number;
    currency?: string;
    inStock?: boolean;
  };
  productInfo: {
    title: string;
    sku?: string;
    description?: string;
    brand?: string;
  };
  brand?: {
    _id: string;
    name: string;
    slug?: string;
  };
  category?: string | {
    id: string;
    name: string;
  };
  attributes?: Record<string, any>;
  purchaseType?: "online" | "quote" | "both";
  manualCurrencyPrices?: Record<string, number>;
  images?: Array<{
    url: string;
    alt?: string;
    position?: number;
    type?: "image" | "video";
  }>;
  icon?: {
    url: string;
    alt?: string;
    type?: "image" | "video";
  };
  variants?: Array<{
    _id: string;
    name: string;
    price: number;
    stock?: number;
    description?: string;
    sku?: string;
    attributes?: Record<string, string>;
    manualCurrencyPrices?: Record<string, number>;
  }>;
}

export default function ScannerClient() {
  const { addToCart, openCart } = useCart();

  // Helper to resolve media URLs
  const getFullMediaUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    if (cleanUrl.startsWith("uploads/")) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const baseUrl = apiUrl.replace("/api/v1", "");
      return `${baseUrl}/${cleanUrl}`;
    }
    return url;
  };

  // Navigation / Tab state
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");

  // Camera scanner states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);

  // Decoded states
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Adding to cart state
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // File uploader state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Scan loop reference
  const animationFrameIdMap = useRef<number | null>(null);
  const isScanningRef = useRef(false);

  // Enumerate video input devices when tab is camera
  useEffect(() => {
    if (activeTab === "camera") {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        setScanError("Camera scanner requires a secure HTTPS connection (or localhost). Please check your connection or try uploading a QR image instead.");
        return;
      }
      navigator.mediaDevices.enumerateDevices()
        .then(deviceList => {
          const videoDevices = deviceList.filter(device => device.kind === "videoinput");
          setDevices(videoDevices);
          if (videoDevices.length > 0 && !selectedDeviceId) {
            // Prefer back camera if available
            const backCam = videoDevices.find(d => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("environment"));
            setSelectedDeviceId(backCam ? backCam.deviceId : videoDevices[0].deviceId);
          }
        })
        .catch(err => {
          console.error("Error enumerating devices:", err);
        });
    }
  }, [activeTab]);

  // Handle camera start/stop on selectedDeviceId or tab changes
  useEffect(() => {
    if (activeTab === "camera" && selectedDeviceId) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, selectedDeviceId]);

  // Camera start function
  const startCamera = async () => {
    stopCamera();
    setScanError(null);
    setIsScanning(true);
    isScanningRef.current = true;

    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setScanError("Camera scanner requires a secure HTTPS connection (or localhost). Please check your connection or try uploading a QR image instead.");
      setIsScanning(false);
      isScanningRef.current = false;
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: selectedDeviceId ? undefined : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setHasPermission(true);

      // Re-enumerate devices now that permission is granted, so we can read labels
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(device => device.kind === "videoinput");
        setDevices(videoDevices);

        // Find what device was actually opened to detect if it's the front camera
        const activeTrack = stream.getVideoTracks()[0];
        if (activeTrack) {
          const settings = activeTrack.getSettings();
          const activeId = settings.deviceId || "";
          
          if (activeId && !selectedDeviceId) {
            setSelectedDeviceId(activeId);
          }

          // Determine if it is a front / user camera
          const label = (activeTrack.label || "").toLowerCase();
          const isFront = label.includes("front") || label.includes("user") || label.includes("selfie") || settings.facingMode === "user";
          setIsFrontCamera(isFront);
        }
      } catch (enumErr) {
        console.error("Error updating devices list:", enumErr);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for metadata to load before playing
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            // Start scan loop once video plays
            animationFrameIdMap.current = requestAnimationFrame(scanTick);
          }).catch(err => {
            console.error("Error playing video:", err);
            setScanError("Failed to start video playback. Try again.");
          });
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setHasPermission(false);
      setIsScanning(false);
      isScanningRef.current = false;
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setScanError("Camera access permission was denied. Please allow camera access in your settings.");
      } else {
        setScanError("Could not access camera. Please verify device connection or try uploading an image.");
      }
    }
  };

  // Camera stop function
  const stopCamera = () => {
    setIsScanning(false);
    isScanningRef.current = false;
    if (animationFrameIdMap.current) {
      cancelAnimationFrame(animationFrameIdMap.current);
      animationFrameIdMap.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Real-time canvas scan tick
  const scanTick = () => {
    if (!videoRef.current || !canvasRef.current || !isScanningRef.current) {
      animationFrameIdMap.current = requestAnimationFrame(scanTick);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to hidden canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      try {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          // Success!
          handleQrDetected(code.data);
          return; // Stop loop
        }
      } catch (e) {
        // Suppress scan frame errors
      }
    }

    // Keep scanning
    animationFrameIdMap.current = requestAnimationFrame(scanTick);
  };

  // Handle QR text extraction and product loading
  const handleQrDetected = (text: string) => {
    toast.success("QR Code detected!");
    setDecodedText(text);
    stopCamera();

    // Extract product slug from the scanned text
    const slug = extractSlug(text);
    if (slug) {
      setProductSlug(slug);
      fetchProductDetails(slug);
    } else {
      setApiError("Invalid product QR format. Scanned: " + text);
    }
  };

  // Extract slug from URL/string
  const extractSlug = (qrText: string): string => {
    try {
      const trimmed = qrText.trim();

      // If it looks like a URL, parse it
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const url = new URL(trimmed);

        // Pattern: /products/[slug]
        const match = url.pathname.match(/\/products\/([^/]+)/);
        if (match && match[1]) {
          return match[1];
        }
      }

      // Otherwise fallback to raw string (could be slug directly)
      return trimmed;
    } catch (e) {
      return qrText.trim();
    }
  };

  // Fetch product from NestJS API
  const fetchProductDetails = async (slug: string) => {
    setApiLoading(true);
    setApiError(null);
    setProductData(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (typeof window !== "undefined") {
        headers["x-tenant-domain"] = window.location.host.split(":")[0];
      }

      const response = await fetch(`${apiUrl}/products/${slug}`, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Product details not found. The scanned code might be invalid or from another store.");
        }
        throw new Error(`Failed to load product details (Status code: ${response.status})`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setProductData(result.data);
        if (result.data.variants && result.data.variants.length > 0) {
          setSelectedVariant(result.data.variants[0]);
        } else {
          setSelectedVariant(null);
        }
      } else {
        throw new Error(result.message || "Failed to parse product data.");
      }
    } catch (err: any) {
      console.error("API error fetching product:", err);
      setApiError(err.message || "Something went wrong while retrieving product info.");
    } finally {
      setApiLoading(false);
    }
  };

  // Handle image upload scanning
  const handleFileUpload = (file: File) => {
    if (!file) return;

    setApiError(null);
    setScanError(null);
    setDecodedText(null);
    setProductData(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new globalThis.Image();
      img.onload = () => {
        // Create canvas to draw the image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setScanError("Failed to initialize canvas decoder.");
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleQrDetected(code.data);
          } else {
            setScanError("Could not detect any QR code in the uploaded image. Please make sure the QR code is clearly visible and centered.");
          }
        } catch (err) {
          console.error("jsQR Error:", err);
          setScanError("An error occurred during QR code decoding.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Drag-and-drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle manual input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Reset scanner state to scan another item
  const handleReset = () => {
    setDecodedText(null);
    setProductSlug(null);
    setProductData(null);
    setSelectedVariant(null);
    setApiError(null);
    setScanError(null);

    if (activeTab === "camera") {
      startCamera();
    }
  };

  // Add to Cart handler
  const handleAddToCart = async (specificVariant?: any) => {
    if (!productData) return;

    setIsAddingToCart(true);
    try {
      let variantId: string | undefined = undefined;
      let itemPrice = 0;

      // If specific variant is provided (e.g. from the variants list buttons)
      const activeVar = specificVariant || selectedVariant;

      if (activeVar) {
        variantId = activeVar._id;
        itemPrice = activeVar.price;
      } else {
        const pricing = productData.simplePricing;
        if (pricing?.discountedPrice) {
          itemPrice = pricing.discountedPrice;
        } else if (pricing?.basePrice) {
          itemPrice = pricing.basePrice;
        }
      }

      if (itemPrice === 0) {
        toast.error("Product price not available for direct purchase.");
        return;
      }

      await addToCart({
        productId: productData._id,
        variantId: variantId,
        price: Number(itemPrice),
        quantity: 1,
        purchaseType: productData.purchaseType || "online",
        notes: "",
      });

      toast.success("Added to Cart successfully!");
      openCart();
    } catch (err) {
      console.error("Error adding scanned item to cart:", err);
      toast.error("Failed to add product to cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Product QR Scanner
          </h1>
          <p className="mt-2 text-base text-slate-500 max-w-xl mx-auto">
            Scan a product QR code or upload a photo to immediately view product price, variants, and specifications without viewing images.
          </p>
        </div>

        {/* Scanner Tabs & Controls */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden mb-8">
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
            <button
              onClick={() => {
                setActiveTab("camera");
                setDecodedText(null);
                setProductData(null);
                setApiError(null);
                setScanError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${activeTab === "camera"
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
            >
              <Camera className="h-4 w-4" />
              Camera Scanner
            </button>
            <button
              onClick={() => {
                setActiveTab("upload");
                setDecodedText(null);
                setProductData(null);
                setApiError(null);
                setScanError(null);
                stopCamera();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${activeTab === "upload"
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
            >
              <UploadCloud className="h-4 w-4" />
              Upload QR Image
            </button>
          </div>

          <div className="p-6">

            {/* Viewport for Camera Scanning */}
            {activeTab === "camera" && !decodedText && (
              <div className="flex flex-col items-center">

                {/* Camera Selector */}
                {devices.length > 1 && (
                  <div className="w-full max-w-xs mb-4">
                    <label htmlFor="camera-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Choose Camera
                    </label>
                    <select
                      id="camera-select"
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium cursor-pointer"
                    >
                      {devices.map((device, idx) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Video Container with Scanning Animation Overlay */}
                <div className="relative w-full max-w-md aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner group">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isFrontCamera ? "scale-x-[-1]" : ""}`}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Glassmorphic Scan Frame */}
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-64 border-2 border-indigo-500/80 rounded-3xl relative shadow-[0_0_0_9999px_rgba(15,23,42,0.6)]">
                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />

                        {/* Red Laser Line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-red-500/80 shadow-[0_0_10px_#ef4444] animate-[scan_2s_infinite_ease-in-out]" />
                      </div>
                    </div>
                  )}

                  {/* Status Banner */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold py-2 px-4 rounded-xl text-center border border-slate-800 pointer-events-none">
                    {isScanning ? "Align QR code inside the center frame" : "Activating Camera..."}
                  </div>
                </div>

                {/* Action button if stopped */}
                {!isScanning && (
                  <button
                    onClick={startCamera}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-200"
                  >
                    <Camera className="h-4 w-4" />
                    Restart Camera
                  </button>
                )}
              </div>
            )}

            {/* Viewport for Drag-and-Drop Image Uploader */}
            {activeTab === "upload" && !decodedText && (
              <div className="flex flex-col items-center">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`w-full max-w-md aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${dragActive
                      ? "border-indigo-500 bg-indigo-50/30 scale-[0.99]"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 mb-4 group-hover:text-slate-600 transition-colors">
                    <UploadCloud className="h-8 w-8 text-indigo-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Drag and drop your QR Image here
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                    Supports PNG, JPG, JPEG, and WebP file formats.
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all"
                  >
                    Select File
                  </button>
                </div>
              </div>
            )}

            {/* Displaying Decoding & API Fetching loaders */}
            {(apiLoading) && (
              <div className="flex flex-col items-center py-12 text-slate-600">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-sm font-medium animate-pulse">Fetching product information from store...</p>
              </div>
            )}

            {/* Displaying local QR or Camera setup Errors */}
            {(scanError) && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-rose-700 text-sm mt-4">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Scanning Issue</h4>
                  <p className="mt-1 leading-relaxed">{scanError}</p>
                  <button
                    onClick={handleReset}
                    className="mt-3 px-3 py-1 bg-white hover:bg-rose-100/30 border border-rose-200 rounded-lg text-xs font-bold text-rose-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Displaying API errors */}
            {apiError && !apiLoading && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800 text-sm mt-4">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Product Retrieval Failed</h4>
                  <p className="mt-1 leading-relaxed">{apiError}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => productSlug && fetchProductDetails(productSlug)}
                      className="px-3 py-1 bg-white hover:bg-amber-100/30 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 transition-colors"
                    >
                      Retry Request
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Scan Another
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Success state - Decoded text but API failed/still loaded, gives debug details if needed */}
            {decodedText && !productData && !apiLoading && !apiError && (
              <div className="text-center py-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">QR Code Decoded Successfully</p>
                <code className="mt-1 block text-xs bg-slate-50 border border-slate-100 p-2 rounded-lg max-w-md mx-auto truncate font-mono text-slate-500">
                  {decodedText}
                </code>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                >
                  Scan Another Code
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rich Product Details Section */}
        {productData && !apiLoading && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8 animate-[fadeIn_0.4s_ease-out] flex flex-col gap-6">

            {/* Success Decoded Banner */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Product Decoded
              </div>
            </div>

            {/* 1. Title Section */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {productData.productInfo.title}
              </h2>
            </div>

            {/* 2. Description Section */}
            {productData.productInfo.description && (
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50">
                {productData.productInfo.description}
              </div>
            )}

            {/* 3. Pricing Section */}
            <div className="bg-slate-50/30 rounded-2xl p-5 border border-slate-100 flex flex-col gap-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Pricing Info
                </h3>
                {productData.variants && productData.variants.length > 0 ? (
                  selectedVariant ? (
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-955">
                          <PriceDisplay
                            amount={selectedVariant.price}
                            originalCurrency={productData.simplePricing?.currency || "INR"}
                            manualOverrides={selectedVariant.manualCurrencyPrices || productData.manualCurrencyPrices}
                          />
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-indigo-650 mt-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 inline-block w-fit">
                        Selected: {selectedVariant.name}
                      </span>
                    </div>
                  ) : (
                    (() => {
                      const prices = productData.variants.map((v: any) => v.price);
                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);
                      return (
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-slate-955">
                            {minPrice === maxPrice ? (
                              <PriceDisplay
                                amount={minPrice}
                                originalCurrency={productData.simplePricing?.currency || "INR"}
                                manualOverrides={productData.manualCurrencyPrices}
                              />
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <PriceDisplay
                                  amount={minPrice}
                                  originalCurrency={productData.simplePricing?.currency || "INR"}
                                  manualOverrides={productData.manualCurrencyPrices}
                                />
                                <span className="text-slate-400 font-normal text-lg">to</span>
                                <PriceDisplay
                                  amount={maxPrice}
                                  originalCurrency={productData.simplePricing?.currency || "INR"}
                                  manualOverrides={productData.manualCurrencyPrices}
                                />
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })()
                  )
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-955">
                        <PriceDisplay
                          amount={productData.simplePricing?.discountedPrice || productData.simplePricing?.basePrice || 0}
                          originalCurrency={productData.simplePricing?.currency || "INR"}
                          manualOverrides={productData.manualCurrencyPrices}
                        />
                      </span>
                      {productData.simplePricing?.discountedPrice && productData.simplePricing?.basePrice && productData.simplePricing.basePrice > productData.simplePricing.discountedPrice && (
                        <span className="text-sm font-medium text-slate-400 line-through">
                          <PriceDisplay
                            amount={productData.simplePricing.basePrice}
                            originalCurrency={productData.simplePricing.currency || "INR"}
                          />
                        </span>
                      )}
                    </div>
                    {productData.simplePricing?.discountedPrice && productData.simplePricing?.basePrice && productData.simplePricing.basePrice > productData.simplePricing.discountedPrice && (
                      <p className="text-xs font-bold text-emerald-600 mt-1 bg-emerald-50 px-2 py-0.5 rounded-md inline-block w-fit">
                        {Math.round(
                          ((productData.simplePricing.basePrice - productData.simplePricing.discountedPrice) /
                            productData.simplePricing.basePrice) *
                          100
                        )}% Discount Applied
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Specifications & Parameters Table */}
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-indigo-500" />
                Product Specifications & Info
              </h3>
              <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Parameter</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {(selectedVariant?.sku || productData.sku) && (
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-500">SKU</td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                          {selectedVariant?.sku || productData.sku}
                        </td>
                      </tr>
                    )}
                    {productData.brand?.name && (
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-500">Brand</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{productData.brand.name}</td>
                      </tr>
                    )}
                    {(typeof productData.category === "string" ? productData.category : productData.category?.name) && (
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-500">Category</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {typeof productData.category === "string" ? productData.category : productData.category?.name}
                        </td>
                      </tr>
                    )}
                    {productData.productPricingType && (
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-500">Structure Type</td>
                        <td className="px-4 py-3 text-slate-800 capitalize">{productData.productPricingType} Pricing</td>
                      </tr>
                    )}
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-500">Return Policy</td>
                      <td className="px-4 py-3 text-slate-800">
                        {productData.is_returnable
                          ? `Returnable within ${productData.return_window_days || 7} days`
                          : "Non-Returnable"}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-500">Replacement Policy</td>
                      <td className="px-4 py-3 text-slate-800">
                        {productData.is_replaceable
                          ? "Replacement Available"
                          : "No Replacement"}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-500">Tax details</td>
                      <td className="px-4 py-3 text-slate-800">
                        {productData.tax_rate !== undefined
                          ? `Tax rate: ${productData.tax_rate}% GST`
                          : "Tax included"}
                      </td>
                    </tr>
                    
                    {/* Render dynamic attributes */}
                    {productData.attributes && Object.entries(productData.attributes).map(([key, value]) => {
                      if (value === null || typeof value === "object") return null;
                      return (
                        <tr key={key} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-500 capitalize">{key.replace(/_/g, " ")}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{String(value)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4.5 Available Variants List */}
            {productData.variants && productData.variants.length > 0 && (
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  Available Variants
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {productData.variants.map((v) => {
                    const isSelected = selectedVariant?._id === v._id;
                    return (
                      <div
                        key={v._id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 cursor-pointer ${
                          isSelected
                            ? "border-indigo-650 bg-indigo-50/10 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="variant-select"
                            checked={isSelected}
                            onChange={() => setSelectedVariant(v)}
                            className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">{v.name}</span>
                            {v.sku && (
                              <span className="text-[10px] font-mono text-slate-400">SKU: {v.sku}</span>
                            )}
                          </div>
                        </div>
                        
                        <span className="font-bold text-slate-900 text-sm shrink-0">
                          <PriceDisplay
                            amount={v.price}
                            originalCurrency={productData.simplePricing?.currency || "INR"}
                            manualOverrides={v.manualCurrencyPrices || productData.manualCurrencyPrices}
                          />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Product Image / Media Showcase */}
            {(() => {
              // Get main media URL and details
              let mediaUrl = "";
              let isVideo = false;
              let altText = productData.productInfo.title;

              if (productData.images && productData.images.length > 0) {
                const mainImage = productData.images[0];
                mediaUrl = getFullMediaUrl(mainImage.url);
                isVideo = mainImage.type === "video" || /\.(mp4|mov|webm|avi|mkv)$/i.test(mainImage.url);
                if (mainImage.alt) altText = mainImage.alt;
              } else if (productData.icon?.url) {
                mediaUrl = getFullMediaUrl(productData.icon.url);
                isVideo = productData.icon.type === "video" || /\.(mp4|mov|webm|avi|mkv)$/i.test(productData.icon.url);
                if (productData.icon.alt) altText = productData.icon.alt;
              }

              if (!mediaUrl) return null;

              return (
                <div className="flex flex-col gap-3">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Product Visual Preview
                  </h3>
                  <div className="relative w-full max-w-lg mx-auto aspect-video sm:aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-4 shadow-sm group">
                    {isVideo ? (
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-contain rounded-xl"
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-full relative">
                        <Image
                          src={mediaUrl}
                          alt={altText}
                          fill
                          className="object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 6. Actions (View page / Scan Another) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <Link
                href={`/products/${productData.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 active:scale-[0.98] transition-all"
              >
                <ExternalLink className="h-4 w-4 text-indigo-250" />
                Full Product Page
              </Link>

              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center py-3.5 px-6 rounded-2xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              >
                Scan Another Item
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
