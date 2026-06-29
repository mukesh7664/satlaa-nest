"use client";

import dynamic from "next/dynamic";

// Dynamically import the scanner client with SSR disabled.
// Since ScannerWrapper is a Client Component ("use client"), Next.js allows ssr: false here.
const ScannerClient = dynamic(
  () => import("./ScannerClient"),
  { ssr: false }
);

export default function ScannerWrapper() {
  return <ScannerClient />;
}
