import React from "react";
import Image from "next/image";

interface TrustedPartnersProps {
  data?: {
    title?: string;
    description?: string;
    softwareSection?: {
      title?: string;
      description?: string;
      partners?: Array<{
        name: string;
        icon?: string;
      }>;
    };
    centerVideo?: string;
    centerImage?: string;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

const TrustedPartners: React.FC<TrustedPartnersProps> = ({ data }) => {
  const title = data?.title || "Trusted Partners work with us";
  const description =
    data?.description ||
    "Join a growing network of businesses that rely on us for innovative software solutions and lasting success";

  const softwareTitle =
    data?.softwareSection?.title ||
    "The partners we work for the software solutions";
  const softwareDescription = data?.softwareSection?.description || description;
  const softwarePartners = data?.softwareSection?.partners || [];

  const centerVideo =
    data?.centerVideo || "/images/pages/brand/trustedvideo.mp4";
  const centerImage =
    data?.centerImage || "/images/pages/brand/girlwithlaptop.png";

  // Background Logic
  const sectionStyle: React.CSSProperties = {};
  if (data?.bgType === "color" && data.bgColor) {
    sectionStyle.backgroundColor = data.bgColor;
  } else if (data?.bgType === "gradient" && data.bgGradient) {
    sectionStyle.background = data.bgGradient;
  } else if (data?.bgType === "image" && data.backgroundImage) {
    sectionStyle.backgroundImage = `url('${data.backgroundImage}')`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  } else {
    // Default white
    sectionStyle.backgroundColor = "#ffffff";
  }

  return (
    <div className="py-16" style={sectionStyle}>
      <div className="container-xl mx-auto px-4 sm:px-6 lg:px-20 text-center">
        <h2
          className="text-4xl md:text-5xl font-extrabold mb-4"
          dangerouslySetInnerHTML={{
            __html: title,
          }}
        />
        <p className="text-lg text-black mb-12">{description}</p>

        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8">
          {/* Left Card - Software Partners */}
          <div className="flex-1 max-w-lg lg:max-w-[550px] h-full ">
            <div className="shadow-lg shadow-blue-200 rounded-lg p-6 bg-white ">
              <h3 className="text-2xl font-semibold text-black mb-4 text-left">
                {softwareTitle}
              </h3>
              <p className="text-sm text-gray-600 mb-6 text-left">
                {softwareDescription}
              </p>
            </div>
            {softwarePartners.length > 0 && (
              <div className="grid grid-cols-3 bg-white border border-gray-200 mt-8">
                {softwarePartners.map((partner, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center  py-8 border border-gray-50"
                  >
                    {partner.icon && (
                      <div className="relative w-[50px] h-[50px]">
                        <Image
                          src={partner.icon}
                          alt={partner.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Middle Image - Woman with Laptop */}
          <div className="relative top-0 left-0 w-full lg:w-[290px] h-[548px] flex justify-center items-center">
            <video
              src={centerVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-center rounded-tl-[136px] rounded-br-[136px] rounded-bl-[36px]"
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[238px] h-[362px] flex items-end justify-center">
              <Image
                src={centerImage}
                width={500}
                height={500}
                alt="center image"
                className="object-contain "
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrustedPartners;
