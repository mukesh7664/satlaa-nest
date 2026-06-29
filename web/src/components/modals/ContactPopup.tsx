"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const companyLogos = [
  {
    src: "/images/pages/companies/acc.png",
    alt: "Brand Logo",
    width: 100,
    height: 40,
  },
  {
    src: "/images/pages/companies/adobe.png",
    alt: "Bulb Icon",
    width: 100,
    height: 40,
  },
  {
    src: "/images/pages/companies/amazon.png",
    alt: "Database Icon",
    width: 60,
    height: 40,
  },
  {
    src: "/images/pages/companies/dell.png",
    alt: "Factory Icon",
    width: 110,
    height: 40,
  },
  {
    src: "/images/pages/companies/lenskart.png",
    alt: "Mail Icon",
    width: 100,
    height: 40,
  },
  {
    src: "/images/pages/companies/microsoft.jpg",
    alt: "Management Icon",
    width: 90,
    height: 40,
  },
  {
    src: "/images/pages/companies/amazon.jpg",
    alt: "Motherboard Icon",
    width: 100,
    height: 40,
  },
];

interface PopupSettings {
  isEnabled: boolean;
  image: {
    url: string;
    publicId?: string;
  };
  title: string;
  subtitle?: string;
  triggerTime: number;
  frequencyDays: number;
  showOnMobile: boolean;
}

export function ContactPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PopupSettings | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkAndSchedulePopup = (config: PopupSettings) => {
      // Check if mobile and if allowed
      const isMobile = window.innerWidth < 768;
      if (isMobile && !config.showOnMobile) return;

      // Check frequency
      const lastShown = localStorage.getItem("contactPopupLastShown");
      if (lastShown) {
        const lastShownDate = new Date(parseInt(lastShown));
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastShownDate.getTime());
        const daysInMs = 1000 * 60 * 60 * 24;

        // Check if enough time has passed based on frequencyDays
        if (diffTime < config.frequencyDays * daysInMs) {
          return; // Too soon
        }
      }

      // Schedule popup
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, config.triggerTime * 1000);

      return () => clearTimeout(timer);
    };

    const fetchSettings = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
        const response = await axios.get<{ popupSettings: PopupSettings }>(
          `${API_URL}/settings/public`
        );
        const popupSettings = response.data.popupSettings;

        if (popupSettings && popupSettings.isEnabled) {
          setSettings(popupSettings);
          checkAndSchedulePopup(popupSettings);
        }
      } catch (error) {
        console.error("Failed to fetch popup settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("contactPopupLastShown", Date.now().toString());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

      await axios.post(`${API_URL}/communication/inquiry`, {
        type: "contact_us",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: "Callback Request",
        message: "Requesting callback from popup banner",
        metadata: { source: "popup_banner" },
      });

      toast.success("Request submitted successfully!");
      handleClose();
    } catch (error: unknown) {
      console.error("Submission failed:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to submit request. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !settings || !settings.isEnabled) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none sm:rounded-2xl gap-0">
        <DialogTitle className="sr-only">{settings.title}</DialogTitle>
        <div className="flex flex-col md:flex-row h-full md:h-[500px]">
          {/* Left Side - Image */}
          <div className="relative w-full md:w-1/2 h-48 md:h-full bg-blue-600">
            {settings.image.url ? (
              <Image
                src={settings.image.url}
                alt="Promotion"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white p-8 text-center">
                <h3 className="text-2xl font-bold">
                  {settings.title || "Special Offer"}
                </h3>
              </div>
            )}
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center relative">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {settings.title}
              </h2>
              {settings.subtitle && (
                <p className="text-gray-600">{settings.subtitle}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  name="phone"
                  placeholder="Enter your mobile number*"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="h-12 bg-gray-50 border-gray-200"
                />
              </div>
              <div>
                <Input
                  name="name"
                  placeholder="Name*"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12 bg-gray-50 border-gray-200"
                />
              </div>
              <div>
                <Input
                  name="email"
                  type="email"
                  placeholder="Company Email*"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 bg-gray-50 border-gray-200"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-blue-600 border-blue-600 hover:bg-blue-50"
                  onClick={handleClose}
                >
                  Schedule for later
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Call"}
                </Button>
              </div>
            </form>

            {/* Trust Badges */}
            <div className="mt-8 pt-6 border-t border-gray-100 w-full overflow-hidden">
              <p className="text-xs text-gray-500 mb-3 font-medium">
                Trusted by 185,000+ companies
              </p>
              <div className="relative overflow-hidden w-full">
                <div className="flex items-center animate-scroll">
                  {[...companyLogos, ...companyLogos].map((logo, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 mx-4 flex items-center justify-center h-8"
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={logo.width * 0.8}
                        height={logo.height * 0.8}
                        className="object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
