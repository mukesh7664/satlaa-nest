"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react'; // Wait, I use lucide-react
import { Check as CheckIcon, Zap } from 'lucide-react';
import Link from 'next/link';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  choosePlanText?: string;
  bestValueText?: string;
}

interface SportPricingProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    plans?: Plan[];
  };
}

const SportPricing: React.FC<SportPricingProps> = ({ data, sectionIndex }) => {
  const plans = data.plans || [];

  if (!plans || plans.length === 0) return null;

  return (
    <section className="py-24 bg-[#f5f6ff]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[#6c3aed] font-black uppercase tracking-widest text-xs mb-4 block">
            <InlineEditable tag="span" value={data.badge || ""} fieldPath="badge" sectionIndex={sectionIndex} />
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-[#101010] tracking-tighter">
            <InlineEditable tag="span" value={data.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-10 rounded-[3rem] ${plan.isPopular ? 'bg-[#101010] text-white shadow-2xl' : 'bg-white text-[#101010]'} transition-transform duration-500 hover:-translate-y-4`}
            >
              {plan.isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 py-2 px-6 bg-[#f4fb30] text-black text-xs font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
                  <Zap className="w-3 h-3 fill-black" /> <InlineEditable tag="span" value={plan.bestValueText || "Best Value"} fieldPath={`plans.${idx}.bestValueText`} sectionIndex={sectionIndex} />
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-2xl font-black mb-4 ${plan.isPopular ? 'text-[#f4fb30]' : 'text-[#6c3aed]'}`}>
                  <InlineEditable tag="span" value={plan.name || ""} fieldPath={`plans.${idx}.name`} sectionIndex={sectionIndex} />
                </h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-5xl font-black"><InlineEditable tag="span" value={plan.price || ""} fieldPath={`plans.${idx}.price`} sectionIndex={sectionIndex} /></span>
                  <span className="text-lg opacity-60 font-bold mb-1"><InlineEditable tag="span" value={plan.period || ""} fieldPath={`plans.${idx}.period`} sectionIndex={sectionIndex} /></span>
                </div>
                <p className={`font-medium opacity-70 leading-relaxed`}>
                  <InlineEditable tag="span" value={plan.description || ""} fieldPath={`plans.${idx}.description`} sectionIndex={sectionIndex} />
                </p>
              </div>

              <div className={`w-full h-px mb-8 ${plan.isPopular ? 'bg-white/10' : 'bg-black/5'}`} />

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3">
                    <CheckIcon className={`w-5 h-5 ${plan.isPopular ? 'text-[#f4fb30]' : 'text-[#6c3aed]'}`} />
                    <span className="font-bold"><InlineEditable tag="span" value={feature || ""} fieldPath={`plans.${idx}.features.${fIdx}`} sectionIndex={sectionIndex} /></span>
                  </li>
                ))}
              </ul>

              <Link 
                href="#"
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-tighter text-lg transition-all duration-300 ${plan.isPopular ? 'bg-[#f4fb30] text-black hover:bg-white' : 'bg-[#101010] text-white hover:bg-[#6c3aed]'}`}
              >
                <InlineEditable tag="span" value={plan.choosePlanText || "Choose Plan"} fieldPath={`plans.${idx}.choosePlanText`} sectionIndex={sectionIndex} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportPricing;
