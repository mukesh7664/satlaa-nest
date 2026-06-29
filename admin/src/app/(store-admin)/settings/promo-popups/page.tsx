"use client";

import React from "react";
import PopupSettings from "./PopupSettings";

export default function AdvertisementPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Promo Popup Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure lead capture, promotion, and engagement popups for your website
        </p>
      </div>
      <PopupSettings />
    </div>
  );
}
