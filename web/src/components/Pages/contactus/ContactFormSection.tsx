"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Script from "next/script";

declare global {
  interface Window {
    grecaptcha: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

interface ContactFormSectionProps {
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    image?: string;
  };
}

export function ContactFormSection({ data }: ContactFormSectionProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    query: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      let recaptchaToken = "";

      // Get reCAPTCHA token if loaded
      if (recaptchaLoaded && window.grecaptcha) {
        try {
          recaptchaToken = await window.grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
            { action: "contact_form" }
          );
        } catch (error) {
          console.error("reCAPTCHA execution error:", error);
        }
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/communication/inquiry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "contact_us",
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone,
            subject: "Contact Form Message",
            message: formData.query,
            // storeId will be handled by the backend middleware if not provided
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message:
            data.message ||
            "Thank you for contacting us! We will get back to you soon.",
        });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          query: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message:
            data.message || "Failed to submit inquiry. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "An error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data?.show && data?.show !== undefined) return null;

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        onLoad={() => setRecaptchaLoaded(true)}
        strategy="lazyOnload"
      />
      <section className="w-full">
        <div className="container-xl px-4 sm:px-6 md:px-8 lg:px-10 mx-auto">
          {/* Header Section */}
          <div className="py-12 text-center">
            <h2 className="text-4xl font-semibold text-slate-800 sm:text-5xl">
              {data?.title || (
                <>
                  Our <span className="text-[#004DAA]">address</span> & Get in
                  touch <span className="text-[#004DAA]">with us</span>
                </>
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-5xl text-lg text-slate-600">
              {data?.subtitle ||
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry."}
            </p>
          </div>

          {/* Main Content Grid (Form & Image) */}
          <div className="grid grid-cols-1 items-start  lg:grid-cols-[70%_30%]">
            {/* Left Column: The Form */}
            <form className="space-y-10" onSubmit={handleSubmit}>
              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="font-semibold text-slate-700"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder=""
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-none border-0 border-b border-slate-300 bg-transparent px-0 text-lg focus:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="font-semibold text-slate-700"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder=""
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-none border-0 border-b border-slate-300 bg-transparent px-0 text-lg focus:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="font-semibold text-slate-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder=""
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-none border-0 border-b border-slate-300 bg-transparent px-0 text-lg focus:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="font-semibold text-slate-700"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 012 3456 789"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-none border-0 border-b border-slate-300 bg-transparent px-0 text-lg focus:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              {/* Query Textarea */}
              <div className="space-y-2">
                <Label htmlFor="query" className="font-semibold text-slate-700">
                  Your Query
                </Label>
                <Textarea
                  id="query"
                  placeholder="Please describe your inquiry..."
                  value={formData.query}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="rounded-md border border-slate-300 bg-transparent px-4 py-3 text-lg focus:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {/* Status Message */}
              {submitStatus && (
                <div
                  className={`p-4 rounded-md ${
                    submitStatus.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  variant="BlueDark"
                  size="xl"
                  className="w-[50%]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Contact Us"}
                </Button>
              </div>
            </form>

            {/* Right Column: Image */}
            <div className="hidden lg:block p-8">
              <Image
                src={data?.image || "/images/pages/homepage/contactimage.png"}
                alt="Customer service representative on a call"
                width={200}
                height={250}
                quality={100}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
