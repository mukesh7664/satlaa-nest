"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { IntroAnimation } from "./IntroAnimation";

// Module-level variable to track intro state across component remounts within the same page load.
// This resets on page refresh, but persists if the component unmounts/remounts due to layout updates.
let hasSeenIntro = false;

export const IntroWrapper = ({ children }: { children: React.ReactNode }) => {
  // Initialize state based on whether we've already seen the intro
  const [showIntro, setShowIntro] = useState(!hasSeenIntro);
  // Content should be visible immediately if we've seen the intro
  const [contentVisible, setContentVisible] = useState(hasSeenIntro);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsChecked(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleStartContentReveal = () => {
    setContentVisible(true);
  };

  const handleAnimationComplete = () => {
    setShowIntro(false);
    hasSeenIntro = true;
  };

  if (!isChecked) return null; // Prevent hydration mismatch

  return (
    <>
      {showIntro && (
        <IntroAnimation
          onStartContentReveal={handleStartContentReveal}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
      <motion.div
        initial={showIntro ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
        animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        {children}
      </motion.div>
    </>
  );
};
