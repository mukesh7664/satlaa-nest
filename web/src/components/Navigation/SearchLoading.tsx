"use client";

import { motion } from "framer-motion";

export const SearchLoading = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -6 },
  };

  const containerVariants = {
    initial: {
      transition: {
        staggerChildren: 0.1,
      },
    },
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="flex items-center justify-center py-8">
      <motion.div
        className="flex space-x-1.5"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            variants={dotVariants}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="w-2.5 h-2.5 bg-blue-600 rounded-full"
          />
        ))}
      </motion.div>
    </div>
  );
};
