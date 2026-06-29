"use client";
import React from "react";

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />
  );
};

export default LoadingSkeleton;
