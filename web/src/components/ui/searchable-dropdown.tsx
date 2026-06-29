"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X, ChevronDown } from "lucide-react";
import Image from "next/image";

interface DropdownOption {
  _id: string;
  name?: string;
  title?: string;
  logo?: { url?: string };
  icon?: { url?: string };
  productInfo?: { title?: string };
}

interface SearchableDropdownProps {
  placeholder?: string;
  value?: DropdownOption | null;
  onChange: (option: DropdownOption | null) => void;
  onSearch: (query: string) => Promise<DropdownOption[]>;
  disabled?: boolean;
  label?: string;
  displayField?: "name" | "title" | "productInfo.title";
  imageField?: "logo" | "icon";
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  disabled = false,
  label,
  displayField = "name",
  imageField = "logo",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length >= 2) {
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await onSearch(searchQuery);
          setOptions(results);
        } catch (error) {
          console.error("Search error:", error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setOptions([]);
      setLoading(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, onSearch]);

  const getDisplayName = (option: DropdownOption): string => {
    if (displayField === "productInfo.title") {
      return option.productInfo?.title || "Untitled";
    }
    return option.name || option.title || "Untitled";
  };

  const getImageUrl = (option: DropdownOption): string | null => {
    if (imageField === "logo" && option.logo?.url) {
      return option.logo.url;
    }
    if (imageField === "icon" && option.icon?.url) {
      return option.icon.url;
    }
    return null;
  };

  const handleSelect = (option: DropdownOption) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery("");
    setOptions([]);
  };

  const handleClear = () => {
    onChange(null);
    setSearchQuery("");
    setOptions([]);
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Selected value display or search input */}
        {value && !isOpen ? (
          <div
            className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400"
            onClick={() => !disabled && setIsOpen(true)}
          >
            <div className="flex items-center gap-2">
              {getImageUrl(value) && (
                <Image
                  src={getImageUrl(value)!}
                  alt={getDisplayName(value)}
                  width={24}
                  height={24}
                  className="rounded"
                />
              )}
              <span className="text-sm text-gray-900">{getDisplayName(value)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              disabled={disabled}
              className="pl-10 pr-10"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>
        )}

        {/* Dropdown options */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : options.length > 0 ? (
              <ul className="py-1">
                {options.map((option) => (
                  <li
                    key={option._id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelect(option)}
                  >
                    {getImageUrl(option) && (
                      <Image
                        src={getImageUrl(option)!}
                        alt={getDisplayName(option)}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                    )}
                    <span className="text-sm text-gray-900">
                      {getDisplayName(option)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : searchQuery.length >= 2 ? (
              <div className="py-4 text-center text-sm text-gray-500">
                No results found
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">
                Type at least 2 characters to search
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
