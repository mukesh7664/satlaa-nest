import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/types/blog";
import { formatBlogDate } from "@/services/blog-core";

interface BlogCardProps {
  post: BlogPost;
  variant?: "featured" | "default" | "horizontal";
}

const ArticleTag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block bg-gray-100/80 border border-gray-200/80 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
    {children}
  </span>
);

export function BlogCard({ post, variant = "default" }: BlogCardProps) {
  const formattedDate = formatBlogDate(post.date);
  const categoryNames = post.categories?.map((cat) => cat.name) || [];
  const tagNames = post.tags?.map((tag) => tag.name) || [];
  const allTags = [...categoryNames, ...tagNames].slice(0, 3);


  if (variant === "featured") {
    return (
      <div>
        <Link href={`/blogs/${post.slug}`} className="block">
          <div className="relative w-full h-80 rounded-xl overflow-hidden mb-6">
            {post.featuredImage ? (
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt}
                fill
                quality={100}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
        </Link>
        <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>
        <Link href={`/blogs/${post.slug}`}>
          <h3 className="text-2xl font-bold text-gray-800 mb-3 hover:text-[#004DAA] transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-4">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map((tag) => (
            <ArticleTag key={tag}>{tag}</ArticleTag>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link href={`/blogs/${post.slug}`} className="block">
          <div className="relative w-full h-full min-h-[150px] rounded-xl overflow-hidden">
            {post.featuredImage ? (
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt}
                fill
                quality={100}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
          </div>
        </Link>
        <div>
          <p className="text-sm text-gray-500 mb-1.5">{formattedDate}</p>
          <Link href={`/blogs/${post.slug}`}>
            <h4 className="font-bold text-gray-800 mb-2 hover:text-[#004DAA] transition-colors line-clamp-2">
              {post.title}
            </h4>
          </Link>
          <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <ArticleTag key={tag}>{tag}</ArticleTag>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/blogs/${post.slug}`} className="block">
        <div className="relative w-full h-48">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt}
              fill
              quality={100}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>
        <Link href={`/blogs/${post.slug}`}>
          <h3 className="text-lg font-bold text-gray-800 mb-2 hover:text-[#004DAA] transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <ArticleTag key={tag}>{tag}</ArticleTag>
          ))}
        </div>
      </div>
    </div>
  );
}
