import { BlogPost, BlogCategory } from "@/types/blog";

// Shared, dependency-free helpers used by both the server service
// (services/blog.ts) and the client service (services/blog-client.ts).
// Keep this module free of `next/headers` or any server-only import so it
// can be bundled into client components (e.g. BlogCard).

// ─── API response shapes (NestJS BlogModule) ─────────────────────────────────

export interface ApiTerm {
  id: string;
  name: string;
  slug: string;
}

export interface ApiPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  authorName: string | null;
  status: string;
  publishedAt: string | null;
  seo: Record<string, any> | null;
  categories?: ApiTerm[];
  tags?: ApiTerm[];
  createdAt: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count?: number;
}

// ─── Mappers ──────────────────────────────────────────────────────────────

export function transformPost(post: ApiPost): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content || "",
    date: post.publishedAt || post.createdAt,
    featuredImage: post.coverImage,
    featuredImageAlt: post.coverImageAlt || post.title,
    author: {
      name: post.authorName || "Anonymous",
      avatar: "",
    },
    categories: (post.categories || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    tags: (post.tags || []).map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
    })),
  };
}

export function transformCategory(category: ApiCategory): BlogCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    count: category.count ?? 0,
  };
}

// Format date for display
export function formatBlogDate(dateString: string): string {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}
