"use client";
import React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface TrustedBrandsSectionProps {
  data?: {
    title?: string;
    description?: string;
    subtitle?: string;
    highlightedText?: string;
    brands?: Array<{ image: string; alt?: string }>;
    images?: string[];
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

// Default brand logos if no dynamic data
const defaultBrandLogos = [
  { image: "/images/pages/companies/meta.png", alt: "meta Logo" },
  { image: "/images/pages/companies/amazon.png", alt: "amazon Logo" },
  { image: "/images/pages/companies/lenskart.png", alt: "lenskart Logo" },
  { image: "/images/pages/companies/acc.png", alt: "acc Logo" },
  { image: "/images/pages/companies/dell2.png", alt: "dell Logo" },
  { image: "/images/pages/companies/zomato.png", alt: "zomato Logo" },
  { image: "/images/pages/companies/lenskart.png", alt: "lenskart Logo" },
  { image: "/images/pages/companies/ibm.png", alt: "ibm Logo" },
  { image: "/images/pages/companies/tesla.png", alt: "tesla Logo" },
  { image: "/images/pages/companies/lg.png", alt: "lg Logo" },
  { image: "/images/pages/companies/hp.png", alt: "hp Logo" },
  { image: "/images/pages/companies/alphabet.png", alt: "alphabet Logo" },
  { image: "/images/pages/companies/intel.png", alt: "intel Logo" },
  { image: "/images/pages/companies/tencent.png", alt: "Tencent Logo" },
  { image: "/images/pages/companies/oracle.png", alt: "oracle Logo" },
  { image: "/images/pages/companies/google.png", alt: "Google Logo" },
];

export function TrustedBrandsSection({ data }: TrustedBrandsSectionProps) {
  const title = data?.title || "Proudly trusted by leading brands worldwide.";
  const highlightedText = data?.highlightedText || "";
  const description =
    data?.subtitle ||
    data?.description ||
    "Join a growing network of businesses that rely on us for innovative software solutions and lasting success";

  // Use dynamic brands if available, otherwise default
  // Admin editor saves as data.images (string[]), Component expects data.brands ({image, alt}[])
  let formattedBrands: { image: string; alt?: string }[] = [];

  if (data?.brands && data.brands.length > 0) {
    formattedBrands = data.brands;
  } else if (
    data?.images &&
    Array.isArray(data.images) &&
    data.images.length > 0
  ) {
    formattedBrands = data.images.map((url: string) => ({
      image: url,
      alt: "Brand Logo",
    }));
  }

  const brandLogos =
    formattedBrands.length > 0 ? formattedBrands : defaultBrandLogos;

  // Background Logic
  const bgStyle: React.CSSProperties = {};
  if (data?.bgType === "color" && data.bgColor) {
    bgStyle.backgroundColor = data.bgColor;
  } else if (data?.bgType === "gradient" && data.bgGradient) {
    bgStyle.background = data.bgGradient;
  } else if (data?.bgType === "image" && data.backgroundImage) {
    bgStyle.backgroundImage = `url('${data.backgroundImage}')`;
  } else {
    // Default fallback if no bg settings provided
    bgStyle.backgroundColor = "#E2EFFF";
  }

  return (
    <section className="container-xl px-4 sm:px-6 md:px-8 lg:px-10 mx-auto py-8 md:py-12">
      <div
        className="mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
        style={bgStyle}
      >
        {/* Header Text */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl md:text-5xl">
            {highlightedText && title.includes(highlightedText) ? (
              <>
                {title.split(highlightedText)[0]}
                <span className="text-[#004DAA]">{highlightedText}</span>
                {title.split(highlightedText).slice(1).join(highlightedText)}
              </>
            ) : (
              title
            )}
          </h2>
          <p className="mx-auto mt-4 text-lg text-black">{description}</p>
        </div>

        {/* LOGO AREA */}
        <div className=" max-w-6xl mx-auto">
          {/* Mobile & Tablet View: Shadcn Carousel */}
          <div className="lg:hidden">
            <Carousel
              plugins={[
                Autoplay({
                  delay: 2000,
                  stopOnInteraction: false,
                }),
              ]}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {brandLogos.map((brand, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-1/2 sm:basis-1/3 md:basis-1/4 pl-4"
                  >
                    <div className="flex h-24 items-center justify-center rounded-md bg-white p-4 shadow-sm">
                      <Image
                        src={brand.image}
                        alt={brand.alt || "Brand Logo"}
                        width={120}
                        height={60}
                        className="h-auto w-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Desktop View: Two-Row Grid */}
          <div className="hidden flex-col items-center gap-6 lg:flex">
            <div className="mt-12 grid grid-cols-2 place-items-center gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {brandLogos.map((brand, index) => (
                <div
                  key={index}
                  className="flex h-24 w-full max-w-[150px] items-center justify-center rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <Image
                    src={brand.image}
                    alt={brand.alt || "Brand Logo"}
                    width={120}
                    height={60}
                    className="h-auto w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
