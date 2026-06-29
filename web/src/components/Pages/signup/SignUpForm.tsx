"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import { LuMail } from "react-icons/lu";

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Sign Up</h1>
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#0A66C2] hover:underline">
            Log in
          </Link>
        </p>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full border border-[#004DAA] text-[#004DAA] flex items-center font-medium justify-center gap-2 h-11"
        >
          <Image
            src="/images/icon/googleicon.png"
            alt="Google"
            width={18}
            height={18}
          />
          Continue with Google
        </Button>

        <Button
          variant="outline"
          className="w-full border border-[#004DAA] text-[#004DAA] flex items-center justify-center gap-2 h-11"
        >
          <Image
            src="/images/icon/appleicon.png"
            alt="Apple"
            width={25}
            height={25}
          />
          Continue with Apple
        </Button>
      </div>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-500 text-sm mx-2">OR</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Email Field */}
      <div className="mb-4">
        <div className="relative">
          <LuMail className="absolute left-3 top-3 text-gray-400" size={18} />
          <Input
            type="email"
            placeholder="Email Address"
            className="pl-10 h-11 border-gray-200 bg-gray-50 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="mb-4">
        <div className="relative">
          <MdLockOutline
            className="absolute left-3 top-3 text-gray-400"
            size={18}
          />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            className="pl-10 pr-10 h-11 border-gray-200 bg-gray-50 placeholder-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showPassword ? <FaRegEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 md:max-w-sm">
          Password must be at least{" "}
          <span className="font-medium text-[#0A66C2]">8 Characters</span> and
          must contain at least a{" "}
          <span className="font-medium text-[#0A66C2]">Capital Letter</span>, a{" "}
          <span className="font-medium text-[#0A66C2]">Number</span> and a{" "}
          <span className="font-medium text-[#0A66C2]">Special Character</span>.
        </p>
      </div>

      {/* Confirm Password Field */}
      <div className="mb-6">
        <div className="relative">
          <MdLockOutline
            className="absolute left-3 top-3 text-gray-400"
            size={18}
          />
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Re-Enter password"
            className="pl-10 pr-10 h-11 border-gray-200 bg-gray-50 placeholder-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showConfirm ? <FaRegEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 md:max-w-sm">
          Password must be at least{" "}
          <span className="font-medium text-[#0A66C2]">8 Characters</span> and
          must contain at least a{" "}
          <span className="font-medium text-[#0A66C2]">Capital Letter</span>, a{" "}
          <span className="font-medium text-[#0A66C2]">Number</span> and a{" "}
          <span className="font-medium text-[#0A66C2]">Special Character</span>.
        </p>
      </div>

      {/* Sign In Button */}
      <Button className="w-[50%] h-11 bg-[#004DAA] hover:bg-[#004182] text-white font-medium">
        Sign in
      </Button>

      {/* Terms */}
      <p className="text-xs text-gray-500 mt-4 md:max-w-sm">
        By signing up, you agree to the{" "}
        <Link href="#" className="text-[#0A66C2] hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-[#0A66C2] hover:underline">
          Privacy Policy
        </Link>
        , including{" "}
        <Link href="#" className="text-[#0A66C2] hover:underline">
          cookie use
        </Link>
        .
      </p>
    </div>
  );
}
