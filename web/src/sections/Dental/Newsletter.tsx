"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, CheckCircle2, Star, Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  designation: string;
  rating: number;
  avatar: string;
}

interface DentalNewsletterProps {
  sectionIndex?: number;
  data: {
    title?: string;
    description?: string;
    placeholder?: string;
    buttonText?: string;
    testimonials?: Testimonial[];
  };
}

export default function DentalNewsletter({ data, sectionIndex }: DentalNewsletterProps) {
  const {
    title = "",
    description = "",
    placeholder = "",
    buttonText = "",
    testimonials = []
  } = data || {};

  if (!title) return null;

  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !acceptTerms) return;
    setSuccess(true);
    setEmail("");
  };

  const testimonialItem = testimonials[activeTestimonial] || testimonials[0];

  return (
    <section className="py-20 bg-white border-t border-slate-100 font-sans">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[50px] items-center">
          
          {/* Left Column: Join Our Newsletter */}
          <div className="flex flex-col">
            <span className="block text-xs font-extrabold tracking-[0.2em] text-[#4c80fa] uppercase mb-3">
              STAY UPDATED
            </span>
            <h3 
              className="text-3xl font-medium text-[#222222] tracking-tight mb-4"
              style={{ fontFamily: '"Plus Jakarta Sans", "Montserrat", sans-serif' }}
            >
              <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
            </p>

            {/* StepMeds Elegant Newsletter Form */}
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row gap-3 w-full bg-[#ebf1ff] p-1.5 rounded-[30px] border border-slate-100">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={placeholder}
                      className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 font-semibold text-sm px-6 py-3.5 focus:outline-none"
                      required
                    />
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 bg-[#4c80fa] hover:bg-blue-600 text-white font-bold text-xs tracking-wider uppercase px-8 py-4 rounded-[30px] shadow-md hover:shadow-blue-500/20 transition-all cursor-pointer shrink-0"
                    >
                      <InlineEditable tag="span" value={buttonText || ""} fieldPath="buttonText" sectionIndex={sectionIndex} />
                      <Send size={12} />
                    </button>
                  </div>

                  {/* Terms check box */}
                  <label className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer select-none pl-4">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="rounded border-slate-300 text-[#4c80fa] focus:ring-[#4c80fa] w-4 h-4 cursor-pointer"
                    />
                    <span>Accept Terms & Conditions and Privacy Policy.</span>
                  </label>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 bg-teal-50 border border-teal-200 rounded-2xl p-6"
                >
                  <CheckCircle2 size={32} className="text-teal-500 shrink-0" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Subscriber Added!</h5>
                    <p className="text-xs text-slate-400 mt-1">Thank you. The clinical bulk pricing guides are on their way.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Split Testimonial Slides with Divider */}
          <div className="lg:border-l lg:border-slate-100 lg:pl-[50px] flex flex-col pt-10 lg:pt-0">
            {testimonialItem && (
              <div className="relative w-full">
                
                {/* Dynamic star ratings list */}
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={
                        i < testimonialItem.rating
                          ? "fill-[#f9c80e] stroke-[#f9c80e]"
                          : "stroke-slate-200"
                      }
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-400 ml-2">
                    ({testimonialItem.rating}.0)
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 font-medium italic">
                  "{testimonialItem.quote}"
                </p>

                {/* Doctor Avatar Profile */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="relative shrink-0 w-14 h-14 rounded-full overflow-hidden border border-slate-100 shadow-sm">
                      <InlineImageEditable
                      src={testimonialItem.avatar}
                      alt={testimonialItem.author}
                      fill
                      fieldPath={`testimonials.${activeTestimonial}.avatar`}
                      sectionIndex={sectionIndex}
                      className="w-full h-full object-cover"
                    />
                  </div>
                    {/* Speech bubble overlap badge */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#4c80fa] rounded-full flex items-center justify-center border border-white">
                      <Quote size={10} className="text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#222222] text-sm tracking-wide uppercase leading-tight">
                      {testimonialItem.author}
                    </h4>
                    <p className="text-[10px] text-[#4c80fa] font-extrabold tracking-widest uppercase mt-1">
                      {testimonialItem.designation}
                    </p>
                  </div>
                </div>

                {/* Bullets navigation for testimonial list */}
                {testimonials.length > 1 && (
                  <div className="flex gap-2 mt-6">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestimonial(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          activeTestimonial === idx ? "bg-[#4c80fa] w-6" : "bg-slate-200 hover:bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
