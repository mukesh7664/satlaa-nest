import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "inospire.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "bollyhollybaba.com",
      },
      {
        protocol: "https",
        hostname: "inospiresoft.com",
      },
    ],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/scannner",
        destination: "/scanner",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "epxweb",
  project: "epxweb-storefront",

  // Only print logs for uploading source maps in CI, keep development quiet
  silent: !process.env.CI,
});

