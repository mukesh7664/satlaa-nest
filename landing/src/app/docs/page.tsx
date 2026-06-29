import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function DocsIndexPage() {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-blue-950 mb-4 tracking-tight">
          Welcome to the Help Center
        </h1>
        <p className="text-lg text-blue-800/80 max-w-2xl mx-auto mb-8">
          Find comprehensive guides, tutorials, and API documentation to help you get the most out of our platform.
        </p>

        <div className="max-w-xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 border-none border-blue-200 outline-none rounded-xl text-gray-900 bg-white shadow-xl shadow-blue-100/50 focus:ring-4 focus:ring-blue-100 transition-shadow placeholder-gray-400 text-lg"
            placeholder="Search documentation..."
          />
        </div>
      </div>

    </div>
  );
}
