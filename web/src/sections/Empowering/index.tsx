"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export interface EmpoweringSectionProps {
  sectionIndex?: number;
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    content?: string;
    button1Text?: string;
    button1Link?: string;
    button1BgColor?: string;
    button2Text?: string;
    button2Link?: string;
    button2BgColor?: string;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export default function EmpoweringSection({ data, sectionIndex }: EmpoweringSectionProps) {
  const router = useRouter();

  if (data?.show === false || !data?.title) return null;

  // Background Logic
  const sectionStyle: React.CSSProperties = {};
  if (data?.bgType === "color" && data.bgColor) {
    sectionStyle.backgroundColor = data.bgColor;
  } else if (data?.bgType === "gradient" && data.bgGradient) {
    sectionStyle.background = data.bgGradient;
  } else if (data?.bgType === "image" && data.backgroundImage) {
    sectionStyle.backgroundImage = `url('${data.backgroundImage}')`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  } else {
    // Default
    sectionStyle.backgroundColor = "#ffffff";
  }

  return (
    <section className="py-20 overflow-hidden" style={sectionStyle}>
      <div className="container-xl mx-auto max-w-7xl px-4 text-center">
        {/* Section Header */}
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
        >
          <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-base text-gray-600 max-w-2xl lg:max-w-5xl mx-auto mt-4"
        >
          <InlineEditable tag="div" value={data?.content || ""} fieldPath="content" sectionIndex={sectionIndex} />
        </motion.p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Button
              onClick={() => router.push(data?.button1Link || "/auth/register")}
              variant="BlueDark"
              size="xl"
              className="w-[300px]"
              style={{
                backgroundColor: data?.button1BgColor || undefined,
                borderColor: data?.button1BgColor || undefined,
              }}
            >
              <InlineEditable tag="span" value={data?.button1Text || ""} fieldPath="button1Text" sectionIndex={sectionIndex} />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Button
              onClick={() => router.push(data?.button2Link || "/contact-us")}
              variant="BlueOutline"
              size="xl"
              className="w-[300px]"
              style={{
                // For outline button, if user picks a color, maybe we should fill it or border it?
                // Let's assume background only overrides if provided, otherwise variant style holds.
                backgroundColor: data?.button2BgColor || undefined,
                borderColor: data?.button2BgColor || undefined,
                // If background is set, text color should probably be contrasting, but let's leave it for now or force white if bg is set?
                // Simple approach: Apply styles as requested.
              }}
            >
              <InlineEditable tag="span" value={data?.button2Text || ""} fieldPath="button2Text" sectionIndex={sectionIndex} />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
