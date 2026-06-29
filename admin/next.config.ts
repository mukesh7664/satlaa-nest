import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "inospire.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.ap-south-1.amazonaws.com",
      },
    ],
    unoptimized: true,
  },
  serverExternalPackages: ["mongoose"],
  transpilePackages: [
    "@ckeditor/ckeditor5-react",
    "@ckeditor/ckeditor5-build-classic",
  ],
};

export default withSentryConfig(nextConfig, {
  org: "epxweb",
  project: "epxweb-admin",
  silent: !process.env.CI,
});

