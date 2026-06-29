'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MarketplaceStoresProps {
    stores: any[];
    loading: boolean;
}

const MarketplaceStores = ({ stores, loading }: MarketplaceStoresProps) => {
    
    const getStoreUrl = (store: any) => {
        // Replicating Admin's Domain Logic
        // Priority: Custom domain > Subdomain > Fallback
        
        let protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
        const baseWebsiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

        // Check if store has a custom domain
        if (store.customDomain) {
            if (process.env.NODE_ENV === 'development') {
                return `http://${store.customDomain}`;
            } else {
                return `${protocol}//${store.customDomain}`;
            }
        } 
        
        // Check if store has a primary/subdomain (slug)
        if (store.slug || store.primaryDomain) {
            const slug = store.slug || store.primaryDomain.split('.')[0];
            
            if (process.env.NODE_ENV === 'development') {
                try {
                    // Match admin's local dev pattern: http://slug.localhost:3000
                    const parsedBaseUrl = new URL(baseWebsiteUrl);
                    return `${parsedBaseUrl.protocol}//${slug}.${parsedBaseUrl.host}`;
                } catch (e) {
                    return `http://${slug}.localhost:3000`;
                }
            } else {
                // Production: slug.epxweb.com
                return `${protocol}//${slug}.epxweb.com`;
            }
        }

        // Final fallback
        return baseWebsiteUrl;
    };

    const handleStoreClick = (store: any) => {
        const storeUrl = getStoreUrl(store);
        window.open(storeUrl, '_blank');
    };

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold font-outfit">Featured Stores</h2>
                        <p className="text-slate-500 mt-2">Discover premium shops powered by EPxWEB</p>
                    </div>
                    <Link href="/stores" className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all">
                        View All <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 bg-slate-200 rounded-3xl animate-pulse"></div>
                        ))
                    ) : stores.length > 0 ? (
                        stores.map((store, i) => (
                            <motion.div 
                                key={store.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => handleStoreClick(store)}
                                className="group bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all cursor-pointer flex flex-col items-start"
                            >
                                {/* Store Logo / Image */}
                                <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center group-hover:border-indigo-200 transition-all">
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

                                {/* Store Info */}
                                <h3 className="mt-6 text-xl font-bold font-outfit group-hover:text-indigo-600 transition-colors line-clamp-1">
                                    {store.name}
                                </h3>
                                <p className="text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">
                                    {store.description || "Discover premium products and curated collections from this independent seller."}
                                </p>

                                <div className="mt-6 pt-6 border-t border-slate-50 w-full flex items-center text-indigo-600 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    Visit Store <ArrowRight size={14} className="ml-2" />
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-400">No stores found.</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default MarketplaceStores;
