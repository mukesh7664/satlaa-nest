'use client';

import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';

const MarketplaceNavbar = () => {
    return (
        <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent py-8">
            <div className="max-w-full mx-auto px-12 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                        E
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight">
                        EPx<span className="text-orange-500">WEB</span>
                    </span>
                </div>

                {/* Menu */}
                <div className="hidden lg:flex items-center gap-8">
                    <Link href="/stores" className="text-white hover:text-orange-400 transition-colors font-medium">All Stores</Link>
                    <Link href="/products" className="text-white hover:text-orange-400 transition-colors font-medium">Products</Link>
                    <Link href="/about" className="text-white hover:text-orange-400 transition-colors font-medium">About</Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    <Link href="/login" className="text-white hover:text-orange-400 transition-colors font-bold text-sm">Sign In</Link>
                    <Link href="/register" className="px-6 py-2.5 border-2 border-white/30 text-white rounded-full font-bold text-sm hover:bg-white hover:text-slate-900 transition-all">
                        Register
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default MarketplaceNavbar;
