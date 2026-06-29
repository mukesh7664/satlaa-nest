import React from "react";
import Link from "next/link";
import { PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProductNotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-white">
      <div className="bg-blue-50 p-6 rounded-full mb-6 animate-in fade-in zoom-in duration-500">
        <PackageX className="h-16 w-16 text-blue-600" />
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
        Uff.. this product not found
      </h1>

      <p className="text-slate-500 max-w-md mb-8 text-lg">
        We couldn&apos;t find the product you&apos;re looking for. It might have
        been removed, renamed, or doesn&apos;t exist.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/products">
          <Button
            size="lg"
            className="bg-[#004DAA] hover:bg-blue-700 min-w-[200px]"
          >
            Browse All Products
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="lg" className="min-w-[200px]">
            Go to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductNotFound;
