"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { InlineEditable } from "@/components/InlineEditable";

interface Stat {
  value: string;
  label: string;
}

interface SportStatsProps {
  sectionIndex?: number;
  data: {
    stats?: Stat[];
  };
}

const SportStats: React.FC<SportStatsProps> = ({ data, sectionIndex }) => {

  const stats = data.stats || [];

  return (
    <section className="py-20 bg-[#6c3aed]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-5xl md:text-7xl font-black text-[#f4fb30] mb-4 tracking-tighter">
                <InlineEditable tag="span" value={stat.value || ""} fieldPath={`stats.${idx}.value`} sectionIndex={sectionIndex} />
              </div>
              <div className="text-white/80 font-bold uppercase tracking-[0.2em] text-xs md:text-sm">
                <InlineEditable tag="span" value={stat.label || ""} fieldPath={`stats.${idx}.label`} sectionIndex={sectionIndex} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportStats;
