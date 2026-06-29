import { Category } from "@/services/categories.api";

/**
 * Traverses up the category hierarchy and merges all fields_config.fields.
 * Child fields override parent fields with the same name.
 */
export function getMergedCategoryFields(category: Category, allCategories: Category[]): any[] {
  const fieldsMap = new Map<string, any>();
  const hierarchy: Category[] = [];

  let current: Category | undefined = category;
  while (current) {
    hierarchy.unshift(current);
    const parentId: string | undefined = current.parentId;
    if (!parentId) break;
    current = allCategories.find((c) => c.id === parentId);
  }

  // Iterate from root to leaf so that child fields override parent fields
  for (const cat of hierarchy) {
    const fields = cat.fieldsConfig?.fields || [];
    for (const field of fields) {
      fieldsMap.set(field.name.toLowerCase(), field);
    }
  }

  return Array.from(fieldsMap.values());
}
