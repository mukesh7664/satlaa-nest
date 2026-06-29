'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { marketplaceApi } from '@/services/marketplace.api';
import {
    ShoppingBag,
    ArrowLeft,
    ShieldCheck,
    Truck,
    RotateCcw,
    Star,
    Check,
    ChevronRight,
    ExternalLink,
    Clock,
    Zap,
    Info,
    Layout,
    HelpCircle,
    List
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');

    // Variant Selection State
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const data = await marketplaceApi.getProductDetails(params.id as string);
                setProduct(data);

                // Initialize variants
                if (data && data.children && data.children.length > 0) {
                    const firstVariant = data.children[0];
                    setSelectedVariant(firstVariant);
                    setSelectedAttributes(firstVariant.attributes || {});
                }
            } catch (error) {
                console.error("Failed to load product details:", error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [params.id]);

    // Reset active image if it goes out of bounds when variants change
    useEffect(() => {
        setActiveImage(0);
    }, [selectedVariant]);

    const getUniqueAttributes = () => {
        if (!product?.children) return {};
        const attrs: Record<string, Set<string>> = {};
        product.children.forEach((v: any) => {
            const vAttrs = v.attributes || {};
            Object.entries(vAttrs).forEach(([key, val]) => {
                if (!attrs[key]) attrs[key] = new Set();
                attrs[key].add(val as string);
            });
        });
        const result: Record<string, string[]> = {};
        Object.entries(attrs).forEach(([key, set]) => {
            result[key] = Array.from(set);
        });
        return result;
    };

    const findMatchingVariant = (attrs: Record<string, string>) => {
        if (!product?.children) return null;
        return product.children.find((v: any) => {
            const vAttrs = v.attributes || {};
            return Object.entries(attrs).every(([key, value]) => vAttrs[key] === value);
        });
    };

    const handleAttributeChange = (key: string, value: string) => {
        const newAttrs = { ...selectedAttributes, [key]: value };
        setSelectedAttributes(newAttrs);
        const matched = findMatchingVariant(newAttrs);
        if (matched) {
            setSelectedVariant(matched);
        }
    };

    const getProductStoreUrl = (product: any) => {
        const store = product.store;
        if (!store) return "#";

        let protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
        const baseWebsiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

        let storeBaseUrl = baseWebsiteUrl;

        if (store.customDomain) {
            storeBaseUrl = process.env.NODE_ENV === 'development'
                ? `http://${store.customDomain}`
                : `${protocol}//${store.customDomain}`;
        } else if (store.slug || store.primaryDomain) {
            const slug = store.slug || (store.primaryDomain && store.primaryDomain.split('.')[0]);
            if (process.env.NODE_ENV === 'development') {
                try {
                    const parsedBaseUrl = new URL(baseWebsiteUrl);
                    storeBaseUrl = `${parsedBaseUrl.protocol}//${slug}.${parsedBaseUrl.host}`;
                } catch (e) {
                    storeBaseUrl = `http://${slug}.localhost:3000`;
                }
            } else {
                storeBaseUrl = `${protocol}//${slug}.epxweb.com`;
            }
        }

        return `${storeBaseUrl}/products/${product.slug}`;
    };

    const handleBuyInStore = () => {
        const url = getProductStoreUrl(product);
        window.open(url, '_blank');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Product...</p>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
            <ShoppingBag size={80} className="text-slate-200 mb-8" />
            <h1 className="text-4xl font-black text-slate-900 mb-4">Product Not Found</h1>
            <p className="text-slate-500 mb-12 max-w-md">The product you are looking for might have been removed or is no longer available in the marketplace.</p>
            <Link href="/products" className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all">
                Back to Products
            </Link>
        </div>
    );

    const productDetails = product.product_details || {};
    const baseImages = product.media && product.media.length > 0
        ? product.media.map((m: any) => m.url)
        : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"];

    // Combine variants images if available
    const variantImages = selectedVariant?.media && selectedVariant.media.length > 0
        ? selectedVariant.media.map((m: any) => m.url)
        : [];

    const images = variantImages.length > 0 ? [...variantImages, ...baseImages] : baseImages;


    const availableAttributes = getUniqueAttributes();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Info, enabled: productDetails.overview?.enabled !== false && (productDetails.overview?.content || product.description) },
        { id: 'features', label: 'Features', icon: Zap, enabled: productDetails.features?.enabled !== false && (productDetails.features?.featurePoints?.length > 0 || productDetails.features?.checklist?.length > 0) },
        { id: 'bundle', label: 'Bundle Contents', icon: ShoppingBag, enabled: product.isBundle && product.bundleItems?.length > 0 },
        { id: 'specs', label: 'Specifications', icon: List, enabled: (productDetails.specifications?.enabled !== false && productDetails.specifications?.columns?.length > 0) || (product.attributes && Object.keys(product.attributes).length > 0) },
        { id: 'faq', label: 'FAQ', icon: HelpCircle, enabled: productDetails.faq?.enabled !== false && productDetails.faq?.questions?.length > 0 },
    ].filter(t => t.enabled);

    const displayPrice = selectedVariant?.price || product.price || 0;
    const originalPrice = selectedVariant?.attributes?.originalPrice || product.attributes?.originalPrice;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Navigation Bar */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Link href="/" className="hover:text-indigo-600">Marketplace</Link>
                        <ChevronRight size={12} />
                        <Link href="/products" className="hover:text-indigo-600">Products</Link>
                        <ChevronRight size={12} />
                        <span className="text-slate-900 truncate max-w-[120px]">{product.title}</span>
                    </div>

                    <div className="w-10"></div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left: Image Gallery */}
                        <div className="p-8 lg:p-12 bg-slate-50/50 border-r border-slate-100">
                            <div className="sticky top-32">
                                <motion.div
                                    key={activeImage}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 relative shadow-sm group"
                                >
                                    <img
                                        src={images[activeImage]}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase text-slate-900 shadow-sm border border-slate-100 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            Official Store
                                        </span>
                                    </div>

                                    {product.isFeatured && (
                                        <div className="absolute top-6 right-6">
                                            <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-indigo-100 flex items-center gap-2">
                                                Featured
                                            </span>
                                        </div>
                                    )}
                                </motion.div>

                                {images.length > 1 && (
                                    <div className="flex gap-4 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                                        {images.map((img: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImage(idx)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-indigo-600 shadow-md scale-105' : 'border-white hover:border-slate-200'}`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Essential Info */}
                        <div className="p-8 lg:p-12 flex flex-col">
                            <div className="mb-auto">
                                <div className="flex items-center gap-3 mb-6">
                                    <Link href={`/stores/${product.store?.slug}`} className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all">
                                        {product.store?.name}
                                    </Link>
                                    <span className="text-slate-300">|</span>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Star size={14} fill="currentColor" />
                                        <span className="text-slate-900 text-xs font-black">4.8</span>
                                    </div>
                                    {product.category?.name && (
                                        <>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{product.category.name}</span>
                                        </>
                                    )}
                                </div>

                                <h1 className="text-4xl font-black text-slate-900 font-outfit leading-tight tracking-tight mb-4">{product.title}</h1>

                                {selectedVariant && (
                                    <div className="mb-4">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                            Selected: {selectedVariant.title}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-baseline gap-3 mb-2">
                                    <motion.span 
                                        key={displayPrice}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-5xl font-black font-outfit text-indigo-600 tracking-tighter"
                                    >
                                        ₹{Number(displayPrice).toLocaleString('en-IN')}
                                    </motion.span>
                                    {originalPrice && Number(originalPrice) > displayPrice && (
                                        <span className="text-xl text-slate-300 line-through font-bold tracking-tighter">₹{Number(originalPrice).toLocaleString('en-IN')}</span>
                                    )}
                                    {originalPrice && Number(originalPrice) > displayPrice && (
                                        <span className="text-green-500 text-sm font-black uppercase tracking-widest ml-2">
                                            {Math.round(((Number(originalPrice) - displayPrice) / Number(originalPrice)) * 100)}% OFF
                                        </span>
                                    )}
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">
                                    Inclusive of all taxes (GST)
                                </div>

                                {/* Variant Selectors */}
                                {Object.keys(availableAttributes).length > 0 && (
                                    <div className="space-y-6 mb-10">
                                        {Object.entries(availableAttributes).map(([key, values]) => (
                                            <div key={key}>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">{key}</h3>
                                                <div className="flex flex-wrap gap-3">
                                                    {values.map((val: string) => {
                                                        const isSelected = selectedAttributes[key] === val;
                                                        return (
                                                            <button
                                                                key={val}
                                                                onClick={() => handleAttributeChange(key, val)}
                                                                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${isSelected
                                                                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                                                                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                                                                    }`}
                                                            >
                                                                {val}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                                        <Truck size={18} className="text-indigo-600" />
                                        <span>Fast delivery available to your location</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                                        <ShieldCheck size={18} className="text-indigo-600" />
                                        <span>Verified authentic from {product.store?.name}</span>
                                    </div>
                                    {product.is_returnable && (
                                        <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                                            <RotateCcw size={18} className="text-indigo-600" />
                                            <span>{product.return_window_days || 7} Days easy return policy</span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-slate-500 leading-relaxed mb-10 font-medium">
                                    {product.description || "This premium product is part of our curated marketplace collection, ensuring you receive the highest quality directly from independent brands."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleBuyInStore}
                                    className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group"
                                >
                                    Buy in Store <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                                <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction secured by the official vendor</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Detailed Info Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sticky Tabs Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-2">
                            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Details & Specs</h3>
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 translate-x-2' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-[3rem] border border-slate-100 p-8 lg:p-16 min-h-[500px]"
                            >
                                {activeTab === 'overview' && (
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight mb-8">Product Overview</h2>
                                        <div
                                            className="prose prose-slate max-w-none prose-p:text-slate-500 prose-p:leading-relaxed prose-headings:text-slate-900 prose-headings:font-black prose-li:text-slate-500"
                                            dangerouslySetInnerHTML={{ __html: productDetails.overview?.content || product.description }}
                                        />
                                    </div>
                                )}

                                {activeTab === 'features' && (
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight mb-8">Key Features</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {productDetails.features?.featurePoints?.map((item: any, idx: number) => (
                                                <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                                    <h4 className="font-black text-slate-900 mb-2">{item.title}</h4>
                                                    <p className="text-sm text-slate-500 font-medium">{item.content}</p>
                                                </div>
                                            ))}
                                            {productDetails.features?.checklist?.map((item: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                                        <Check size={16} strokeWidth={4} />
                                                    </div>
                                                    <span className="font-bold text-slate-700">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'bundle' && (
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight mb-8">Bundle Contents</h2>
                                        <div className="space-y-4">
                                            {product.bundleItems?.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all group">
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-100 shrink-0">
                                                        <img
                                                            src={item.product?.media?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60"}
                                                            alt=""
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-black text-slate-900 mb-1">{item.product?.title}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                                                                Qty: {item.quantity}
                                                            </span>
                                                            {item.product?.sku && (
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                    SKU: {item.product.sku}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/products/${item.product?.id}`}
                                                        className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all"
                                                    >
                                                        <ArrowLeft className="rotate-180" size={18} />
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'specs' && (
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight mb-8">Technical Specifications</h2>

                                        {/* Standard Specs from productDetails */}
                                        <div className="space-y-12 mb-12">
                                            {productDetails.specifications?.columns?.map((column: any[], colIdx: number) => (
                                                <div key={colIdx} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                                    {column.map((spec: any, idx: number) => (
                                                        <div key={idx} className="flex flex-col gap-1 border-b border-slate-100 pb-4">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{spec.title}</span>
                                                            <span className="text-slate-900 font-bold">{spec.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Attributes from product entity */}
                                        {product.attributes && Object.keys(product.attributes).length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                                                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                                    Product Attributes
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {Object.entries(product.attributes).map(([key, value]: [string, any]) => (
                                                        <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">{key}</span>
                                                            <span className="text-slate-900 font-bold">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'faq' && (
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 font-outfit tracking-tight mb-8">Frequently Asked Questions</h2>
                                        <div className="space-y-6">
                                            {productDetails.faq?.questions?.map((faq: any, idx: number) => (
                                                <div key={idx} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                                    <h4 className="font-black text-lg text-slate-900 mb-4">{faq.question}</h4>
                                                    <p className="text-slate-500 font-medium leading-relaxed">{faq.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>


            </main>
        </div>
    );
}
