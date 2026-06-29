import { AddressSection } from "@/components/Pages/contactus/AddressSection";
import { ContactFormSection } from "@/components/Pages/contactus/ContactFormSection";
import React from "react";
import type { Metadata } from "next";
import { getGlobalSEO, generatePageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

async function getContactUsSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/homepage/contact-us`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch Contact Us settings");
      return null;
    }

    const json = await res.json();
    // API returns { success: true, data: settings }
    return json?.data || null;
  } catch (error) {
    console.error("Error fetching Contact Us settings:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getContactUsSettings();
  const seoData = await getGlobalSEO();

  return generatePageMetadata(
    settings?.metaTitle || "Contact Us",
    settings?.metaDescription,
    settings?.metaKeywords,
    settings?.metaImage,
    seoData.seo
  );
}

const contactus = async () => {
  const settings = await getContactUsSettings();

  // Provide fallback data so sections always render even if no DB record exists
  const contactFormData = settings?.contactFormSection || { show: true };
  const addressData = settings?.addressSection || { show: true };

  return (
    <div>
      <ContactFormSection data={contactFormData} />

      <AddressSection data={addressData} />

      {/* <FaqSection/> */}
    </div>
  );
};

export default contactus;
