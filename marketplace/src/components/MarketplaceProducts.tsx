'use client';

import React from 'react';
import { ShoppingBag, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface MarketplaceProductsProps {
    products: any[];
    loading: boolean;
}

const MarketplaceProducts = ({ products, loading }: MarketplaceProductsProps) => {
    const router = useRouter();

    const getProductUrl = (product: any) => {
        const store = product.store;
        if (!store) return "#";

        let protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
        const baseWebsiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

        let storeBaseUrl = baseWebsiteUrl;

        // Domain logic (Priority: Custom > Subdomain)
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

        // Construct full product URL
        // Assuming the store frontend route is /product/[id] or /product/[slug]
        return `${storeBaseUrl}/products/${product.slug}`;
    };

    const handleBuyClick = (product: any) => {
        const url = getProductUrl(product);
        window.open(url, '_blank');
    };

    const getDisplayPrice = (product: any) => {
        if (product.price && product.price > 0) return Number(product.price);
        
        if (product.children && product.children.length > 0) {
            const prices = product.children
                .map((v: any) => Number(v.price))
                .filter((p: number) => !isNaN(p) && p > 0);
            
            if (prices.length > 0) {
                return Math.min(...prices);
            }
        }
        
        return 0;
    };

    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-black font-outfit text-slate-900 tracking-tight">Trending Products</h2>
                        <p className="text-slate-500 mt-2">Curated selection of the week's best finds from our top stores</p>
                    </div>
                    <Link href="/products" className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all">
                        Browse All <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="aspect-[3/4] bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
                        ))
                    ) : products.length > 0 ? (
                        products.map((product, i) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex flex-col"
                            >
                                <div className="relative aspect-[4/5] bg-slate-50 rounded-[2.5rem] overflow-hidden group-hover:shadow-2xl transition-all duration-500 border border-slate-100">
                                    <img
                                        src={product.media?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />

                                    {/* Brand Tag */}
                                    <div className="absolute top-5 left-5">
                                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase text-slate-900 shadow-sm">
                                            {product.store?.name}
                                        </span>
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                        <button
                                            onClick={() => router.push(`/products/${product.id}`)}
                                            className="bg-white text-slate-900 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all hover:bg-indigo-600 hover:text-white flex items-center justify-center gap-2"
                                        >
                                            View Product
                                        </button>
                                        <button
                                            onClick={() => handleBuyClick(product)}
                                            className="bg-slate-900/80 backdrop-blur-md text-white w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all hover:bg-white hover:text-slate-900 flex items-center justify-center gap-2 border border-white/20"
                                        >
                                            Buy in Store <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 px-2">
                                    <h3 className="font-bold text-slate-800 text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.title}</h3>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black font-outfit text-slate-900">
                                                ₹{getDisplayPrice(product).toLocaleString('en-IN')}
                                                {product.children && product.children.length > 0 && <span className="text-[10px] ml-1 opacity-50">+</span>}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Free Shipping</span>
                                        </div>
                                        <button
                                            onClick={() => handleBuyClick(product)}
                                            className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all"
                                        >
                                            <ShoppingBag size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                            <ShoppingBag size={64} className="mx-auto text-slate-200 mb-6" />
                            <h3 className="text-2xl font-black text-slate-400">No products available</h3>
                            <p className="text-slate-400 mt-2">Come back later or explore our featured stores</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default MarketplaceProducts;
