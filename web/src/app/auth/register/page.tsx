"use client";

import { useEffect, useState } from "react";
import { RegisterForm } from "@/components/Auth/RegisterForm";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [siteName, setSiteName] = useState<string>("EPxWEB");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiteName = async () => {
      try {
        const hostname = window.location.hostname;
        const tenantName = hostname.split('.')[0];
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
        
        const res = await fetch(`${apiUrl}/settings/seo`, {
          headers: {
            "x-tenant-domain": hostname,
          },
        });
        
        if (res.ok) {
          const result = await res.json();
          let name = result.data?.siteName || result.data?.seo?.siteName;
          
          if ((!name || name === "EPxWEB" || name === "Inospire") && !isLocalhost && tenantName !== 'www') {
            name = tenantName;
          }
          
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        ) : (
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {siteName}
          </h1>
        )}
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <RegisterForm />
      </div>
    </div>
  );
}
