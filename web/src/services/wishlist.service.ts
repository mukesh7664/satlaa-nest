import axios from "axios";
import { Product } from "@/lib/api/collections";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export interface Wishlist {
  id: string;
  productId: string;
  userId: string;
  storeId: string;
  createdAt: string;
  product?: Product;
}

export const wishlistService = {
  getWishlist: async () => {
    const response = await axios.get<Wishlist[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/wishlist`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  addToWishlist: async (productId: string) => {
    const response = await axios.post<Wishlist>(
      `${process.env.NEXT_PUBLIC_API_URL}/wishlist`,
      { productId },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  removeFromWishlist: async (productId: string) => {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_URL}/wishlist/${productId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return { success: true };
  },
};
