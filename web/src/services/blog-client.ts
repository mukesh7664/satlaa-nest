import { BlogPost } from "@/types/blog";
import { ApiPost, transformPost } from "./blog-core";

// Client-side blog service for "use client" components. Fetches the public API
// directly from the browser.
// Re-export the shared date helper for client-side callers.
export { formatBlogDate } from "./blog-core";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export async function getRecentPosts(count: number = 4): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/blog/posts?page=1&perPage=${count}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    const data: { posts: ApiPost[] } = await res.json();
    return (data.posts || []).map(transformPost);
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    return [];
  }
}
