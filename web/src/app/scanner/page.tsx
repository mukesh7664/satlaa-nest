import type { Metadata } from "next";

import ScannerWrapper from "./ScannerWrapper";

export const metadata: Metadata = {
  title: "Product QR Scanner | Storefront",
  description: "Scan a product QR code or upload a QR image to view pricing, stock status, and specifications instantly.",
};

export default function ScannerPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <ScannerWrapper />
    </main>
  );
}
