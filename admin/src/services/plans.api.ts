import { apiService, Plan } from "./api";

class PlansApiService {
    async getAllPlans(): Promise<Plan[]> {
        return apiService.getPlans();
    }
}

export const plansApiService = new PlansApiService();
