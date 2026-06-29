"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaPhoneAlt,
  FaRegEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaHeart,
} from "react-icons/fa";
import { FaLocationDot, FaTelegram } from "react-icons/fa6";
import Image from "next/image";
import { FooterSpotlight } from "./FooterSpotlight";
import { usePreview } from "@/contexts/PreviewContext";
import { InlineEditable } from "../InlineEditable";
import { InlineImageEditable } from "../InlineImageEditable";

// Types
interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  icon: string;
  url: string;
}

interface FooterSettings {
  logo?: { url?: string };
  tagline?: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  copyrightText: string;
  newsletterDescription?: string;
  certificates?: {
    url: string;
    alt?: string;
    publicId?: string;
    link?: string;
  }[];
}


// Default footer data as fallback
const defaultFooterData: FooterSettings = {
  contact: {
    phone: "+91-124-4549014",
    email: "info@EPxWEB.com",
    address: "204, Vipul Business Park, Sohna Rd, Sector 48, Gurugram, Haryana 122001, India",
  },
  columns: [
    {
      title: "Useful Links",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact Us" },
        { href: "/faq", label: "FAQs" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/privacy", label: "Privacy Policy" },
      ],
    },
    {
      title: "Careers",
      links: [
        { href: "/blog", label: "Blog" },
        { href: "/press", label: "Press" },
        { href: "/partnerships", label: "Partnerships" },
        { href: "/support", label: "Support" },
        { href: "/help", label: "Help Center" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "/events", label: "Events" },
        { href: "/community", label: "Community" },
        { href: "/social", label: "Social Media" },
        { href: "/newsletter", label: "Newsletter" },
        { href: "/subscribe", label: "Subscribe" },
      ],
    },
  ],
  socialLinks: [
    { icon: "facebook", url: "#" },
    { icon: "instagram", url: "#" },
    { icon: "linkedin", url: "#" },
    { icon: "youtube", url: "#" },
  ],
  copyrightText: "© 2024 Mingers. All rights reserved",
  tagline: "Empowering Companies to Digitally Transform.",
  newsletterDescription: "Join our community to receive updates",
  certificates: [],
};

// Social icon component
const SocialIcon = ({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) => {
  const iconProps = {
    className:
      className || "h-4 w-4 text-gray-300 hover:text-white transition-colors",
  };

  switch (icon) {
    case "facebook":
      return <FaFacebookF {...iconProps} />;
    case "twitter":
      return <FaTwitter {...iconProps} />;
    case "instagram":
      return <FaInstagram {...iconProps} />;
    case "linkedin":
      return <FaLinkedinIn {...iconProps} />;
    case "youtube":
      return <FaYoutube {...iconProps} />;
    case "telegram":
      return <FaTelegram {...iconProps} />;
    default:
      return <FaFacebookF {...iconProps} />;
  }
};

// Helper component for link columns
const LinkColumn = ({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) => (
  <div>
    <h3 className="font-semibold text-white mb-4">{title}</h3>
    <ul className="space-y-2 text-sm">
      {links.map((link, index) => (
        <li key={`${link.label}-${index}`}>
          <Link
            href={link.href}
            className="text-gray-300 hover:text-white transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export function Footer({ data: propData, sectionIndex }: { data?: any, sectionIndex?: number }) {
  const { footerSettings, isPreview } = usePreview();
  const [footerData, setFooterData] = useState<FooterSettings>(defaultFooterData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (propData) {
      setFooterData((prev) => ({
        ...prev,
        ...propData,
        contact: { ...(prev.contact || {}), ...(propData.contact || {}) },
        logo: propData.logo?.url ? propData.logo : (typeof propData.logo === 'string' ? { url: propData.logo } : prev.logo)
      }));
    }
  }, [propData]);

  useEffect(() => {
    if (isPreview && footerSettings) {
      setFooterData((prev) => ({
        ...prev,
        ...footerSettings,
        contact: { ...(prev.contact || {}), ...(footerSettings.contact || {}) },
        logo: footerSettings.logo?.url ? footerSettings.logo : (typeof footerSettings.logo === 'string' ? { url: footerSettings.logo } : prev.logo)
      }));
    }
  }, [isPreview, footerSettings]);

  if (loading && !isPreview) return null;

  const usefulLinks = footerData.columns?.[0] || { title: "Useful Links", links: [] };
  const careers = footerData.columns?.[1] || { title: "Careers", links: [] };
  const resources = footerData.columns?.[2] || { title: "Resources", links: [] };

  return (
    <footer className="bg-white text-slate-900 pt-16 pb-8 border-t border-slate-100">
      <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto">
        {/* Top Section: Link Columns & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-16">
          {/* Link Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-indigo-950">
                <InlineEditable tag="span" value={usefulLinks.title || ""} fieldPath="columns.0.title" sectionIndex={sectionIndex} />
              </h3>
              <ul className="space-y-3">
                {usefulLinks.links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-slate-500 hover:text-indigo-600 transition-colors text-[15px]">
                      <InlineEditable tag="span" value={link.label || ""} fieldPath={`columns.0.links.${i}.label`} sectionIndex={sectionIndex} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-indigo-950">
                <InlineEditable tag="span" value={careers.title || ""} fieldPath="columns.1.title" sectionIndex={sectionIndex} />
              </h3>
              <ul className="space-y-3">
                {careers.links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-slate-500 hover:text-indigo-600 transition-colors text-[15px]">
                      <InlineEditable tag="span" value={link.label || ""} fieldPath={`columns.1.links.${i}.label`} sectionIndex={sectionIndex} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-indigo-950">
                <InlineEditable tag="span" value={resources.title || ""} fieldPath="columns.2.title" sectionIndex={sectionIndex} />
              </h3>
              <ul className="space-y-3">
                {resources.links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-slate-500 hover:text-indigo-600 transition-colors text-[15px]">
                      <InlineEditable tag="span" value={link.label || ""} fieldPath={`columns.2.links.${i}.label`} sectionIndex={sectionIndex} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-bold text-lg text-indigo-950">Subscribe</h3>
            <p className="text-slate-600 text-[15px]">
              <InlineEditable tag="span" value={footerData.newsletterDescription || "Join our community to receive updates"} fieldPath="newsletterDescription" sectionIndex={sectionIndex} />
            </p>
            <div className="flex items-center gap-2 max-w-sm">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-blue-50 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-blue-200 outline-none placeholder:text-slate-400"
                />
              </div>
              <button className="bg-blue-600 text-white rounded-full px-8 py-3 text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-slate-400 pt-2">
              By subscribing, you agree to our Privacy Policy
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 mb-8"></div>

        {/* Middle Section: Logo and Socials */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <Link href="/" className="transition-opacity hover:opacity-80">
            {footerData.logo?.url ? (
              <InlineImageEditable
                src={footerData.logo.url}
                alt="Logo"
                width={140}
                height={40}
                fieldPath="logo.url"
                sectionIndex={sectionIndex}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="text-3xl font-bold text-indigo-950">Mingers.</span>
            )}
          </Link>

          <div className="flex items-center gap-4">
            {footerData.socialLinks.map((social, i) => (
              <Link
                key={i}
                href={social.url}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-indigo-950 hover:bg-indigo-600 hover:text-white transition-all border border-slate-100"
              >
                <SocialIcon icon={social.icon} className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        {/* Final Divider */}
        <div className="border-t border-slate-100 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <Link href="/privacy" className="text-[13px] text-slate-500 hover:text-indigo-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[13px] text-slate-500 hover:text-indigo-600 transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="text-[13px] text-slate-500 hover:text-indigo-600 transition-colors">Cookie Policy</Link>
            </div>
            <p className="text-[13px] text-slate-400">
              <InlineEditable tag="span" value={footerData.copyrightText || `© ${new Date().getFullYear()} Mingers. All rights reserved`} fieldPath="copyrightText" sectionIndex={sectionIndex} />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
