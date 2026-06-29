"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import StoreSetupModal from "./StoreSetupModal";
import { SetupStatus } from "@/services/dashboard.api";

interface StoreSetupWidgetProps {
  setupStatus: SetupStatus;
}

export default function StoreSetupWidget({ setupStatus }: StoreSetupWidgetProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { completionPercentage = 0, steps = [] } = setupStatus;

  return (
    <>
      <div className="w-full bg-gradient-to-r from-violet-50 to-indigo-50/50 rounded-2xl p-5 border border-violet-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:shadow-md mb-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Circular Icon badge */}
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                Complete your store profile
              </h3>
              <span className="text-xs font-semibold text-violet-700 bg-violet-100/50 px-2 py-0.5 rounded-full border border-violet-200/40">
                {completionPercentage}% Complete
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">
              Finish configuring your logo, products, payments, and domain to activate your custom storefront and start collecting client transactions.
            </p>

            {/* Horizontal Progress Bar */}
            <div className="w-full max-w-md bg-slate-200/80 rounded-full h-2 mt-3.5 overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-violet-600/10 hover:shadow-violet-600/20 group cursor-pointer"
          >
            <span>Complete Setup</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Checklist Popup Modal */}
      <StoreSetupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        completionPercentage={completionPercentage}
        steps={steps}
      />
    </>
  );
}
