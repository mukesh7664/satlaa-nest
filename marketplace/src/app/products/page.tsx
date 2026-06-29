'use client';

import React, { useEffect, useState } from 'react';
import { marketplaceApi } from '@/services/marketplace.api';
import { ShoppingBag, Search, Filter, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await marketplaceApi.getProducts(50, 0);
                setProducts(data.items || []);
            } catch (error) {
                console.error("Failed to load products:", error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

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

    const filteredProducts = products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 py-20 lg:py-24">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors mb-8">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-black font-outfit leading-tight tracking-tight">All Products</h1>
                    <p className="text-slate-400 mt-4 text-xl max-w-2xl leading-relaxed">Browse the complete collection from our global community of independent brands.</p>
                    
                    <div className="mt-12 flex flex-wrap gap-4">
                        <div className="relative flex-1 max-w-2xl">
                            <div className="absolute inset-y-0 left-5 flex items-center text-slate-500">
                                <Search size={22} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search by name, category or brand..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 bg-white/10 border border-white/10 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:bg-white/20 transition-all text-white text-lg placeholder-slate-500"
                            />
                        </div>
                        <button className="flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl">
                            <Filter size={18} /> Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[3/4] bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-16">
                        {filteredProducts.map((product, i) => (
                            <motion.div 
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group flex flex-col"
                            >
                                <div className="relative aspect-[4/5] bg-slate-50 rounded-[2.5rem] overflow-hidden group-hover:shadow-3xl group-hover:shadow-indigo-100/50 transition-all duration-500 border border-slate-100">
                                    <img 
                                        src={product.media?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60"} 
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    
                                    {/* Action Buttons - Centered Hover */}
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                        <button 
                                            onClick={() => router.push(`/products/${product.id}`)}
                                            className="bg-white text-slate-900 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transform translate-y-6 group-hover:translate-y-0 transition-all hover:bg-indigo-600 hover:text-white flex items-center justify-center gap-2"
                                        >
                                            View Product
                                        </button>
                                        <button 
                                            onClick={() => handleBuyClick(product)}
                                            className="bg-slate-900/80 backdrop-blur-md text-white w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transform translate-y-6 group-hover:translate-y-0 transition-all hover:bg-white hover:text-slate-900 flex items-center justify-center gap-2 border border-white/20"
                                        >
                                            Buy in Store <ExternalLink size={14} />
                                        </button>
                                    </div>

                                    {/* Brand Tag */}
                                    <div className="absolute top-5 left-5">
                                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase text-slate-900 shadow-sm border border-slate-100">
                                            {product.store?.name}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 px-2">
                                    <h3 className="font-bold text-slate-900 text-xl line-clamp-1 group-hover:text-indigo-600 transition-colors tracking-tight">{product.title}</h3>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black font-outfit text-slate-900 tracking-tighter">
                                                ₹{getDisplayPrice(product).toLocaleString('en-IN')}
                                                {product.children && product.children.length > 0 && <span className="text-[10px] ml-1 opacity-50">+</span>}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Available Now</span>
                                        </div>
                                        <button 
                                            onClick={() => router.push(`/products/${product.id}`)}
                                            className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-slate-100 shadow-sm"
                                        >
                                            <ShoppingBag size={22} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-200">
                        <ShoppingBag size={80} className="mx-auto text-slate-200 mb-8" />
                        <h2 className="text-4xl font-black text-slate-900 font-outfit tracking-tight">No products found</h2>
                        <p className="text-slate-500 mt-4 max-w-md mx-auto text-xl leading-relaxed font-medium">We couldn't find any products matching your search. Try different keywords or browse our categories.</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-12 px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
