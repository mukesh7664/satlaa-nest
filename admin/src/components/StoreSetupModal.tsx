"use client";

import React from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { X, CheckCircle2, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { SetupStep } from "@/services/dashboard.api";

interface StoreSetupModalProps {
  open: boolean;
  onClose: () => void;
  completionPercentage: number;
  steps: SetupStep[];
}

export default function StoreSetupModal({
  open,
  onClose,
  completionPercentage,
  steps,
}: StoreSetupModalProps) {
  const router = useRouter();

  // SVG Circular Progress Constants
  const radius = 60;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  const handleStepClick = (redirectUrl: string) => {
    onClose();
    router.push(redirectUrl);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          overflow: "hidden",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          color: "#94a3b8",
          "&:hover": { color: "#475569" },
          zIndex: 10,
        }}
      >
        <X size={20} />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>
        <div className="flex flex-col md:flex-row min-h-[450px]">
          {/* Left Column: Circular Progress Visual */}
          <div className="md:w-[40%] bg-slate-50 flex flex-col items-center justify-center p-8 border-r border-slate-100 select-none">
            <div className="relative flex items-center justify-center">
              <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
              >
                {/* Track Circle */}
                <circle
                  stroke="#e2e8f0"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                {/* Progress Circle */}
                <circle
                  stroke="#10b981"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s ease" }}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>
              {/* Text inside Circle */}
              <div className="absolute text-2xl font-extrabold text-slate-800">
                {completionPercentage}%
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mt-6 text-center leading-snug">
              {completionPercentage === 100
                ? "Your store is complete!"
                : completionPercentage >= 80
                ? "You're almost done!"
                : completionPercentage >= 50
                ? "Getting there!"
                : "Let's set up your store!"}
            </h3>
            <p className="text-xs text-slate-500 mt-2 text-center max-w-[200px] leading-relaxed">
              {completionPercentage === 100
                ? "Excellent! Your store profile is 100% configured and optimized for SEO and sales."
                : "Complete all the checklist items to optimize your store for shoppers and ready it for launch."}
            </p>
          </div>

          {/* Right Column: Steps Checklist */}
          <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                Complete your store
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed">
                Stores with completed profiles are 4.5x more likely to attract customers and run successful sales campaigns.
              </p>

              {/* Steps List */}
              <div className="space-y-3">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    onClick={() => handleStepClick(step.redirectUrl)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/20 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                      <div className="flex-shrink-0 mt-0.5">
                        {step.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 group-hover:text-violet-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`text-sm font-semibold transition-colors ${
                            step.isCompleted
                              ? "text-slate-500 line-through decoration-slate-300"
                              : "text-slate-800 group-hover:text-violet-600"
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 truncate leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Weight Badge */}
                    <div className="flex-shrink-0">
                      {step.isCompleted ? (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 select-none">
                          Done
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 group-hover:bg-violet-100 group-hover:text-violet-700 transition-colors select-none">
                          +{step.weight}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Close Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-slate-900/10 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
