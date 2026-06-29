"use client";

import React from "react";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, CornerDownLeft, Store } from "lucide-react";

interface StoreNotFoundProps {
  cleanHost: string;
}

export const StoreNotFound = ({ cleanHost }: StoreNotFoundProps) => {
  const getPortalUrl = () => {
    if (typeof window !== "undefined") {
      const port = window.location.port ? `:${window.location.port}` : "";
      if (cleanHost.includes("localhost")) {
        return `http://localhost${port}`;
      }
      const baseDomain = window.location.hostname.replace("www.", "").split(".").slice(-2).join(".");
      return `${window.location.protocol}//${baseDomain}${port}`;
    }
    return "/";
  };

  const getAdminUrl = () => {
    if (process.env.NEXT_PUBLIC_ADMIN_URL) {
      return process.env.NEXT_PUBLIC_ADMIN_URL;
    }
    if (cleanHost.includes("localhost") || cleanHost.includes("127.0.0.1")) {
      return "http://localhost:3001";
    }
    const baseDomain = typeof window !== "undefined"
      ? window.location.hostname.split(".").slice(-2).join(".")
      : "prefyn.com";
    return `https://admin.${baseDomain}`;
  };

  const portalUrl = getPortalUrl();
  const adminUrl = getAdminUrl();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-rose-600 selection:text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-6 relative z-10">
        <div className="max-w-md w-full bg-white border border-slate-200/85 rounded-3xl p-8 text-center shadow-xl shadow-rose-950/5">
          
          {/* Animated Warning Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-8 text-rose-600"
          >
            <AlertTriangle className="w-8 h-8" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3"
          >
            Storefront Not Found
          </motion.h1>

          {/* Subtitle / Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-4 mb-8"
          >
            <p className="text-slate-600 text-sm leading-relaxed">
              The storefront domain you requested <code className="px-2 py-0.5 rounded bg-slate-100 text-rose-600 border border-slate-200/50 font-mono text-xs">{cleanHost}</code> is not registered on our platform or is currently inactive.
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              If you recently updated DNS settings, custom domains may take up to 24 hours to propagate. If this is your brand, double-check your domain mapping in the Admin Panel.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-col gap-3"
          >
            <a
              href={adminUrl}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 group hover:scale-[1.01]"
            >
              <Store className="w-4 h-4" />
              Create/Manage Your Store
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href={portalUrl}
              className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-sm transition-all duration-200 border border-slate-200/80 flex items-center justify-center gap-2"
            >
              <CornerDownLeft className="w-4 h-4" />
              Go to Platform Home
            </a>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-slate-200 bg-white relative z-10">
        <p className="text-slate-500 text-xs">
          Need assistance? Contact our technical team at <a href="mailto:support@epxweb.com" className="text-blue-600 hover:underline">support@epxweb.com</a>
        </p>
      </footer>
    </div>
  );
};
