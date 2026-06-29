"use client";

import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Store, Settings, Sparkles, BarChart2, Shield, Globe } from "lucide-react";

interface RootDomainPortalProps {
  cleanHost: string;
}

export const RootDomainPortal = ({ cleanHost }: RootDomainPortalProps) => {
  const getAdminUrl = () => {
    if (process.env.NEXT_PUBLIC_ADMIN_URL) {
      return process.env.NEXT_PUBLIC_ADMIN_URL;
    }
    if (cleanHost === "localhost" || cleanHost === "127.0.0.1" || cleanHost.includes("localhost")) {
      return "http://localhost:3001";
    }
    const baseDomain = typeof window !== "undefined" 
      ? window.location.hostname.replace("www.", "") 
      : "prefyn.com";
    return `https://admin.${baseDomain}`;
  };

  const adminUrl = getAdminUrl();

  const features = [
    {
      icon: <Store className="w-6 h-6 text-blue-500" />,
      title: "Instant Storefronts",
      description: "Provision a fully functional, lightning-fast storefront with custom subdomains instantly.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
      title: "Visual Page Builder",
      description: "Customize your homepage, header navigation, footers, and collections without writing code.",
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-500" />,
      title: "Custom Domains",
      description: "Connect your own brand domain with automatic SSL certification and routing.",
    },
    {
      icon: <Settings className="w-6 h-6 text-amber-500" />,
      title: "Global Customization",
      description: "Configure multi-currency, custom payment gateways, taxes, and localization dynamically.",
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-indigo-500" />,
      title: "Advanced SEO & Scripts",
      description: "Inject custom headers/footers scripts, Google Tag Manager, Facebook Pixel, and metadata.",
    },
    {
      icon: <Shield className="w-6 h-6 text-rose-500" />,
      title: "Enterprise Security",
      description: "Built-in roles management, audit logs, invoice automation, and robust performance hosting.",
    },
  ];

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex-none">
        <div className="max-w-7xl mx-auto px-6 h-16 lg:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20">
              EP
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              EPxWEB <span className="text-blue-600 font-medium text-sm ml-1">SaaS</span>
            </span>
          </div>

          <a
            href={adminUrl}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-sm transition-all duration-200 border border-slate-200/80 flex items-center gap-1.5"
          >
            Dashboard Login <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-6 relative z-10 overflow-hidden">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-10 lg:mb-6 flex-none">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-4 lg:mb-3 inline-block">
              Multi-tenant E-Commerce Infrastructure
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-4xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4 lg:mb-3"
          >
            Launch Your Brand E-Commerce Store{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              In Seconds
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base lg:text-sm text-slate-600 max-w-2xl lg:max-w-xl mx-auto mb-6 lg:mb-4 leading-relaxed"
          >
            Build, launch, and scale independent custom storefronts with our powerful multi-tenant architecture. Dynamic SEO, design settings, and advanced dashboards built right in.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href={adminUrl}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 group hover:scale-[1.02]"
            >
              Get Started & Create Store
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-4 w-full pt-4 lg:pt-2 flex-none">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="p-6 lg:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 lg:py-4 mt-auto relative z-10 flex-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} EPxWEB. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Documentation</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
