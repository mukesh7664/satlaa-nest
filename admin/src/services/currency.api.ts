import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const currencyApi = {
  getSupportedCurrencies: async (): Promise<Currency[]> => {
    const response = await axios.get(`${API_URL}/currency/supported`);
    return response.data;
  },

  getExchangeRates: async (base: string = "INR"): Promise<Record<string, number>> => {
    const response = await axios.get(`${API_URL}/currency/rates`, {
      params: { base },
    });
    return response.data;
  },
};
