"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { FaHome } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center bg-[#fdfdfd]">
      <style>{`
        #main-header, footer, .footer-wrapper {
          display: none !important;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md flex flex-col items-center"
      >

        <div>
          <span className="text-[100px] md:text-[140px] font-black text-gray-200 leading-none select-none">
            404
          </span>
          <div className=" inset-0 flex flex-col items-center justify-center pt-2 md:pt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Oops!
            </h1>
          </div>
        </div>

        <h2 className="text-xl font-medium text-gray-800 mb-3">
          Page Not Found
        </h2>

        <p className="text-gray-500 mb-10 text-pretty">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link href="/">
          <Button
            variant="BlueDark"
            size="lg"
            className="rounded-full px-8 h-12 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 gap-2"
          >
            <FaHome className="w-4 h-4" />
            Go to Homepage
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}


