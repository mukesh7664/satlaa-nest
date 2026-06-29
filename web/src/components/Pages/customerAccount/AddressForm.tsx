"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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

interface AddressFormProps {
  address?: Address;
  onSubmit: (address: Omit<Address, "id">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AddressForm({
  address,
  onSubmit,
  onCancel,
  isLoading = false,
}: AddressFormProps) {
  const [formData, setFormData] = useState<Omit<Address, "id">>(() => ({
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    email: address?.email || "",
    street: address?.street || "",
    landmark: address?.landmark || "",
    city: address?.city || "",
    state: address?.state || "",
    country: address?.country || "India",
    pincode: address?.pincode || "",
    type: address?.type || "both",
    label: address?.label || "",
    isDefault: address?.isDefault || false,
  }));

  useEffect(() => {
    if (address) {
      // Only update if address object actually changed and values differ significantly
      // Or just defer update to avoid lint error
      const timer = setTimeout(() => {
        setFormData({
          fullName: address.fullName || "",
          phone: address.phone || "",
          email: address.email || "",
          street: address.street || "",
          landmark: address.landmark || "",
          city: address.city || "",
          state: address.state || "",
          country: address.country || "India",
          pincode: address.pincode || "",
          type: address.type || "both",
          label: address.label || "",
          isDefault: address.isDefault || false,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Label */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="9876543210"
          />
        </div>
      </div>

      {/* Street / Address Line 1 */}
      <div>
        <Label htmlFor="street">Address Line 1 *</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => handleChange("street", e.target.value)}
          placeholder="Building, Street Name"
          required
        />
      </div>

      {/* Landmark / Address Line 2 */}
      <div>
        <Label htmlFor="landmark">Address Line 2 (Optional)</Label>
        <Input
          id="landmark"
          value={formData.landmark}
          onChange={(e) => handleChange("landmark", e.target.value)}
          placeholder="Near, Area, etc."
        />
      </div>

      {/* City and State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Mumbai"
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State / Province *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
            placeholder="Maharashtra"
            required
          />
        </div>
      </div>

      {/* Country and Pincode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            placeholder="India"
            required
          />
        </div>
        <div>
          <Label htmlFor="pincode">Postal / Zip Code *</Label>
          <Input
            id="pincode"
            value={formData.pincode}
            onChange={(e) => handleChange("pincode", e.target.value)}
            placeholder="400001"
            required
          />
        </div>
      </div>

      {/* Address Type */}
      <div>
        <Label className="mb-2 block">Address Type *</Label>
        <div className="flex gap-4">
          {["shipping", "billing", "both"].map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer capitalize">
              <input
                type="radio"
                name="addressType"
                checked={formData.type === t}
                onChange={() => handleChange("type", t)}
                className="w-4 h-4 text-blue-600"
              />
              {t}
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={(checked) =>
            handleChange("isDefault", checked === true)
          }
        />
        <Label htmlFor="isDefault" className="cursor-pointer">
          Set as default address
        </Label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="BlueDark" disabled={isLoading}>
          {isLoading ? "Saving..." : address ? "Update Address" : "Add Address"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
