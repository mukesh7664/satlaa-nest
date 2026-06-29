import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface ServiceabilityResponse {
  success: boolean;
  data: {
    serviceable: boolean;
    estimated_delivery_date?: string;
    etd_hours?: number;
    courier_name?: string;
    message: string;
    fallback?: boolean;
  };
}

export const shippingService = {
  checkServiceability: async (pincode: string, productId?: string) => {
    try {
      const response = await axios.get<ServiceabilityResponse>(`${API_URL}/shipping/serviceability`, {
        params: { pincode, productId },
      });
      return response.data;
    } catch (error) {
      console.error("Error checking serviceability:", error);
      throw error;
    }
  },
};
