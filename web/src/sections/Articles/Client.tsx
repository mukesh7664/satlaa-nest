"use client";

import React, { useEffect, useState } from "react";
import { getRecentPosts } from "@/services/blog-client";
import { ArticlesSectionClient } from "@/components/Pages/Homepage/BlogsClient";

export interface ArticlesSectionProps {
  data?: {
    show: boolean;
    title?: string;
    subtitle?: string;
  };
  sectionIndex?: number;
}

export default function ArticlesSection({ data, sectionIndex }: ArticlesSectionProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data?.show === false) return;

    const fetchPosts = async () => {
      try {
        const recent = await getRecentPosts(4);
        setPosts(recent);
      } catch (error) {
        console.error("Failed to fetch posts for preview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [data?.show]);

  if (data?.show === false) return null;
  if (loading)
    return (
      <div className="p-8 text-center text-gray-400">Loading Articles...</div>
    );

  return <ArticlesSectionClient posts={posts} data={data} sectionIndex={sectionIndex} />;
}
