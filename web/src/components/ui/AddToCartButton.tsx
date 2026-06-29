import React from "react";

interface AddToCartButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isLoading?: boolean;
  iconPath?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  children,
  isLoading,
  className,
  disabled,
  iconPath = "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z",
  ...props
}) => {
  return (
    <button
      className={`group/addbtn relative flex items-center justify-center gap-1 px-6 py-1 lg:py-2 border border-[#004DAA] text-base font-semibold text-white cursor-pointer overflow-hidden transition-all duration-600 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-sm hover:text-[#004DAA] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none w-full ${
        className || ""
      }`}
      disabled={isLoading || disabled}
      {...props}
    >
      <span className="relative z-10 -translate-x-3 transition-all duration-800 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/addbtn:translate-x-3">
        {isLoading ? "Adding..." : children || "Add to Cart"}
      </span>

      {/* Circle background effect - Starts filled (big), shrinks on hover */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#004DAA] transition-all duration-800 ease-[cubic-bezier(0.23,1,0.32,1)] w-[300%] h-[300%] opacity-100 rounded-none group-hover/addbtn:w-0 group-hover/addbtn:h-0 group-hover/addbtn:opacity-0 group-hover/addbtn:rounded-full"></span>

      {/* Icon 1 - visible initially (White), moves right on hover (Blue) */}
      <svg
        className="absolute w-5 h-5 fill-white z-10 transition-all duration-800 ease-[cubic-bezier(0.23,1,0.32,1)] right-4 group-hover/addbtn:right-[-25%] group-hover/addbtn:fill-[#004DAA]"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={iconPath} />
      </svg>

      {/* Icon 2 - hidden initially (left), moves in on hover (Blue) */}
      <svg
        className="absolute w-5 h-5 fill-white z-10 transition-all duration-800 ease-[cubic-bezier(0.23,1,0.32,1)] left-[-25%] group-hover/addbtn:left-4 group-hover/addbtn:fill-[#004DAA]"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={iconPath} />
      </svg>
    </button>
  );
};
