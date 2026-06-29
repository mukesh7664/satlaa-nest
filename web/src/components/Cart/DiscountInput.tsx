"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface DiscountInputProps {
  onApply: (code: string) => Promise<void>;
  onRemove: () => void;
  appliedDiscount?: string;
  isLoading?: boolean;
}

export function DiscountInput({
  onApply,
  onRemove,
  appliedDiscount,
  isLoading = false,
}: DiscountInputProps) {
  const [code, setCode] = useState("");

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error("Please enter a discount code");
      return;
    }
    await onApply(code);
    setCode("");
  };

  if (appliedDiscount) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-700">
          <Tag className="h-4 w-4" />
          <span className="font-medium">Discount applied: {appliedDiscount}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-green-700 hover:text-green-800 hover:bg-green-100 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Enter discount code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleApply();
            }
          }}
        />
        <Button
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[80px]"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
    </div>
  );
}
