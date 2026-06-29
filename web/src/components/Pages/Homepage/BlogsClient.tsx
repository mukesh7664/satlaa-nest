"use client";

import Link from "next/link";
import { BlogCard } from "@/components/Pages/Blog";
import { motion } from "motion/react";
import { BlogPost } from "@/types/blog";
import { InlineEditable } from "@/components/InlineEditable";

interface ArticlesSectionClientProps {
  posts: BlogPost[];
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    // Background Options
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
  sectionIndex?: number;
}

export function ArticlesSectionClient({
  posts,
  data,
  sectionIndex,
}: ArticlesSectionClientProps) {
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
    sectionStyle.backgroundColor = "#F2F8F9";
  }

  const renderTitle = () => {
    return <InlineEditable tag="span" value={data?.title || "Explore our Articles"} fieldPath="title" sectionIndex={sectionIndex} />;
  };

  const renderSubtitle = () => {
    return <InlineEditable tag="span" value={data?.subtitle || "Stay Informed with Expert Articles Covering Industry Insights and Proven Strategies"} fieldPath="subtitle" sectionIndex={sectionIndex} />;
  };

  if (posts.length === 0) {
    return (
      <section className="py-10 overflow-hidden mt-16" style={sectionStyle}>
        <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto">
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="font-semibold text-4xl md:text-5xl leading-tight tracking-[0%] text-center align-middle text-gray-900 mb-3"
            >
              {renderTitle()}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="mx-auto text-base text-gray-600"
            >
              {renderSubtitle()}
            </motion.div>
          </div>
          <div className="text-center text-gray-500">
            <p>No articles available at the moment. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  const [featuredPost, ...otherPosts] = posts;

  return (
    <section className="py-20 overflow-hidden mt-16" style={sectionStyle}>
      <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="font-semibold text-4xl md:text-5xl leading-tight tracking-[0%] text-center align-middle text-gray-900 mb-3"
          >
            {renderTitle()}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mx-auto text-base text-gray-600"
          >
            {renderSubtitle()}
          </motion.div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Featured Article */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <BlogCard post={featuredPost} variant="featured" />
            <div className="mt-6">
              <Link href="/blogs">
                <button className="bg-[#004DAA] text-white px-8 py-2 rounded-sm hover:bg-[#003d8a] transition-colors">
                  Explore All Articles
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Other Articles */}
          <div className="flex flex-col gap-6">
            {otherPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.4 + index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
              >
                <BlogCard post={post} variant="horizontal" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
