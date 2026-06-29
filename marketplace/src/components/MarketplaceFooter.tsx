'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import Link from 'next/link';

const MarketplaceFooter = () => {
    return (
        <footer className="bg-slate-900 text-white py-24">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <Globe size={20} />
                            </div>
                            <span className="text-xl font-bold font-outfit">Marketplace</span>
                        </div>
                        <p className="mt-6 text-slate-400 max-w-sm">
                            The ultimate discovery platform for independent brands. Empowering creators to reach a global audience with ease.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-6">Explore</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li><Link href="/stores" className="hover:text-indigo-400 transition-colors">Featured Stores</Link></li>
                            <li><Link href="/products" className="hover:text-indigo-400 transition-colors">Trending Products</Link></li>
                            <li><Link href="/categories" className="hover:text-indigo-400 transition-colors">Categories</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-6">Support</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li><Link href="/help" className="hover:text-indigo-400 transition-colors">Help Center</Link></li>
                            <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-24 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                    &copy; 2026 EPx Marketplace. Built with ❤️ for independent brands.
                </div>
            </div>
        </footer>
    );
};

export default MarketplaceFooter;
