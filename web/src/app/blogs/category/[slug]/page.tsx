import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPostsByCategory,
  getCategories,
  getCategoryBySlug,
} from "@/services/blog";
import { BlogCard, Pagination, CategoryList } from "@/components/Pages/Blog";

// Multi-tenant: the store is resolved from the request host header, so this
// page must render per-request (not be prerendered statically).
export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found - EPxWEB",
    };
  }

  return {
    title: `${category.name} - EPxWEB Blog`,
    description:
      category.description ||
      `Browse all articles in ${category.name} category.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [{ posts, pagination }, categories] = await Promise.all([
    getPostsByCategory(category.slug, currentPage, 9),
    getCategories(),
  ]);

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#004DAA] to-[#4988FF] py-16">
        <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
          <p className="text-sm text-white/70 mt-4">
            {category.count} {category.count === 1 ? "article" : "articles"}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <CategoryList categories={categories} activeSlug={slug} />
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No posts found in this category.
                  </p>
                </div>
              ) : (
                <>
                  {/* Posts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {posts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    pagination={pagination}
                    basePath={`/blogs/category/${slug}`}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
