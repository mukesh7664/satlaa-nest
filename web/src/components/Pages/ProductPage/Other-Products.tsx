import {
  OtherProductsCard,
  OtherProductsCardProps,
} from "@/components/Cards/OtherProductsCard";
import React from "react";

interface OtherProductsProps {
  otherProducts: {
    title: string;
    products: OtherProductsCardProps[];
  };
}

const OtherProducts: React.FC<OtherProductsProps> = ({ otherProducts }) => {
  return (
    <div className="mx-auto xl:mx-4 bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-6 mb-6">
      <h2 className="text-xl font-bold text-left mb-4 text-gray-800">
        {otherProducts.title}
      </h2>
      <hr className="border-gray-100 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {otherProducts.products.map((product, index) => (
          <OtherProductsCard key={index} {...product} />
        ))}
      </div>
    </div>
  );
};

export default OtherProducts;
