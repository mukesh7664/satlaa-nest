import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/product.dart';
import '../models/category.dart';

// CatalogService — reads products and categories from the backend.
// These endpoints are public (no token needed).
class CatalogService {
  // GET /products?page=&limit=&category=&search=
  // Response is wrapped: { success, data: [...], pagination }.
  // `category` accepts a category slug (or UUID).
  static Future<List<Product>> getProducts({
    int page = 1,
    int limit = 20,
    String? categorySlug,
    String? search,
  }) async {
    final query = <String, String>{
      'page': '$page',
      'limit': '$limit',
      if (categorySlug != null && categorySlug.isNotEmpty)
        'category': categorySlug,
      if (search != null && search.isNotEmpty) 'search': search,
    };

    final uri = Uri.parse('${ApiConfig.baseUrl}/products')
        .replace(queryParameters: query);
    final res = await http.get(uri);

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to load products (${res.statusCode})';
    }

    final body = jsonDecode(res.body);
    final list = (body is Map ? body['data'] : null) as List? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map((e) => Product.fromApi(e))
        .toList();
  }

  // GET /products/:idOrSlug -> { success, data: {...} }
  static Future<Product> getProductBySlug(String slug) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/products/$slug');
    final res = await http.get(uri);

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to load product (${res.statusCode})';
    }

    final body = jsonDecode(res.body);
    final data = (body is Map ? body['data'] : null);
    if (data is! Map<String, dynamic>) throw 'Product not found';
    return Product.fromApi(data);
  }

  // GET /categories -> { success, categories: [...] }
  static Future<List<Category>> getCategories() async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/categories');
    final res = await http.get(uri);

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to load categories (${res.statusCode})';
    }

    final body = jsonDecode(res.body);
    final list = (body is Map ? body['categories'] : null) as List? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map((e) => Category.fromApi(e))
        .toList();
  }
}
