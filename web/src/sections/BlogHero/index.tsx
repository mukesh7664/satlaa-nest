"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRecentPosts } from "@/services/blog-client";
import { BlogPost } from "@/types/blog";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

export interface BlogHeroProps {
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
    blogImage?: string;
  };
  sectionIndex?: number;
}

export default function BlogHero({ data, sectionIndex }: BlogHeroProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data?.show === false) return;

    const fetchPost = async () => {
      try {
        const posts = await getRecentPosts(1);
        if (posts && posts.length > 0) {
          setPost(posts[0]);
        }
      } catch (error) {
        console.error("Failed to fetch blog hero post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [data?.show]);

  if (data?.show === false) return null;

  const activePost = post || null;

  const sectionStyle: React.CSSProperties = {};
  if (data?.bgType === "color" && data.bgColor) {
    sectionStyle.backgroundColor = data.bgColor;
  } else if (data?.bgType === "gradient" && data.bgGradient) {
    sectionStyle.background = data.bgGradient;
  } else if (data?.bgType === "image" && data.backgroundImage) {
    sectionStyle.backgroundImage = `url('${data.backgroundImage}')`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  }

  const title = data?.title || activePost?.title || "";
  const subtitle = data?.subtitle || activePost?.excerpt || "";

  return (
    <section className="relative py-20 overflow-hidden" style={sectionStyle}>
      <div className="container px-4 mx-auto">
        <div className="flex flex-wrap items-center -mx-4">
          <div className="w-full lg:w-1/2 px-4 mb-12 lg:mb-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <InlineImageEditable
                src={data?.blogImage || activePost?.featuredImage || "/placeholder-blog.jpg"}
                alt={activePost?.featuredImageAlt || activePost?.title || "Blog"}
                width={800}
                height={500}
                fieldPath="blogImage"
                sectionIndex={sectionIndex}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {activePost?.categories?.map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 px-4">
            <div className="max-w-lg lg:ml-auto">
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{activePost?.categories?.[0]?.name || "News"}</span>
                <span>•</span>
                <span>8 mins read</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                 <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
              </p>
              {activePost && (
                <Link href={`/blogs/${activePost.slug || activePost.id}`} className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Read More
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
