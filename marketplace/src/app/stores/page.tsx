'use client';

import React, { useEffect, useState } from 'react';
import { marketplaceApi } from '@/services/marketplace.api';
import { Store, Search, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function StoresPage() {
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadStores = async () => {
            try {
                const data = await marketplaceApi.getStores();
                setStores(data);
            } catch (error) {
                console.error("Failed to load stores:", error);
            } finally {
                setLoading(false);
            }
        };
        loadStores();
    }, []);

    const getStoreUrl = (store: any) => {
        let protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
        const baseWebsiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

        if (store.customDomain) {
            if (process.env.NODE_ENV === 'development') {
                return `http://${store.customDomain}`;
            } else {
                return `${protocol}//${store.customDomain}`;
            }
        } 
        
        if (store.slug || store.primaryDomain) {
            const slug = store.slug || (store.primaryDomain && store.primaryDomain.split('.')[0]);
            
            if (process.env.NODE_ENV === 'development') {
                try {
                    const parsedBaseUrl = new URL(baseWebsiteUrl);
                    return `${parsedBaseUrl.protocol}//${slug}.${parsedBaseUrl.host}`;
                } catch (e) {
                    return `http://${slug}.localhost:3000`;
                }
            } else {
                return `${protocol}//${slug}.epxweb.com`;
            }
        }

        return baseWebsiteUrl;
    };

    const handleStoreClick = (store: any) => {
        const storeUrl = getStoreUrl(store);
        window.open(storeUrl, '_blank');
    };

    const filteredStores = stores.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors mb-8">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black font-outfit text-slate-900 tracking-tight">Explore Stores</h1>
                    <p className="text-slate-500 mt-3 text-lg">Discover unique brands and their stories powered by EPxWEB</p>
                    
                    <div className="mt-10 relative max-w-2xl">
                        <div className="absolute inset-y-0 left-5 flex items-center text-slate-400">
                            <Search size={22} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by store name..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg font-medium shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Stores Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 bg-white rounded-[2.5rem] animate-pulse border border-slate-100 shadow-sm"></div>
                        ))}
                    </div>
                ) : filteredStores.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {filteredStores.map((store, i) => (
                            <motion.div 
                                key={store.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => handleStoreClick(store)}
                                className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] transition-all cursor-pointer flex flex-col items-start"
                            >
                                <div className="flex items-start justify-between w-full">
                                    <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center group-hover:border-indigo-200 transition-all shadow-sm">
                                        {store.logo ? (
                                            <img 
                                                src={store.logo} 
                                                alt={store.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-2xl font-black text-indigo-200 uppercase">
                                                {store.name?.substring(0, 2)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-4 py-1.5 bg-green-50 text-green-600 text-[10px] font-black tracking-widest uppercase rounded-full">
                                        Verified
                                    </div>
                                </div>
                                
                                <h2 className="mt-8 text-2xl font-black font-outfit text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{store.name}</h2>
                                <p className="text-slate-500 mt-4 line-clamp-2 leading-relaxed text-sm">
                                    {store.description || "Discover premium products and curated collections from this independent seller."}
                                </p>
                                
                                <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wide">
                                        <MapPin size={14} className="text-indigo-400" />
                                        <span>Global Delivery</span>
                                    </div>
                                    <button 
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200"
                                    >
                                        Visit Store <ArrowRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-8">
                            <Search size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">No stores found</h2>
                        <p className="text-slate-500 mt-3 text-lg">Try searching for a different keyword</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-8 text-indigo-600 font-bold hover:underline"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
