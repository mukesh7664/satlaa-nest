"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AddressCard } from "@/components/Pages/customerAccount/AddressCard";
import { AddressForm } from "@/components/Pages/customerAccount/AddressForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Plus, Map, Search } from "lucide-react";

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

export default function MyAddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<{ addresses: Address[] }>(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAddresses(response.data.addresses);
    } catch (error) {
      toast.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = () => {
    setEditingAddress(undefined);
    setIsDialogOpen(true);
  };

  const handleEditAddress = (addressId: string) => {
    const address = addresses.find((a) => a.id === addressId);
    if (address) {
      setEditingAddress(address);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/addresses/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/addresses/${addressId}/default`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Default address updated");
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to set default address");
    }
  };

  const handleSubmitAddress = async (addressData: Omit<Address, "id">) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (editingAddress?.id) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/addresses/${editingAddress.id}`, addressData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Address updated successfully");
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/addresses`, addressData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Address added successfully");
      }
      setIsDialogOpen(false);
      setEditingAddress(undefined);
      fetchAddresses();
    } catch (error) {
      toast.error("Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900">Saved Addresses</h1>
          <p className="text-slate-500 font-medium">Manage your shipping and billing locations.</p>
        </div>
        <Button 
          onClick={handleAddAddress}
          className="rounded-full bg-blue-600 hover:bg-blue-700 px-8 py-6 font-black border-none shadow-md shadow-blue-100"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Address
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-blue-600"></div>
          <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">Loading addresses...</p>
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="bg-slate-50 rounded-full p-10 w-fit mx-auto mb-6">
            <Map className="h-16 w-16 text-slate-200" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">No addresses saved</h2>
          <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">Add your shipping and billing addresses to make checkout faster and easier.</p>
          <Button onClick={handleAddAddress} className="rounded-full bg-blue-600 px-8 py-6 font-black">
            Add Your First Address
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-xl">
          <DialogHeader className="p-4">
            <DialogTitle className="text-2xl font-black text-slate-900">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 pt-0">
            <AddressForm
              address={editingAddress}
              onSubmit={handleSubmitAddress}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingAddress(undefined);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
