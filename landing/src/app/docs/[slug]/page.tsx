import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, Calendar } from 'lucide-react';
import ClientTableOfContents from './ClientTableOfContents';

async function getDocument(slug: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api/v1'}/documentation/${slug}`, {
            cache: 'no-store' // Use revalidate in production
        });
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to fetch');
        }
        return await res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const doc = await getDocument(slug);

    if (!doc) {
        notFound();
    }

    const { title, content, category, updatedAt } = doc;
    const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    return (
        <div className="flex flex-col xl:flex-row gap-10 lg:pl-10">
            {/* Main Content */}
            <article className="flex-1 min-w-0 max-w-4xl mx-auto xl:mx-0 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm font-medium text-gray-500 mb-8 whitespace-nowrap overflow-x-auto no-scrollbar">
                    <Link href="/docs" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        Docs
                    </Link>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-300 flex-shrink-0" />
                    <span className="truncate hover:text-gray-700 cursor-default">{category}</span>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-300 flex-shrink-0" />
                    <span className="text-gray-900 truncate">{title}</span>
                </nav>

                <header className="mb-10 pb-10 border-b border-gray-100">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                        {title}
                    </h1>
                    <div className="flex items-center text-sm text-gray-500 gap-2">
                        <Calendar className="w-4 h-4" />
                        Last updated {formattedDate}
                    </div>
                </header>

                <div 
                    className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-slate-900 prose-a:font-medium prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-p:leading-relaxed prose-p:text-slate-700 prose-ul:my-2 prose-li:my-0 pb-20"
                    dangerouslySetInnerHTML={{ __html: content }} 
                />
            </article>

            {/* Right Sidebar - Table of Contents */}
            <aside className="hidden xl:block w-72 flex-shrink-0">
                <div className="sticky top-24">
                    <ClientTableOfContents htmlContent={content} />
                </div>
            </aside>
        </div>
    );
}
