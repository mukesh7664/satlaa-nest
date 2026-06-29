"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React, { useEffect, useState } from "react";
import { getRecentPosts } from "@/services/blog-client";
import { BlogCard } from "@/components/Pages/Blog";
import { BlogPost } from "@/types/blog";

export interface BlogRecentProps {
  sectionIndex?: number;
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
    bgType?: "image" | "color" | "gradient";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
    blogImage?: string;
    manualPosts?: {
      image?: string;
      title?: string;
      slug?: string;
    }[];
  };
}

export default function BlogRecent({ data, sectionIndex }: BlogRecentProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data?.show === false) return;

    const fetchPosts = async () => {
      try {
        if (data?.manualPosts && data.manualPosts.some((p: any) => p.title || p.image)) {
          const manual = data.manualPosts
            .filter((p: any) => p.title || p.image)
            .map((p: any, idx: number) => ({
              id: `manual-${idx + 1}`,
              slug: p.slug || `manual-post-${idx + 1}`,
              title: p.title || "Manual Post",
              excerpt: "",
              content: "",
              featuredImage: p.image || null,
              featuredImageAlt: p.title || "Manual Post",
              date: new Date().toISOString(),
              author: { name: "Manual", avatar: "" },
              categories: [],
              tags: []
            }));
          setPosts(manual);
        } else {
          const recent = await getRecentPosts(3);
          if (recent && recent.length > 0) {
            setPosts(recent);
          }
        }
      } catch (error) {
        console.error("Failed to fetch recent blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [data?.show, data?.manualPosts]);

  if (data?.show === false) return null;

  // Default dummy data if no posts yet
  const dummyPosts: BlogPost[] = [
    {
      id: "1",
      slug: "unlocking-pos-potential",
      title: "Beyond Transactions: Unlocking the Full Potential of Your POS System",
      excerpt: "In the realm of modern business operations, a Point of Sale (POS) system serves as more than just a tool for processing transactions...",
      content: "",
      featuredImage: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop",
      featuredImageAlt: "Modern POS System",
      date: "2024-04-20T10:00:00Z",
      author: { name: "Sam Pitak", avatar: "" },
      categories: [{ id: "1", name: "POS", slug: "pos" }],
      tags: [{ id: "1", name: "Business", slug: "business" }]
    },
    {
      id: "2",
      slug: "online-storefront-integration",
      title: "From Brick-and-Mortar to Online Storefront: Integrating Your Business",
      excerpt: "In the realm of modern business operations, a Point of Sale (POS) system serves as more than just a tool...",
      content: "",
      featuredImage: "https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=2070&auto=format&fit=crop",
      featuredImageAlt: "Online Storefront",
      date: "2024-04-20T11:00:00Z",
      author: { name: "Yuli Sumpil", avatar: "" },
      categories: [{ id: "1", name: "POS", slug: "pos" }],
      tags: [{ id: "2", name: "Retail", slug: "retail" }]
    },
    {
      id: "3",
      slug: "security-first-pos",
      title: "Security First: Protecting Your Business with Advanced POS Systems",
      excerpt: "One of the primary functions of a POS system is to process transactions and handle sensitive customer data...",
      content: "",
      featuredImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop",
      featuredImageAlt: "POS Security",
      date: "2024-04-20T12:00:00Z",
      author: { name: "Ambon Fanda", avatar: "" },
      categories: [{ id: "1", name: "POS", slug: "pos" }],
      tags: [{ id: "3", name: "Security", slug: "security" }]
    }
  ];

  const activePosts = posts.length > 0 ? posts : dummyPosts;

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

  const title = data?.title || "Our Recent Articles";
  const subtitle = data?.subtitle || "Stay Informed with Our Latest Insights";

  return (
    <section className="py-20" style={sectionStyle}>
      <div className="container px-4 mx-auto">
        <div className="flex flex-wrap items-end justify-between mb-12">
          <div className="w-full md:w-auto mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
            </h2>
            <p className="text-gray-600">
              <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activePosts.slice(0, 3).map((post, idx) => (
            <div key={post.id || idx}>
              <BlogCard post={post} variant="default" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
