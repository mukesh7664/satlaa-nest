import Link from 'next/link';
import { BlogCategory } from '@/types/blog';

interface CategoryListProps {
  categories: BlogCategory[];
  activeSlug?: string;
}

export function CategoryList({ categories, activeSlug }: CategoryListProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Categories</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href="/blogs"
            className={`block px-3 py-2 rounded-lg transition-colors ${
              !activeSlug
                ? 'bg-[#004DAA] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Posts
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/blogs/category/${category.slug}`}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                activeSlug === category.slug
                  ? 'bg-[#004DAA] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{category.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeSlug === category.slug
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {category.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
