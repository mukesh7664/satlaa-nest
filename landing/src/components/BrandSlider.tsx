"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Zap,
  Smartphone,
  Laptop,
  CreditCard,
  Truck,
  Cloud,
  Cpu,
  Package,
  Globe,
  Shield,
  Layers,
  LucideIcon
} from "lucide-react";

interface BrandItem {
  name: string;
  icon: LucideIcon;
  weight?: "font-normal" | "font-semibold" | "font-bold";
  isItalic?: boolean;
  size?: string;
  iconSize?: number;
}

const items: BrandItem[] = [
  { name: "Stripe", icon: CreditCard, weight: "font-semibold", size: "text-lg sm:text-2xl" },
  { name: "Amazon", icon: Cloud, weight: "font-normal", isItalic: true, size: "text-base sm:text-xl" },
  { name: "Electronics", icon: Smartphone, weight: "font-bold", size: "text-xl sm:text-3xl" },
  { name: "EPxWEB", icon: Zap, weight: "font-bold", size: "text-xl sm:text-3xl" },
  { name: "Fashion", icon: ShoppingBag, weight: "font-semibold", size: "text-lg sm:text-2xl" },
  { name: "Logistics", icon: Truck, weight: "font-normal", isItalic: true, size: "text-base sm:text-xl" },
  { name: "Hardware", icon: Cpu, weight: "font-semibold", size: "text-lg sm:text-2xl" },
  { name: "Inventory", icon: Package, weight: "font-normal", isItalic: true, size: "text-base sm:text-xl" },
  { name: "Global", icon: Globe, weight: "font-bold", size: "text-xl sm:text-3xl" },
  { name: "Security", icon: Shield, weight: "font-semibold", size: "text-lg sm:text-2xl" },
];

export default function BrandSlider() {
  // Triple the items to ensure seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="w-full pt-4 pb-0 sm:pb-16 relative overflow-hidden bg-transparent">
      {/* Label / Subtitle */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight px-4">
            <span className="text-[#6c3aed]">8,000+</span> Teams Trust <span className="opacity-90">EPxWEB</span>
          </h2>
        </div>
      </div>

      {/* Slider Container with CSS Mask for perfect blending */}
      <div 
        className="relative flex items-center"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)'
        }}
      >

        <motion.div
          className="flex gap-10 md:gap-16 whitespace-nowrap items-center"
          animate={{
            x: [0, -1 * (items.length * 280)],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {duplicatedItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 md:gap-6 group"
            >
              <div className="text-black transition-transform duration-300 group-hover:scale-110">
                <div className="hidden sm:block">
                  <item.icon size={item.iconSize || 36} />
                </div>
                <div className="block sm:hidden">
                  <item.icon size={item.iconSize || 24} />
                </div>
              </div>
              <span className={`text-black tracking-tighter ${item.weight || 'font-semibold'} ${item.size || 'text-xl'} ${item.isItalic ? 'italic' : ''} transition-all duration-300 group-hover:opacity-80`}>
                {item.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
