import { getRecentPosts } from "@/services/blog-client";
import { ArticlesSectionClient } from "@/components/Pages/Homepage/BlogsClient";

// --- Main Articles Section Component ---
export interface ArticlesSectionProps {
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

export default async function ArticlesSection({ data, sectionIndex }: ArticlesSectionProps) {
  if (data?.show === false) return null;

  let posts: any[] = [];
  try {
    posts = await getRecentPosts(4);
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return null; // Gracefully hide section if WordPress is unavailable
  }

  if (!posts || posts.length === 0) return null;

  return <ArticlesSectionClient posts={posts} data={data} sectionIndex={sectionIndex} />;
}
