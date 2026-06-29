"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { forgotPassword, isLoading } = useAuth();
  
  const [siteName, setSiteName] = useState<string>("EPxWEB");
  const [siteLoading, setSiteLoading] = useState(true);

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
        setSiteLoading(false);
      }
    };

    fetchSiteName();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword(email);
      setMessage(
        response.message || "If an account exists, a reset link has been sent."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        {siteLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        ) : (
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {siteName}
          </h1>
        )}
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm">
              {message}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all rounded-lg"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-[#004DAA] hover:bg-[#003d8a] text-white font-semibold rounded-lg shadow-lg shadow-blue-900/20 transition-all hover:shadow-blue-900/40" 
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <div className="text-center text-sm text-gray-600 mt-6">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[#004DAA] hover:underline"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
