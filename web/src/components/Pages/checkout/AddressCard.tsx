"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Edit3, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  type: string;
}

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit?: (address: Address) => void;
}

export function AddressCard({ address, isSelected, onSelect, onEdit }: AddressCardProps) {
  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-3xl border transition-all duration-300 p-5",
        isSelected 
          ? "border-blue-600 bg-blue-50/30 shadow-xl shadow-blue-100/50" 
          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/30"
      )}
      onClick={() => onSelect(address.id)}
    >
      {/* Selection Glow */}
      {isSelected && (
        <div className="absolute -right-6 -top-6 h-16 w-16 bg-blue-600 rounded-full flex items-end justify-start pl-4 pb-4">
          <Check className="text-white h-4 w-4" />
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
          )}>
            <MapPin className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{address.fullName}</span>
            <div className="flex gap-2 items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{address.type || "Home"}</span>
              {address.isDefault && (
                <Badge className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0 border-none font-black uppercase">
                  Default
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(address);
            }}
            className="rounded-full p-2 text-slate-300 transition-all hover:bg-slate-100 hover:text-blue-600"
            title="Edit Address"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>

      <div className="space-y-1 text-sm font-medium text-slate-500">
        <p className="line-clamp-1 pr-4">{address.street}</p>
        {address.landmark && (
          <p className="text-xs italic text-slate-400">{address.landmark}</p>
        )}
        <p className="text-slate-700">
          {address.city}, {address.state} <span className="text-slate-300 mx-1">|</span> {address.pincode}
        </p>
        
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</span>
          <span className="text-slate-900 font-bold tracking-tight">{address.phone}</span>
        </div>
      </div>
    </div>
  );
}
