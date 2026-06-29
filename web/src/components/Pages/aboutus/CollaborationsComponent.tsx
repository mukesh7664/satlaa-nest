import React from "react";
import Image from "next/image";
import { FaCheck } from "react-icons/fa";

interface CollaborationsComponentProps {
  data?: {
    title?: string;
    description?: string;
    content?: string[];
    images?: string[];
    video?: string;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

// Default features (keep same)
const defaultFeatures: string[] = [
  "Microsoft 365 offers a suite of productivity applications that enhance collaboration.",
  "Teams integrates seamlessly with other Microsoft 365 services for efficient communication.",
  "OneDrive provides cloud storage solutions that ensure accessibility from anywhere.",
  "SharePoint facilitates team collaboration by allowing users to create and manage content easily.",
];

const CollaborationsComponent: React.FC<CollaborationsComponentProps> = ({
  data,
}) => {
  const title = data?.title || "Our Events and Collaborations";
  const description =
    data?.description ||
    "Discover how we partner with industry leaders to deliver cutting-edge solutions and drive success for our clients.";
  const mainImage =
    data?.images?.[0] || "/images/pages/homepage/collaboration.png";
  const videoUrl = data?.video || "/images/pages/brand/aboutusvideo.mp4";

  // Use content directly if provided, otherwise use default
  const features =
    data?.content && data.content.length > 0 ? data.content : defaultFeatures;

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
    // Default default to transparent/white handled by parent or none
  }

  return (
    <section className=" w-full " style={sectionStyle}>
      <div className="container-xl mx-auto  px-4 sm:px-6 lg:px-20">
        {/* 1. Heading and Description */}
        <div className="text-left mb-12">
          <h2
            className="text-3xl font-semibold text-slate-900 sm:text-4xl md:text-5xl"
            dangerouslySetInnerHTML={{
              __html: title
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"'),
            }}
          />

          <div
            className="mt-4  text-lg text-slate-600"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>

        {/* 2. Main Content Area (Left/Right Split) */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <div className="w-full lg:w-[40%]">
            <Image
              src={mainImage}
              width={500}
              height={500}
              alt="collaboration"
              className="object-contain w-full h-full"
            />
          </div>
          <div className="w-full lg:w-[60%] flex  items-center mb-8">
            {/* Video with rounded corners */}
            <div className="relative left-0 lg:left-12 w-full  lg:max-w-none h-[400px] lg:h-[600px] overflow-hidden  mb-10 flex items-center justify-center">
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center rounded-t-[167px] rounded-bl-[167px]"
              />
            </div>

            {/* Feature list */}
            <div className="w-full max-w-sm lg:max-w-full space-y-2 lg:space-y-4 z-10">
              {features.slice(0, 4).map((feature, index) => (
                <div
                  key={index}
                  className={`${
                    index === 0 ? "bg-[#E2EFFF]" : "bg-white shadow-lg"
                  } flex items-start p-2 lg:p-4  rounded-lg  shadow-blue-100`}
                >
                  <FaCheck
                    className={`h-5 w-5 p-1 text-[#0F172A] mr-3 mt-1 flex-shrink-0 ${
                      index === 0 ? "bg-white" : "bg-[#E2EFFF]"
                    }`}
                  />
                  <p className="text-base text-gray-700 line-clamp-2">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollaborationsComponent;
