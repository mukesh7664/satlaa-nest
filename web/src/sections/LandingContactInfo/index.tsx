"use client";

import React from "react";
import { InlineEditable } from "@/components/InlineEditable";
import { MapPin, Mail, Phone, Clock, Send } from "lucide-react";

interface LandingContactInfoProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    subtitle?: string;
    address?: string;
    email?: string;
    phone?: string;
    hours?: string;
    bgColor?: string;
    textColor?: string;
    showSocials?: boolean;
    formTitle?: string;
  };
}

export default function LandingContactInfo({ data, sectionIndex }: LandingContactInfoProps) {
  const {
    badge = "GET IN TOUCH",
    title = "We'd Love to Hear From You",
    subtitle = "Have questions? Reach out directly and our team will assist you.",
    address = "123 Business Road, Suite 100, Silicon Valley, CA",
    email = "contact@prefyn.com",
    phone = "+1 (555) 019-2834",
    hours = "Mon - Fri: 9:00 AM - 6:00 PM EST",
    bgColor = "#f8fafc",
    textColor = "#0f172a",
    showSocials = true,
    formTitle = "Send Us a Message",
  } = data || {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("This is a demo contact form representation.");
  };

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-6">
            {badge && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-blue-50 text-blue-600 mb-6 border border-blue-100">
                <InlineEditable tag="span" value={badge} fieldPath="badge" sectionIndex={sectionIndex} />
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              <InlineEditable tag="span" value={title} fieldPath="title" sectionIndex={sectionIndex} />
            </h2>
            {subtitle && (
              <p className="text-base sm:text-lg opacity-80 mb-10 leading-relaxed">
                <InlineEditable tag="span" value={subtitle} fieldPath="subtitle" sectionIndex={sectionIndex} />
              </p>
            )}

            <div className="space-y-6">
              {address && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-white border border-slate-100 text-blue-600 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold opacity-70 mb-1">Our Location</h4>
                    <p className="text-base font-medium">
                      <InlineEditable tag="span" value={address} fieldPath="address" sectionIndex={sectionIndex} />
                    </p>
                  </div>
                </div>
              )}

              {email && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-white border border-slate-100 text-blue-600 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold opacity-70 mb-1">Email Address</h4>
                    <p className="text-base font-medium">
                      <InlineEditable tag="span" value={email} fieldPath="email" sectionIndex={sectionIndex} />
                    </p>
                  </div>
                </div>
              )}

              {phone && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-white border border-slate-100 text-blue-600 shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold opacity-70 mb-1">Phone Number</h4>
                    <p className="text-base font-medium">
                      <InlineEditable tag="span" value={phone} fieldPath="phone" sectionIndex={sectionIndex} />
                    </p>
                  </div>
                </div>
              )}

              {hours && (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-white border border-slate-100 text-blue-600 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold opacity-70 mb-1">Working Hours</h4>
                    <p className="text-base font-medium">
                      <InlineEditable tag="span" value={hours} fieldPath="hours" sectionIndex={sectionIndex} />
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Card Column */}
          <div className="lg:col-span-6 w-full">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100/50 text-slate-900">
              <h3 className="text-2xl font-bold mb-6">
                <InlineEditable tag="span" value={formTitle} fieldPath="formTitle" sectionIndex={sectionIndex} />
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">First Name</label>
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Message</label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  <span>Submit Form</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
