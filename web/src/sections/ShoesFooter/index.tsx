"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState } from "react";
import { 
  Phone, 
  Mail, 
  Clock, 
  ArrowRight,
  Facebook,
  Instagram,
  Youtube,
  Chrome
} from "lucide-react";
import { toast } from "sonner";

interface LinkItem {
  name: string;
  link: string;
}

interface ShoesFooterProps {
  sectionIndex?: number;
  data?: {
    description?: string;
    hotline?: string;
    email?: string;
    workingHours?: string;
    helpTitle?: string;
    helpLinks?: LinkItem[];
    companyTitle?: string;
    companyLinks?: LinkItem[];
    newsletterTitle?: string;
    newsletterPromo?: string;
    copyrightText?: string;
    legalLinks?: LinkItem[];
    logoType?: "text" | "image";
    logoText?: string;
    logoImage?: string;
    facebookLink?: string;
    instagramLink?: string;
    youtubeLink?: string;
    chromeLink?: string;
  };
}

export default function ShoesFooter({ data, sectionIndex }: ShoesFooterProps) {
  const [emailInput, setEmailInput] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    description = "Mate Sneaker supplies the absolute highest-fidelity performance footwear designed to bolster your agility and active street lifestyle.",
    hotline = "+0123 456 789",
    email = "info@example.com",
    workingHours = "Monday till Friday 10 to 6 EST",
    helpTitle = "GET HELP",
    helpLinks = [
      { name: "Help Center", link: "#" },
      { name: "Shipping Info", link: "#" },
      { name: "Returns", link: "#" },
      { name: "How To Order", link: "#" },
      { name: "How To Track", link: "#" },
      { name: "Size Guide", link: "#" }
    ],
    companyTitle = "OUR COMPANY",
    companyLinks = [
      { name: "About Us", link: "#" },
      { name: "Our Blog", link: "#" },
      { name: "Careers", link: "#" },
      { name: "Store Locations", link: "#" },
      { name: "Testimonial", link: "#" },
      { name: "Sitemap", link: "#" }
    ],
    newsletterTitle = "NEWSLETTER",
    newsletterPromo = "Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.",
    copyrightText = `© ${new Date().getFullYear()} MATE SHOES. ALL RIGHTS RESERVED.`,
    legalLinks = [
      { name: "PRIVACY POLICY", link: "#" },
      { name: "TERMS OF SERVICES", link: "#" }
    ],
    logoType = "text",
    logoText = "MATE",
    logoImage = "",
    facebookLink = "#",
    instagramLink = "#",
    youtubeLink = "#",
    chromeLink = "#"
  } = data || {};

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSuccess(true);
      toast.success("Subscribed successfully!");
      setEmailInput("");
    }
  };

  return (
    <footer className="w-full bg-black text-white pt-20 pb-12 font-sans select-none">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Main Footer Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Contact Details */}
          <div className="flex flex-col items-start text-left max-w-sm">
            {logoType === "image" ? (
              <div className="mb-6 h-10 flex items-center">
                <InlineImageEditable
                  src={logoImage || "https://placehold.co/150x40/000000/ffffff?text=Logo"}
                  alt={logoText || "Logo"}
                  fieldPath="logoImage"
                  sectionIndex={sectionIndex}
                  className="max-h-12 w-auto object-contain"
                />
              </div>
            ) : (
              <span className="text-2xl font-black text-white tracking-[0.2em] uppercase mb-6 font-sans block">
                <InlineEditable
                  tag="span"
                  value={logoText || "MATE"}
                  fieldPath="logoText"
                  sectionIndex={sectionIndex}
                />
              </span>
            )}

            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-8">
              <InlineEditable tag="span" value={description} fieldPath="description" sectionIndex={sectionIndex} />
            </p>

            <div className="flex flex-col gap-4 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#55eb0c] border border-white/10">
                  <Phone size={13} />
                </div>
                <span>
                  HOTLINE: <InlineEditable tag="span" value={hotline} fieldPath="hotline" sectionIndex={sectionIndex} />
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#55eb0c] border border-white/10">
                  <Mail size={13} />
                </div>
                <span>
                  <InlineEditable tag="span" value={email} fieldPath="email" sectionIndex={sectionIndex} />
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#55eb0c] border border-white/10">
                  <Clock size={13} />
                </div>
                <span>
                  <InlineEditable tag="span" value={workingHours} fieldPath="workingHours" sectionIndex={sectionIndex} />
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Help Links */}
          <div className="flex flex-col items-start text-left">
            <span className="text-[10px] font-black text-[#55eb0c] tracking-[0.25em] uppercase mb-6 font-sans block">
              <InlineEditable tag="span" value={helpTitle} fieldPath="helpTitle" sectionIndex={sectionIndex} />
            </span>
            <div className="grid grid-cols-1 gap-3.5 text-xs font-bold text-slate-400">
              {helpLinks.map((link, i) => (
                <a key={i} href={link.link} className="hover:text-white transition-colors duration-300">
                  <InlineEditable tag="span" value={link.name} fieldPath={`helpLinks.${i}.name`} sectionIndex={sectionIndex} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Company Links */}
          <div className="flex flex-col items-start text-left">
            <span className="text-[10px] font-black text-[#55eb0c] tracking-[0.25em] uppercase mb-6 font-sans block">
              <InlineEditable tag="span" value={companyTitle} fieldPath="companyTitle" sectionIndex={sectionIndex} />
            </span>
            <div className="grid grid-cols-1 gap-3.5 text-xs font-bold text-slate-400">
              {companyLinks.map((link, i) => (
                <a key={i} href={link.link} className="hover:text-white transition-colors duration-300">
                  <InlineEditable tag="span" value={link.name} fieldPath={`companyLinks.${i}.name`} sectionIndex={sectionIndex} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col items-start text-left max-w-sm">
            <span className="text-[10px] font-black text-[#55eb0c] tracking-[0.25em] uppercase mb-6 font-sans block">
              <InlineEditable tag="span" value={newsletterTitle} fieldPath="newsletterTitle" sectionIndex={sectionIndex} />
            </span>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6 block">
              <InlineEditable tag="span" value={newsletterPromo} fieldPath="newsletterPromo" sectionIndex={sectionIndex} />
            </p>

            {/* Rounded Pill Subscription Capsule */}
            {!success ? (
              <form onSubmit={handleSubscribeSubmit} className="w-full flex items-center bg-white/5 border border-white/10 rounded-[30px] p-1 mb-8">
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-xs font-bold text-white placeholder-slate-500 px-4 py-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-[#55eb0c] hover:bg-white hover:text-black text-black flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <ArrowRight size={14} className="stroke-[3px]" />
                </button>
              </form>
            ) : (
              <div className="text-xs font-black text-[#55eb0c] bg-white/5 border border-[#55eb0c]/20 px-4 py-2.5 rounded-full mb-8 uppercase tracking-widest text-center w-full">
                ✓ SUBSCRIBED SUCCESSFULLY!
              </div>
            )}

            {/* Social Icons Row */}
            <div className="flex items-center gap-3">
              <a href={facebookLink} className="w-8 h-8 rounded-full border border-white/10 hover:border-white text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                <Facebook size={14} />
              </a>
              <a href={instagramLink} className="w-8 h-8 rounded-full border border-white/10 hover:border-white text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                <Instagram size={14} />
              </a>
              <a href={youtubeLink} className="w-8 h-8 rounded-full border border-white/10 hover:border-white text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                <Youtube size={14} />
              </a>
              <a href={chromeLink} className="w-8 h-8 rounded-full border border-white/10 hover:border-white text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                <Chrome size={14} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-500 tracking-wider">
          <span>
            <InlineEditable tag="span" value={copyrightText} fieldPath="copyrightText" sectionIndex={sectionIndex} />
          </span>
          <div className="flex items-center gap-4">
            {legalLinks.map((link, i) => (
              <React.Fragment key={i}>
                <a href={link.link} className="hover:text-white transition-colors">
                  <InlineEditable tag="span" value={link.name} fieldPath={`legalLinks.${i}.name`} sectionIndex={sectionIndex} />
                </a>
                {i < legalLinks.length - 1 && <span>•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
