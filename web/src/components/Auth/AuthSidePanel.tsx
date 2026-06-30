"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AuthSidePanel() {
  const [siteName, setSiteName] = useState<string>("EPxWEB");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiteName = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
        const res = await fetch(`${apiUrl}/settings/seo`);

        if (res.ok) {
          const result = await res.json();
          const name = result.data?.siteName || result.data?.seo?.siteName;
          setSiteName(name || "EPxWEB");
        }
      } catch (error) {
        console.error("Error fetching site name:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSiteName();
  }, []);

  return (
    <div className="hidden md:flex w-1/2 bg-[#004DAA] relative items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#004DAA] to-[#003377] opacity-90 z-10" />
      <Image
        src="/images/auth-bg.jpg"
        alt="Auth Background"
        fill
        className="object-cover opacity-20"
        priority
      />
      <div className="relative z-20 text-white space-y-6">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/20">
          <Image
            src="/images/mainlogo.png"
            alt={siteName}
            width={40}
            height={40}
            className="w-10 h-auto brightness-0 invert"
          />
        </div>

        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        ) : (
          <h2 className="text-3xl font-bold leading-tight text-white">
            Welcome to <br />
            {siteName}
          </h2>
        )}
      </div>

      {/* Decorative circles */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
    </div>
  );
}
