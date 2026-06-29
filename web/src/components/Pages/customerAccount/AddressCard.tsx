"use client";

import { Edit3, Trash2, CheckCircle, MapPin, Phone, Home, Briefcase, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Address {
  id?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  street?: string;
  landmark?: string;
  city?: string;
  state?: string;
  country: string;
  pincode?: string;
  type: "shipping" | "billing" | "both";
  label?: string;
  isDefault?: boolean;
}

interface AddressCardProps {
  address: Address;
  onEdit?: (addressId: string) => void;
  onDelete?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <div className={cn(
      "group relative bg-white rounded-2xl border transition-all duration-300 p-8",
      address.isDefault ? "border-blue-600 shadow-md shadow-blue-50" : "border-slate-100 shadow-sm hover:border-blue-200"
    )}>
      {/* Badge Section */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
            {address.type === "shipping" ? <Home size={12} /> : address.type === "billing" ? <Briefcase size={12} /> : <Globe size={12} />}
            {address.type}
          </div>
          {address.isDefault && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-wider">
              <CheckCircle size={12} />
              Primary
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <button 
              onClick={() => onEdit(address.id!)}
              className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Edit3 size={18} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(address.id!)}
              className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-1">{address.fullName || address.label || "Untitled Address"}</h3>
          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
            <Phone size={14} className="text-blue-600" />
            {address.phone || "No phone provided"}
          </div>
        </div>

        <div className="flex gap-3 text-slate-600">
          <MapPin size={18} className="shrink-0 text-slate-300 mt-1" />
          <div className="text-sm font-medium leading-relaxed">
            <p>{address.street}</p>
            {address.landmark && <p className="text-slate-400">{address.landmark}</p>}
            <p>{address.city}, {address.state} {address.pincode}</p>
            <p className="font-black text-slate-900 mt-1 uppercase tracking-widest text-[10px]">{address.country}</p>
          </div>
        </div>
      </div>

      {/* Set Default Action */}
      {onSetDefault && !address.isDefault && (
        <div className="mt-8 pt-6 border-t border-slate-50">
          <Button
            variant="ghost"
            onClick={() => onSetDefault(address.id!)}
            className="w-full rounded-xl h-12 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:bg-blue-50"
          >
            Set as Primary Address
          </Button>
        </div>
      )}
    </div>
  );
}
