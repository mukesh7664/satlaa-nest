'use client';

import React from 'react';
import { 
    Shirt, 
    Watch, 
    Gem, 
    Smartphone, 
    Sparkles, 
    Footprints, 
    Home, 
    ShoppingBag, 
    Construction,
    Layers,
    Glasses
} from 'lucide-react';

const categories = [
    { name: "CLOTHING", icon: Shirt },
    { name: "WATCHES", icon: Watch },
    { name: "METALS", icon: Construction },
    { name: "ELECTRONICS", icon: Smartphone },
    { name: "BEAUTY", icon: Sparkles },
    { name: "FOOTWEAR", icon: Footprints },
    { name: "HOME DECOR", icon: Home },
    { name: "JEWELRY", icon: Gem },
    { name: "ACCESSORIES", icon: Glasses },
    { name: "LIFESTYLE", icon: ShoppingBag },
];

const MarketplaceBrandSlider = () => {
    const duplicatedCategories = [...categories, ...categories, ...categories];

    return (
        <div className="w-full py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 text-center mb-10">
                <p className="text-slate-500 font-medium text-sm tracking-wide uppercase">
                    Shop by Popular Categories
                </p>
            </div>
            
            <div className="flex overflow-hidden group">
                <div className="flex animate-loop-scroll group-hover:[animation-play-state:paused]">
                    {duplicatedCategories.map((item, index) => (
                        <div 
                            key={index} 
                            className="flex items-center gap-4 mx-12 grayscale hover:grayscale-0 transition-all duration-300"
                        >
                            <item.icon className="h-8 w-8 text-slate-400" />
                            <span className="text-slate-400 font-black text-2xl tracking-tighter">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes loop-scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-loop-scroll {
                    animation: loop-scroll 30s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default MarketplaceBrandSlider;
