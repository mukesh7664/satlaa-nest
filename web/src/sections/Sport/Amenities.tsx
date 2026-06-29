"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, ShieldCheck, Users, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Amenity {
  title: string;
  description: string;
  icon: any;
}

interface SportAmenitiesProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    amenities?: { title: string; description: string; iconName: string }[];
    viewAllServicesText?: string;
  };
}

const iconMap: any = {
  Trophy: Trophy,
  ShieldCheck: ShieldCheck,
  Users: Users,
  ShoppingBag: ShoppingBag,
};

const SportAmenities: React.FC<SportAmenitiesProps> = ({ data, sectionIndex }) => {

  const displayAmenities = data.amenities || [];

  return (
    <section className="py-24 bg-[#101010] relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f4fb30] opacity-[0.03] rounded-full blur-[100px] -mr-64 -mt-64" />
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-[#f4fb30] font-black uppercase tracking-widest text-xs mb-4 block">
              <InlineEditable tag="span" value={data.badge || ""} fieldPath="badge" sectionIndex={sectionIndex} />
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter">
              <InlineEditable tag="span" value={data.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            </h2>
          </div>
          <Link href="#" className="group flex items-center gap-2 text-white font-bold hover:text-[#f4fb30] transition-colors">
            <InlineEditable tag="span" value={data.viewAllServicesText || "View All Services"} fieldPath="viewAllServicesText" sectionIndex={sectionIndex} /> <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayAmenities.map((item: any, idx: number) => {
            const Icon = iconMap[item.iconName] || Trophy;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group p-10 bg-white/5 border border-white/10 hover:bg-[#f4fb30] transition-all duration-500 rounded-3xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#f4fb30] group-hover:bg-black flex items-center justify-center mb-8 transition-colors duration-500">
                  <Icon className="w-8 h-8 text-black group-hover:text-[#f4fb30] transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-black text-white group-hover:text-black mb-4 transition-colors duration-500">
                  <InlineEditable tag="span" value={item.title || ""} fieldPath={`amenities.${idx}.title`} sectionIndex={sectionIndex} />
                </h3>
                <p className="text-gray-400 group-hover:text-black/70 transition-colors duration-500 font-medium">
                  <InlineEditable tag="span" value={item.description || ""} fieldPath={`amenities.${idx}.description`} sectionIndex={sectionIndex} />
                </p>
                
                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-black" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SportAmenities;
