import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export const shiprocketApi = {
  testConnection: async (email: string, password: string) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/admin/shiprocket/test-connection`,
      { email, password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getConfig: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/admin/shiprocket/config`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  saveConfig: async (settings: any) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/admin/shiprocket/config`,
      settings,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
