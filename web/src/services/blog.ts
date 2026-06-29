import { BlogListResponse, PaginationInfo, BlogPost, BlogCategory } from "@/types/blog";
import { fetchServer } from "@/lib/api/server-fetch";
import {
  ApiPost,
  ApiCategory,
  transformPost,
  transformCategory,
} from "./blog-core";

// Server-only blog service. Uses fetchServer (next/headers) so it must NOT be
// imported by client components — those use services/blog-client.ts instead.
// Re-export the shared date helper for server-side callers.
export { formatBlogDate } from "./blog-core";

function emptyList(page: number, perPage: number): BlogListResponse {
  return {
    posts: [],
    pagination: { currentPage: page, totalPages: 0, totalPosts: 0, perPage },
  };
}

export async function getPosts(
  page: number = 1,
  perPage: number = 9
): Promise<BlogListResponse> {
  try {
    const res = await fetchServer(`/blog/posts?page=${page}&perPage=${perPage}`);
    if (!res.ok) return emptyList(page, perPage);

    const data: { posts: ApiPost[]; pagination: PaginationInfo } = await res.json();
    return {
      posts: (data.posts || []).map(transformPost),
      pagination:
        data.pagination || { currentPage: page, totalPages: 0, totalPosts: 0, perPage },
    };
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return emptyList(page, perPage);
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const res = await fetchServer(`/blog/posts/slugs`);
    if (!res.ok) return [];
    const slugs: string[] = await res.json();
    return Array.isArray(slugs) ? slugs : [];
  } catch (error) {
    console.error("Error fetching post slugs for static generation:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetchServer(`/blog/posts/${slug}`);
    if (!res.ok) return null;
    const post: ApiPost = await res.json();
    if (!post || !post.id) return null;
    return transformPost(post);
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

export async function getCategories(): Promise<BlogCategory[]> {
  try {
    const res = await fetchServer(`/blog/categories`);
    if (!res.ok) return [];
    const categories: ApiCategory[] = await res.json();
    return (categories || []).map(transformCategory);
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  try {
    const res = await fetchServer(`/blog/categories/${slug}`);
    if (!res.ok) return null;
    const category: ApiCategory = await res.json();
    if (!category || !category.id) return null;
    return transformCategory(category);
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error);
    return null;
  }
}

export async function getPostsByCategory(
  categorySlug: string,
  page: number = 1,
  perPage: number = 9
): Promise<BlogListResponse> {
  try {
    const res = await fetchServer(
      `/blog/posts?category=${encodeURIComponent(categorySlug)}&page=${page}&perPage=${perPage}`
    );
    if (!res.ok) return emptyList(page, perPage);

    const data: { posts: ApiPost[]; pagination: PaginationInfo } = await res.json();
    return {
      posts: (data.posts || []).map(transformPost),
      pagination:
        data.pagination || { currentPage: page, totalPages: 0, totalPosts: 0, perPage },
    };
  } catch (error) {
    console.error("Error fetching posts by category:", error);
    return emptyList(page, perPage);
  }
}

export async function getRelatedPosts(slug: string, limit: number = 3): Promise<BlogPost[]> {
  try {
    const res = await fetchServer(`/blog/posts/${slug}/related?limit=${limit}`);
    if (!res.ok) return [];
    const posts: ApiPost[] = await res.json();
    return (posts || []).map(transformPost);
  } catch (error) {
    console.error(`Error fetching related posts for ${slug}:`, error);
    return [];
  }
}

export async function getRecentPosts(count: number = 4): Promise<BlogPost[]> {
  const { posts } = await getPosts(1, count);
  return posts;
}
