"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

interface ClickableBannerProps {
  // Ensure imageUrl is always provided for the Image component
  imageUrl: string;
  link?: string;
  className?: string;
}

export function ClickableBanner({
  imageUrl,
  link = "/",
  className = "",
}: ClickableBannerProps) {
  return (
    <section>
      <div className="">
        <Link
          href={link}
          className={`block relative w-full h-[120px] sm:h-[280px] md:h-[400px] lg:h-[500px] overflow-hidden ${className}`}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="w-full h-full relative"
          >
            <Image
              src={imageUrl}
              alt="Promotional banner"
              fill
              className="object-cover object-center"
              priority
            />
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
