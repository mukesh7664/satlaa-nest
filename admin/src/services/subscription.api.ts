import { apiService } from "./api";

export interface Plan {
    id: string;
    name: string;
    monthlyPrice: string | number;
    yearlyPrice: string | number;
    category?: string;
    pageLimit?: number;
    page_limit?: number;
    productLimit?: number;
    product_limit?: number;
    storageMb?: number;
    storage_mb?: number;
    customDomainLimit?: number;
    custom_domain_limit?: number;
    adminLimit?: number;
    admin_limit?: number;
    features: any;
    allowedPages?: string[];
}

export interface Subscription {
    id: string;
    plan_id: string;
    status: string;
    start_date: string;
    expiry_date: string;
    plan: Plan;
    pending_plan_id?: string;
    pending_billing_cycle?: string;
}

class SubscriptionApiService {
    // Single-store mode: subscriptions removed. Return null so callers fall back to defaults.
    async getMySubscription(): Promise<Subscription | null> {
        return null;
    }

    async getUsage(): Promise<any | null> {
        return null;
    }

    async getChangePreview(planId: string, billingCycle: string = 'monthly'): Promise<any> {
        return apiService.get(`/subscriptions/change-preview?planId=${planId}&billingCycle=${billingCycle}`);
    }

    async getHistory(): Promise<Subscription[]> {
        return apiService.get("/subscriptions/history");
    }

    async createPlanChangeOrder(planId: string, billingCycle: string = 'monthly'): Promise<{ order: any, attemptId: string, razorpayKey: string, preview: any }> {
        return apiService.post("/subscriptions/plan-change-order", { planId, billingCycle });
    }

    async executeFreeChange(planId: string, billingCycle: string = 'monthly'): Promise<any> {
        return apiService.post("/subscriptions/free-plan-change", { planId, billingCycle });
    }

    async requestPlanChange(planId: string, billingCycle: string = 'monthly'): Promise<any> {
        return apiService.post("/subscriptions/request-plan-change", { planId, billingCycle });
    }

    async cancelPlanChange(): Promise<any> {
        return apiService.post("/subscriptions/cancel-plan-change", {});
    }

    async verifyPayment(paymentData: any): Promise<any> {
        return apiService.post("/subscriptions/verify-payment", paymentData);
    }
}

export const subscriptionApiService = new SubscriptionApiService();
