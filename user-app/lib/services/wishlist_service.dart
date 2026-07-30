import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/product.dart';
import 'auth_service.dart';

// WishlistService — the user's saved/favorite products.
// All endpoints require the JWT (Bearer token).
class WishlistService {
  static Future<Map<String, String>> _headers() async {
    final token = await AuthService.getToken();
    if (token == null || token.isEmpty) {
      throw 'Please log in first';
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // GET /wishlist -> list of products (shape can vary; be defensive).
  static Future<List<Product>> getWishlist() async {
    final res = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/wishlist'),
      headers: await _headers(),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to load wishlist (${res.statusCode})';
    }
    final body = jsonDecode(res.body);
    // The list may be at the root, under `data`, `items`, or `wishlist`.
    List raw;
    if (body is List) {
      raw = body;
    } else if (body is Map) {
      raw = (body['data'] ?? body['items'] ?? body['wishlist'] ?? []) as List;
    } else {
      raw = [];
    }
    // Each entry may be a product directly, or wrap one under `product`.
    return raw.whereType<Map<String, dynamic>>().map((e) {
      final p = (e['product'] is Map<String, dynamic>) ? e['product'] : e;
      return Product.fromApi(Map<String, dynamic>.from(p));
    }).toList();
  }

  // POST /wishlist  body: { productId }
  static Future<void> add(String productId) async {
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/wishlist'),
      headers: await _headers(),
      body: jsonEncode({'productId': productId}),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to add to wishlist (${res.statusCode})';
    }
  }

  // DELETE /wishlist/:productId
  static Future<void> remove(String productId) async {
    final res = await http.delete(
      Uri.parse('${ApiConfig.baseUrl}/wishlist/$productId'),
      headers: await _headers(),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to remove from wishlist (${res.statusCode})';
    }
  }
}
