"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard,
  ShoppingCart,
  Combine,
  Boxes,
  FileText,
  Calculator,
  Users,
  CreditCard,
  Tags,
  Wallet,
  Palette,
  Globe,
  Layers,
  Smartphone,
  Search,
  PenTool as Brush,
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
  Lock,
  Library,
  Flag,
  Truck,
  ShoppingBag,
  BarChart3,
  Mail,
  Zap,
  ClipboardList,
  FileEdit,
  Coins,
  Share2,
  Server
} from "lucide-react";

const featureItems = [
  { title: "Advanced Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { title: "Order Lifecycle", icon: <ShoppingCart className="w-5 h-5" /> },
  { title: "Product Bundling", icon: <Combine className="w-5 h-5" /> },
  { title: "Automated Invoicing", icon: <FileText className="w-5 h-5" /> },
  { title: "Discount Logic", icon: <Tags className="w-5 h-5" /> },
  { title: "Custom Domains", icon: <Globe className="w-5 h-5" /> },
  { title: "Sections Library", icon: <Layers className="w-5 h-5" /> },
  { title: "Media Hub", icon: <ImageIcon className="w-5 h-5" /> },
  { title: "Audit Trails", icon: <ShieldCheck className="w-5 h-5" /> },
  { title: "Collection Builder", icon: <Library className="w-5 h-5" /> },
  { title: "Product Flags", icon: <Flag className="w-5 h-5" /> },
  { title: "Detailed Analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { title: "Bulk Operations", icon: <Zap className="w-5 h-5" /> },
  { title: "Inventory Logs", icon: <ClipboardList className="w-5 h-5" /> },
  { title: "Page Builder", icon: <FileEdit className="w-5 h-5" /> },
  { title: "Multi-Store Scaling", icon: <Server className="w-5 h-5" /> }
];

export default function MoreFeatures() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              More featured
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[17px] text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            The theme of providing the best services is essential in any industry, as it
            is the cornerstone of building customer satisfaction and loyalty.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          {featureItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.02 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 px-6 py-4 bg-gray-50/70 rounded-full border border-gray-100/50 hover:bg-white hover:shadow-sm transition-all duration-300"
            >
              <div className="flex-shrink-0 text-[#6c3aed]">
                {item.icon}
              </div>
              <div className="w-[1.5px] h-5 bg-gray-200" />
              <span className="text-sm font-semibold text-gray-700 font-geist-sans truncate">
                {item.title}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
