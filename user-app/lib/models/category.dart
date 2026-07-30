// Category model — parses the backend's raw category entity.
// Backend: GET /categories -> { success, categories: [ { id, name, slug, ... } ] }
// Note: categories use "id" (not "_id"), and have no image field.
class Category {
  final String id;
  final String name;
  final String slug;

  const Category({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory Category.fromApi(Map<String, dynamic> json) {
    return Category(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
    );
  }
}
