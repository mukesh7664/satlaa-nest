import React from "react";

interface StatsBannerProps {
  data?: {
    title?: string;
    stats?: Array<{
      metric: string;
      label: string;
    }>;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export function StatsBanner({ data }: StatsBannerProps) {
  const title =
    data?.title ||
    "India's Largest Software Marketplace Trusted By Millions Of Businesses";
  const stats = data?.stats || [
    { metric: "2017", label: "Founded year" },
    { metric: "170", label: "Team members" },
    { metric: "3M+", label: "Happy users" },
    { metric: "230M+", label: "Corporate appreciation" },
    { metric: "10+", label: "super categories" },
  ];

  // Background Logic
  const sectionStyle: React.CSSProperties = {};
  // Default values to match original if not provided
  if (data?.bgType === "color" && data.bgColor) {
    sectionStyle.backgroundColor = data.bgColor;
  } else if (data?.bgType === "gradient" && data.bgGradient) {
    sectionStyle.background = data.bgGradient;
  } else if (data?.bgType === "image" && data.backgroundImage) {
    sectionStyle.backgroundImage = `url('${data.backgroundImage}')`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  } else {
    // Default gradient
    sectionStyle.background =
      "linear-gradient(to bottom right, #1e1c6b, #1a1a52, #12123b)";
  }

  return (
    <section className="container-xl px-4 sm:px-6 md:px-8 lg:px-10 mx-auto py-8 md:py-12">
      <div
        className="relative overflow-hidden rounded-md p-8 text-white shadow-2xl md:p-12"
        style={sectionStyle}
      >
        {/* Optional: Subtle background glows for visual effect */}
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10">
          {/* Main Heading */}
          <h2 className="mx-auto max-w-4xl text-center text-3xl font-semibold md:text-4xl lg:text-5xl">
            <span dangerouslySetInnerHTML={{ __html: title }} />
          </h2>

          {/* Stats Grid - uses divide-x for the vertical lines */}
          <div className="mt-12 grid grid-cols-2 gap-y-10 divide-x divide-white/50 text-center sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat, i) => (
              <div key={i} className="px-4">
                <p className="text-4xl font-semibold md:text-5xl">
                  {stat.metric}
                </p>
                <p className="mt-2 text-sm text-white md:text-lg">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
