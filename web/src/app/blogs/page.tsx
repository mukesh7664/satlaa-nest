import { Metadata } from "next";
import { getPosts, getCategories } from "@/services/blog";
import { BlogCard, Pagination, CategoryList } from "@/components/Pages/Blog";

export const metadata: Metadata = {
  title: "Blog - EPxWEB",
  description:
    "Stay informed with expert articles covering industry insights and proven strategies for software solutions.",
};

interface BlogsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const [{ posts, pagination }, categories] = await Promise.all([
    getPosts(currentPage, 9),
    getCategories(),
  ]);

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#004DAA] to-[#4988FF] py-16">
        <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Blog
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Stay informed with expert articles covering industry insights and
            proven strategies
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container-xl px-4 sm:px-8 md:px-10 lg:px-20 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <CategoryList categories={categories} />
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No posts found.</p>
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
                  <Pagination pagination={pagination} basePath="/blogs" />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
