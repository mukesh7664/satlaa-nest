import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { IntroLogo } from "./IntroLogo";

interface IntroAnimationProps {
  onAnimationComplete: () => void;
  onStartContentReveal: () => void;
}

export const IntroAnimation = ({
  onAnimationComplete,
  onStartContentReveal,
}: IntroAnimationProps) => {
  const [stage, setStage] = useState<"initial" | "sliding" | "done">("initial");

  useEffect(() => {
    // Sequence timing
    const sequence = async () => {
      // 1. Drawing Phase (1.5s) + Hold (0.5s)
      await new Promise((resolve) => setTimeout(resolve, 1800));

      // 2. Start Slide Animation
      setStage("sliding");

      // 3. Trigger content reveal
      onStartContentReveal();

      // 4. Wait for slide animation (0.8s)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 5. Finish
      setStage("done");
      onAnimationComplete();
    };

    sequence();
  }, [onStartContentReveal, onAnimationComplete]);

  if (stage === "done") return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col">
      {/* Single Overlay Panel */}
      <motion.div
        className="absolute inset-0 w-full h-full bg-[#0f172a]"
        initial={{ y: 0 }}
        animate={{
          y: stage === "sliding" ? "-100%" : 0,
        }}
        transition={{
          duration: 0.8,
          ease: [0.83, 0, 0.17, 1],
        }}
      />

      {/* Centered Logo */}
      <AnimatePresence>
        {stage === "initial" && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }} // Fade out and move up slightly before slide
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-[600px]">
              <IntroLogo />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
