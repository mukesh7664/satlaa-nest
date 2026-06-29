import { apiService } from "./api";

export const getPayments = async (limit = 20, offset = 0, startDate?: string, endDate?: string) => {
  return apiService.get(`/payment/admin/list`, { params: { limit, offset, startDate, endDate } });
};

export const getPaymentAttempts = async (limit = 20, offset = 0, startDate?: string, endDate?: string) => {
  return apiService.get(`/payment/admin/attempts`, { params: { limit, offset, startDate, endDate } });
};

export interface PaymentConfig {
  id?: string;
  provider: string;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  isActive: boolean;
  isTestMode: boolean;
}

export const paymentsApi = {
  getConfig: async (): Promise<PaymentConfig[]> => {
    return apiService.get(`/admin/settings/payment-gateways`);
  },
  getDecryptedConfig: async (): Promise<PaymentConfig[]> => {
    return apiService.get(`/admin/settings/payment-gateways/decrypted`);
  },
  upsertConfig: async (payload: Partial<PaymentConfig>): Promise<PaymentConfig> => {
    return apiService.post(`/admin/settings/payment-gateways`, payload);
  },
  deleteConfig: async (provider: string): Promise<void> => {
    return apiService.delete(`/admin/settings/payment-gateways/${provider}`);
  },
};
