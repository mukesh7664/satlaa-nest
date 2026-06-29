"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token
      ? "Verifying your email..."
      : "Invalid verification link. Token is missing."
  );

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
          headers: { "x-tenant-domain": hostname },
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

  useEffect(() => {
    if (!token) {
      return;
    }

    const verifyEmail = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
        const response = await fetch(`${apiUrl}/auth/verify-email/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An error occurred while verifying your email.");
      }
    };

    verifyEmail();
  }, [token, router]);

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

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-8 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Verifying Email</h2>
            <p className="text-gray-600 mt-2">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Verified!</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <div className="mt-8">
              <Link
                href="/auth/login"
                className="w-full inline-block px-8 py-3 bg-[#004DAA] text-white rounded-lg hover:bg-[#003d8a] transition-all font-semibold shadow-lg"
              >
                Go to Login
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4 italic">
              Redirecting in 3 seconds...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-red-600 mt-2">{message}</p>
            <div className="mt-8">
              <Link
                href="/auth/login"
                className="w-full inline-block px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all font-semibold"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
