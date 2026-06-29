import { apiService } from "./api";

export interface CategoryAttribute {
  id?: string;
  categoryId: string;
  name: string;
  slug: string;
  inputType: "text" | "number" | "select";
  options: string[];
  isRequired: boolean;
  isGlobal: boolean;
  isVariant: boolean;
  storeId?: string;
}

class AttributesApi {
  async getAttributesByCategoryId(categoryId: string): Promise<CategoryAttribute[]> {
    return apiService.get("/admin/attributes", { params: { categoryId } });
  }

  async createAttribute(data: any): Promise<CategoryAttribute> {
    return apiService.post("/admin/attributes", data);
  }

  async updateAttribute(id: string, data: any): Promise<CategoryAttribute> {
    return apiService.put(`/admin/attributes/${id}`, data);
  }

  async deleteAttribute(id: string): Promise<any> {
    return apiService.delete(`/admin/attributes/${id}`);
  }
}

export const attributesApi = new AttributesApi();
