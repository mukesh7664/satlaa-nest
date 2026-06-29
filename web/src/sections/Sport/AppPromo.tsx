"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Apple, PlayCircle, QrCode, Zap } from 'lucide-react';
import Link from 'next/link';
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface SportAppPromoProps {
  sectionIndex?: number;
  data: {
    title?: string;
    content?: string;
    image?: string;
    qrCodeText?: string;
    downloadOnText?: string;
    appStoreText?: string;
    getItOnText?: string;
    googlePlayText?: string;
    notificationTitle?: string;
    notificationSubtitle?: string;
  };
}

const SportAppPromo: React.FC<SportAppPromoProps> = ({ data, sectionIndex }) => {
  if (!data?.title) return null;

  return (
    <section className="py-24 bg-[#101010] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="bg-[#6c3aed] rounded-[4rem] p-12 lg:p-24 relative overflow-hidden flex flex-col lg:flex-row items-center gap-16">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.05] rounded-full -mr-32 -mt-32" />
          
          {/* Left Side: Content */}
          <div className="lg:w-3/5 relative z-10 text-center lg:text-left">
            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 leading-[1] tracking-tighter">
              <InlineEditable tag="span" value={data.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            </h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl font-medium">
              <InlineEditable tag="span" value={data.content || ""} fieldPath="content" sectionIndex={sectionIndex} />
            </p>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-12">
              <Link 
                href="#"
                className="flex items-center gap-4 bg-black text-white px-8 py-4 rounded-2xl hover:bg-[#f4fb30] hover:text-black transition-all duration-300"
              >
                <Apple className="w-8 h-8" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold opacity-60">
                    <InlineEditable tag="span" value={data.downloadOnText || "Download on"} fieldPath="downloadOnText" sectionIndex={sectionIndex} />
                  </div>
                  <div className="text-lg font-black tracking-tight leading-none">
                    <InlineEditable tag="span" value={data.appStoreText || "App Store"} fieldPath="appStoreText" sectionIndex={sectionIndex} />
                  </div>
                </div>
              </Link>
              
              <Link 
                href="#"
                className="flex items-center gap-4 bg-black text-white px-8 py-4 rounded-2xl hover:bg-[#f4fb30] hover:text-black transition-all duration-300"
              >
                <PlayCircle className="w-8 h-8" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold opacity-60">
                    <InlineEditable tag="span" value={data.getItOnText || "Get it on"} fieldPath="getItOnText" sectionIndex={sectionIndex} />
                  </div>
                  <div className="text-lg font-black tracking-tight leading-none">
                    <InlineEditable tag="span" value={data.googlePlayText || "Google Play"} fieldPath="googlePlayText" sectionIndex={sectionIndex} />
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="p-3 bg-white rounded-2xl">
                    <QrCode className="w-12 h-12 text-black" />
                </div>
                <p className="text-white font-bold opacity-80 max-w-[180px] leading-tight">
                    <InlineEditable tag="span" value={data.qrCodeText || ""} fieldPath="qrCodeText" sectionIndex={sectionIndex} />
                </p>
            </div>
          </div>

          {/* Right Side: Phone mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: 10, y: 100 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="lg:w-2/5 relative z-10"
          >
            <div className="relative mx-auto w-[280px] h-[580px] border-[8px] border-black rounded-[3rem] bg-black shadow-2xl overflow-hidden">
                <InlineImageEditable 
                    src={data.image || ""} 
                    alt="App Preview" 
                    fill
                    fieldPath="image"
                    sectionIndex={sectionIndex}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl" />
            </div>
            
            {/* Floaing notification */}
            <div className="absolute top-1/4 -right-12 hidden md:block bg-white p-4 rounded-2xl shadow-xl max-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#f4fb30] flex items-center justify-center">
                        <Zap className="w-4 h-4 text-black" />
                    </div>
                    <div className="text-xs font-black text-black">
                        <InlineEditable tag="span" value={data.notificationTitle || "Booking Confirmed!"} fieldPath="notificationTitle" sectionIndex={sectionIndex} />
                    </div>
                </div>
                <div className="text-[10px] font-bold text-gray-400">
                    <InlineEditable tag="span" value={data.notificationSubtitle || "Court 02, Tomorrow 7:00 PM"} fieldPath="notificationSubtitle" sectionIndex={sectionIndex} />
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SportAppPromo;
