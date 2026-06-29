"use client";

import { InlineEditable } from "@/components/InlineEditable";
import Image from "next/image";
import { FaStar, FaPlus } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import {
  motion,
  useTransform,
  useInView,
  useMotionValue,
  animate,
} from "motion/react";
import { useEffect, useRef } from "react";
import { InlineImageEditable } from "@/components/InlineImageEditable";

// --- Reusable Star Rating Component ---
const StarRating = ({ rating = 5 }: { rating?: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={
          i < rating ? "text-blue-500 h-4 w-4" : "text-gray-300 h-4 w-4"
        }
      />
    ))}
  </div>
);

// --- Counter Component ---
const Counter = ({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration: 2, ease: "easeOut" });
    }
  }, [isInView, value, count]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};

// --- Main Testimonials and Stats Section Component ---
export interface TestimonialsSectionProps {
  sectionIndex?: number;
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    items?: Array<{
      name?: string;
      role?: string;
      review?: string;
      image?: string;
      imageShape?: "circle" | "square";
      rating?: number;
    }>;
    stats?: Array<{
      title?: string;
      count?: number;
      suffix?: string;
      backgroundImage?: string;
      innerImage?: string;
      innerImages?: string[];
      buttonText?: string;
      buttonLink?: string;
      backgroundColor?: string;
      imageShape?: "circle" | "square";
    }>;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
}

export default function TestimonialsSection({
  data, sectionIndex,
}: TestimonialsSectionProps) {
  if (data?.show === false) return null;

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
    // Default
    sectionStyle.backgroundColor = "#ffffff";
  }

  return (
    <section className="py-20" style={sectionStyle}>
      <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900"
          >
            {data?.title ? (
              <InlineEditable tag="span" value={data?.title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            ) : (
              <>
                What <span className="text-[#4988FF]">Client </span>Say
              </>
            )}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mt-4 text-lg text-gray-600 "
          >
            {data?.subtitle ? (
              <InlineEditable tag="span" value={data?.subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
            ) : (
              "Real Stories from Clients Who Trust and Recommend Our Services"
            )}
          </motion.p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-rows-1 lg:grid-rows-2 gap-6">
          {/* Large Card: 500+ Clients (Left Column) */}
          <div className="grid lg:grid-cols-4  gap-6">
            {data?.stats && data.stats.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative rounded-2xl lg:col-span-1 overflow-hidden group shadow-lg w-full h-full shrink-0"
              >
                {data.stats[0]?.backgroundImage ? (
                  <InlineImageEditable
                    src={data.stats[0].backgroundImage}
                    alt={data.stats[0].title || "Stats"}
                    fill
                    fieldPath="stats.0.backgroundImage"
                    sectionIndex={sectionIndex}
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-200" />
                )}

                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                  <div className="flex items-center bg-white/70 backdrop-blur-sm p-1.5 rounded-lg w-fit">
                    {data.stats[0]?.innerImages &&
                    data.stats[0].innerImages.filter((img) => img).length >
                      0 ? (
                      <div className="flex -space-x-4 mr-2">
                        {data.stats[0].innerImages
                          .filter((img) => img)
                          .map((img, idx) => (
                            <Image
                              key={idx}
                              src={img}
                              alt="icon"
                              width={40}
                              height={40}
                              className={`shrink-0 aspect-square object-cover ${
                                data.stats &&
                                data.stats[0].imageShape === "square"
                                  ? "rounded-lg"
                                  : "rounded-full"
                              }`}
                              style={{
                                objectFit: "cover", // Ensure cover works for aspect ratio
                              }}
                            />
                          ))}
                      </div>
                    ) : (
                      data.stats[0]?.innerImage && (
                        <Image
                          src={data.stats[0].innerImage}
                          alt="icon"
                          width={40}
                          height={40}
                          className="mr-2"
                        />
                      )
                    )}
                    <span className="ml-3 font-bold text-sm text-[#000D83] pr-2">
                      {data.stats[0]?.count}
                      {data.stats[0]?.suffix}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-5xl font-bold">
                      <Counter
                        value={data.stats[0]?.count || 0}
                        suffix={data.stats[0]?.suffix || ""}
                      />
                    </h3>
                    <p className="text-lg">{data.stats[0]?.title}</p>
                    {data.stats[0]?.buttonLink && (
                      <a
                        href={data.stats[0].buttonLink}
                        className="mt-4 inline-block px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg"
                      >
                        {data.stats[0].buttonText || "Learn More"}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative rounded-2xl lg:col-span-1 overflow-hidden group shadow-lg w-full h-full shrink-0"
              >
                <Image
                  src="/images/pages/homepage/clientmeet.png"
                  alt="Clients at a meeting"
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                  <div className="flex items-center bg-white/70 backdrop-blur-sm p-1.5 rounded-lg w-fit">
                    <div className="flex -space-x-4">
                      <Image
                        src="/images/pages/homepage/homeicon/client1icon.png"
                        alt="avatar 1"
                        width={40}
                        height={40}
                      />
                      <Image
                        src="/images/pages/homepage/homeicon/client2icon.png"
                        alt="avatar 1"
                        width={40}
                        height={40}
                      />
                      <Image
                        src="/images/pages/homepage/homeicon/client3icon.png"
                        alt="avatar 1"
                        width={40}
                        height={40}
                      />
                      <Image
                        src="/images/pages/homepage/homeicon/client4icon.png"
                        alt="avatar 1"
                        width={40}
                        height={40}
                      />
                    </div>
                    <span className="ml-3 font-semibold text-sm text-[#000D83] pr-2">
                      +400
                    </span>
                  </div>
                  <div>
                    <h3 className="text-5xl font-bold">
                      <Counter value={500} suffix="+" />
                    </h3>
                    <p className="text-lg">Clients Globally</p>
                  </div>
                </div>
              </motion.div>
            )}
            {/* Testimonials Column */}
            <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden h-full">
              {/* Scrolling Marquee for All Reviews */}
              {data?.items && data.items.length > 0 && (
                <div className="relative w-full overflow-hidden h-full flex">
                  {/* Fade Gradients */}
                  <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                  <motion.div
                    className="flex gap-6"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                      duration: 30, // Slower duration for more content
                      ease: "linear",
                      repeat: Infinity,
                    }}
                    whileHover={{ animationPlayState: "paused" }}
                  >
                    {/* We duplicate the list to ensure seamless scrolling */}
                    {[...data.items, ...data.items].map((item, index) => (
                      <div
                        key={index}
                        className="bg-white p-8 rounded-2xl border border-gray-200/80 w-[450px] flex-shrink-0 aspect-[3.6/1] flex flex-col justify-between"
                      >
                        <div>
                          <StarRating rating={item.rating || 5} />
                          <p className="mt-3 text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {item.review}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <Image
                            src={
                              item.image ||
                              `https://placehold.co/40x40/EFEFEF/333?text=${item.name?.charAt(
                                0
                              )}`
                            }
                            alt={item.name || "User"}
                            width={40}
                            height={40}
                            className={`shrink-0 aspect-square object-cover ${
                              item.imageShape === "square"
                                ? "rounded-lg"
                                : "rounded-full"
                            }`}
                            style={{ objectFit: "cover" }}
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">{item.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column Content */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data?.stats && data.stats.length > 0 ? (
                data.stats.slice(1, 5).map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    viewport={{ once: true }}
                    className={`p-6 rounded-2xl flex flex-col justify-between overflow-hidden relative ${
                      !stat.backgroundImage ? "bg-slate-100" : ""
                    }`}
                    style={{
                      backgroundColor: stat.backgroundColor,
                    }}
                  >
                    {stat.backgroundImage && (
                      <>
                        <Image
                          src={stat.backgroundImage}
                          alt="bg"
                          layout="fill"
                          objectFit="cover"
                          className="z-0"
                        />
                        <div className="absolute inset-0 bg-black/20 z-0"></div>
                      </>
                    )}

                    <div className="z-10 relative">
                      {stat.innerImages &&
                      stat.innerImages.filter((img) => img).length > 0 ? (
                        <div className="flex -space-x-4 mb-4">
                          {stat.innerImages
                            .filter((img) => img)
                            .map((img, idx) => (
                              <Image
                                key={idx}
                                src={img}
                                alt="icon"
                                width={52}
                                height={52}
                                className={`shrink-0 aspect-square object-cover ${
                                  stat.imageShape === "square"
                                    ? "rounded-lg"
                                    : "rounded-full"
                                }`}
                                style={{
                                  minWidth: "52px",
                                  minHeight: "52px",
                                  objectFit: "cover",
                                }}
                              />
                            ))}
                        </div>
                      ) : (
                        stat.innerImage && (
                          <div className="mb-4">
                            <Image
                              src={stat.innerImage}
                              alt="icon"
                              width={52}
                              height={52}
                              objectFit="contain"
                            />
                          </div>
                        )
                      )}
                      <h3
                        className={`text-4xl font-bold mt-4 ${
                          stat.backgroundImage ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <Counter
                          value={stat.count || 0}
                          suffix={stat.suffix || ""}
                        />
                      </h3>
                      <p
                        className={`${
                          stat.backgroundImage ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {stat.title}
                      </p>
                    </div>

                    {stat.buttonLink ? (
                      <a
                        href={stat.buttonLink}
                        className={`z-10 mt-4 h-10 flex items-center justify-center rounded-lg px-4 text-sm font-semibold transition-opacity hover:opacity-90 
                                     ${
                                       stat.buttonText &&
                                       stat.buttonText.length > 0
                                         ? "w-full"
                                         : "w-10"
                                     }
                                     `}
                        style={{
                          backgroundColor: stat.backgroundImage
                            ? "#BFBFBF"
                            : stat.backgroundColor
                            ? "#00000033"
                            : "#C86C6C",
                          color: stat.backgroundImage ? "black" : "inherit",
                        }}
                      >
                        {stat.buttonText ? (
                          <>
                            {stat.buttonText} <FiArrowRight className="ml-2" />
                          </>
                        ) : (
                          <FaPlus />
                        )}
                      </a>
                    ) : (
                      <button
                        className={`z-10 mt-4 h-10 flex items-center justify-center rounded-lg px-4 text-sm font-semibold 
                                    ${
                                      stat.buttonText &&
                                      stat.buttonText.length > 0
                                        ? "w-full"
                                        : "w-10"
                                    }
                                `}
                        style={{
                          backgroundColor: stat.backgroundImage
                            ? "#BFBFBF"
                            : stat.backgroundColor
                            ? "rgba(0,0,0,0.2)"
                            : "#C86C6C",
                          color: stat.backgroundImage ? "black" : "white",
                        }}
                      >
                        {stat.buttonText ? (
                          <>
                            {stat.buttonText} <FiArrowRight className="ml-2" />
                          </>
                        ) : (
                          <FaPlus />
                        )}
                      </button>
                    )}
                  </motion.div>
                ))
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-[#FFC6C6] p-6 rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex -space-x-8">
                        <Image
                          src="/images/pages/homepage/homeicon/flagindia.png"
                          alt="flag 1"
                          width={52}
                          height={52}
                        />
                        <Image
                          src="/images/pages/homepage/homeicon/flag2.png"
                          alt="flag 1"
                          width={52}
                          height={52}
                        />
                        <Image
                          src="/images/pages/homepage/homeicon/flag3.png"
                          alt="flag 1"
                          width={52}
                          height={52}
                        />
                        <Image
                          src="/images/pages/homepage/homeicon/flag4.png"
                          alt="flag 1"
                          width={52}
                          height={52}
                        />
                      </div>
                      <h3 className="text-4xl font-bold mt-4">
                        <Counter value={33} suffix="+" />
                      </h3>
                      <p>Countries Trust Us</p>
                    </div>
                    <button className="bg-[#C86C6C] rounded-lg w-10 h-10 flex items-center justify-center mt-4 text-white">
                      <FaPlus />
                    </button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    viewport={{ once: true }}
                    className="bg-[#E5F69D] p-6 rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex -space-x-6">
                        <Image
                          src="/images/icon/roundedTeamIcon.png"
                          alt="logo 1"
                          width={52}
                          height={52}
                        />
                        <Image
                          src="/images/icon/roundedsafe.png"
                          alt="logo 1"
                          width={52}
                          height={52}
                        />
                        <Image
                          src="/images/icon/roundedgoogle.png"
                          alt="logo 1"
                          width={52}
                          height={52}
                        />
                        <Image
                          src="/images/icon/roundedcloud.png"
                          alt="logo 1"
                          width={52}
                          height={52}
                        />
                      </div>
                      <h3 className="text-4xl font-bold mt-4">
                        <Counter value={100} suffix="+" />
                      </h3>
                      <p>Software solution</p>
                    </div>
                    <button className="bg-[#A0B643] text-white rounded-lg w-full h-10 flex items-center justify-center mt-4 text-sm font-semibold">
                      Check solutions <FiArrowRight className="ml-2" />
                    </button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="relative bg-cover bg-center bg-[url('/images/pages/homepage/innovationbg.png')] p-6 rounded-2xl flex flex-col justify-end"
                  >
                    <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
                    <div className="text-white z-4">
                      <h3 className="text-4xl font-bold mt-4">
                        <Counter value={10} suffix="+" />
                      </h3>
                      <p>Years of Innovation</p>
                    </div>
                    <button className="z-4 bg-[#BFBFBF] rounded-lg w-10 h-10 flex items-center justify-center mt-4 text-[black]">
                      <FaPlus />
                    </button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    viewport={{ once: true }}
                    className="bg-[#C1D5FF] p-6 rounded-2xl flex flex-col justify-between"
                  >
                    <div>
                      <Image
                        src="https://placehold.co/40x40/4A90E2/fff?text=U"
                        alt="users logo"
                        width={40}
                        height={40}
                        className="rounded-lg"
                      />
                      <h3 className="text-4xl font-bold mt-4">
                        <Counter value={300} suffix="K+" />
                      </h3>
                      <p>Happy Users</p>
                    </div>
                    <button className="bg-[#C86C6C] rounded-lg w-10 h-10 flex items-center justify-center mt-4 text-white">
                      <FaPlus />
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
