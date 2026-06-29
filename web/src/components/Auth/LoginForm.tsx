"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { MdEmail, MdLock } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  isModal?: boolean;
}

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  isModal = false,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const { login, resendVerificationEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerificationEmailSent(false);
    setIsLoading(true);

    try {
      await login(email, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail(email);
      setVerificationEmailSent(true);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification email"
      );
    }
  };

  return (
    <div
      className={`w-full ${
        !isModal ? "max-w-[450px] mx-auto p-6 bg-white rounded-xl" : ""
      }`}
    >
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Please enter your details to sign in
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
            {error.includes("verify your email") && (
              <button
                type="button"
                onClick={handleResendVerification}
                className="block mt-2 text-xs font-semibold underline hover:text-red-800"
              >
                Resend Verification Email
              </button>
            )}
          </div>
        )}

        {verificationEmailSent && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm">
            Verification email sent successfully! Please check your inbox.
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Email Address
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <MdEmail size={20} />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              onClick={isModal && onSuccess ? onSuccess : undefined}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <MdLock size={20} />
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all rounded-lg"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-[#004DAA] hover:bg-[#003d8a] text-white font-semibold rounded-lg shadow-lg shadow-blue-900/20 transition-all hover:shadow-blue-900/40"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        {/* <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div> */}

        {/* <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 h-10 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FcGoogle size={20} />
            <span className="text-sm font-medium text-gray-700">Google</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 h-10 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaApple size={20} />
            <span className="text-sm font-medium text-gray-700">Apple</span>
          </button>
        </div> */}

        <div className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          {onSwitchToRegister ? (
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-[#004DAA] hover:underline"
            >
              Sign up for free
            </button>
          ) : (
            <Link
              href="/auth/register"
              className="font-semibold text-[#004DAA] hover:underline"
            >
              Sign up for free
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
