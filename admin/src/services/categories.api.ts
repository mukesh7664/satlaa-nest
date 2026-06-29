import { apiService } from "./api";

export interface Category {
  id?: string;
  name: string;
  slug: string;
  parentId?: string;
  storeId?: string;
  fieldsConfig?: any;
  createdAt?: string;
  updatedAt?: string;
  parent?: Category;
  children?: Category[];
}

class CategoriesApi {
  async getAllCategories(): Promise<Category[]> {
    return apiService.get("/admin/categories");
  }

  async getCategoryById(id: string): Promise<Category> {
    return apiService.get(`/admin/categories/${id}`);
  }

  async createCategory(data: any): Promise<Category> {
    return apiService.post("/admin/categories", data);
  }

  async updateCategory(id: string, data: any): Promise<Category> {
    return apiService.put(`/admin/categories/${id}`, data);
  }

  async deleteCategory(id: string): Promise<any> {
    return apiService.delete(`/admin/categories/${id}`);
  }
}

export const categoriesApi = new CategoriesApi();
