"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Lock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LayoutDashboard,
  LogIn,
  ShoppingCart,
  CreditCard,
  Image as ImageIcon,
  Globe2,
  Settings
} from "lucide-react";

const DEMO_STEPS = [
  {
    id: "login",
    title: "Admin Login",
    url: "https://admins.prefyn.com/login",
    video: "/videos/admins.prefyn_login.webm",
    icon: <LogIn className="w-5 h-5" />,
    description: "Secure, multi-tenant authentication for your team."
  },
  {
    id: "dashboard",
    title: "Insightful Dashboard",
    url: "https://admins.prefyn.com/dashboard",
    video: "/videos/dash.webm",
    icon: <LayoutDashboard className="w-5 h-5" />,
    description: "Get a bird's-eye view of your store's performance."
  },
  {
    id: "orders",
    title: "Order Management",
    url: "https://admins.prefyn.com/orders",
    video: "/videos/orderpage.webm",
    icon: <ShoppingCart className="w-5 h-5" />,
    description: "Track and fulfill orders with precision."
  },
  {
    id: "payments",
    title: "Payments",
    url: "https://admins.prefyn.com/payments",
    video: "/videos/payment.webm",
    icon: <CreditCard className="w-5 h-5" />,
    description: "Manage transactions and payouts seamlessly."
  },
  {
    id: "media",
    title: "Media Library",
    url: "https://admins.prefyn.com/media",
    video: "/videos/media.webm",
    icon: <ImageIcon className="w-5 h-5" />,
    description: "Organize products and marketing assets effortlessly."
  },
  {
    id: "domain",
    title: "Domain Controls",
    url: "https://admins.prefyn.com/domain-management",
    video: "/videos/domain.webm",
    icon: <Globe2 className="w-5 h-5" />,
    description: "Connect your custom brand domain in seconds."
  },
  {
    id: "subscription",
    title: "Subscription",
    url: "https://admins.prefyn.com/manage-subscription",
    video: "/videos/sub.webm",
    icon: <Settings className="w-5 h-5" />,
    description: "Flexible plans tailored to your growth."
  }
];

export default function LiveDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = DEMO_STEPS[activeIndex];
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play next video when one ends
  const handleVideoEnd = () => {
    setActiveIndex((prev) => (prev + 1) % DEMO_STEPS.length);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Auto-play blocked", e));
    }
  }, [activeIndex]);

  return (
    <section className="py-12 md:py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight"
          >
            Experience the Platform <span className="text-[#6c3aed]">Live</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Take a deep dive into the features that power thousands of online stores.
            See how EPxWEB simplifies every aspect of e-commerce.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Mobile Tabs Navigation - Only Icons */}
          <div className="lg:hidden flex items-center justify-between gap-2 pb-6 mb-2 px-1">
            {DEMO_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveIndex(index)}
                className={`flex-1 flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${activeIndex === index
                  ? "bg-[#6c3aed] text-white shadow-lg shadow-purple-100 scale-110"
                  : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200"
                  }`}
              >
                {React.cloneElement(step.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
              </button>
            ))}
          </div>

          {/* Navigation Sidebar - Hidden on mobile */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-2">
            {DEMO_STEPS.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveIndex(index)}
                className={`w-full flex items-center gap-4 p-3 transition-all duration-300 text-left group border-b border-transparent ${activeIndex === index
                  ? "text-[#6c3aed]"
                  : "text-gray-500 hover:text-gray-900"
                  }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${activeIndex === index ? "text-[#6c3aed]" : "text-gray-400 group-hover:text-gray-600"
                  }`}>
                  {step.icon}
                </div>
                <div className="relative">
                  <h3 className={`font-semibold text-sm transition-colors`}>
                    {step.title}
                  </h3>
                  {activeIndex === index && (
                    <motion.div
                      layoutId="activeUnderline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#6c3aed] rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Browser Mockup */}
          <div className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
            >
              {/* Browser Header */}
              <div className="bg-[#f8f9fb] border-b border-gray-200 p-3 md:p-4 flex items-center gap-2 md:gap-4">
                <div className="flex gap-1.5 px-1 md:px-2">
                  <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-[#27c93f]" />
                </div>

                <div className="hidden sm:flex gap-2 text-gray-400 px-2 md:px-4">
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 cursor-not-allowed opacity-50" />
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 cursor-not-allowed opacity-50" />
                  <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5" />
                </div>

                <div className="hidden sm:flex flex-1 bg-white border border-gray-200 rounded-full px-3 md:px-4 py-1 md:py-1.5 items-center justify-center gap-1.5 md:gap-2 group transition-shadow hover:shadow-sm">
                  <Lock className="w-3 md:w-3.5 h-3 md:h-3.5 text-green-500" />
                  <span className="text-[10px] md:text-sm text-gray-600 font-medium truncate max-w-[120px] md:max-w-none">
                    {activeStep.url}
                  </span>
                </div>

                <div className="hidden sm:block px-2 md:px-4">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-gray-200" />
                </div>
              </div>

              {/* Video Player */}
              <div className="relative overflow-hidden ring-1 ring-black/5 bg-white">
                <AnimatePresence mode="wait">
                  <motion.video
                    key={activeStep.id}
                    ref={videoRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    onEnded={handleVideoEnd}
                    className="w-full h-auto block"
                    muted
                    playsInline
                    autoPlay
                  >
                    <source src={activeStep.video} type="video/webm" />
                    Your browser does not support the video tag.
                  </motion.video>
                </AnimatePresence>

                {/* Progress bar overlay */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                  <motion.div
                    key={activeIndex}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 10, // Assuming static duration or link to video length
                      ease: "linear",
                    }}
                    className="h-full bg-[#6c3aed]"
                  />
                </div>
              </div>
            </motion.div>


          </div>
        </div>
      </div>
    </section>
  );
}
