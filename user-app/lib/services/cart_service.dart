import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

// CartService — talks to the backend cart endpoints.
// All cart calls need the logged-in user's JWT (Bearer token).
class CartService {
  // Build the auth headers. Throws if the user is not logged in.
  static Future<Map<String, String>> _authHeaders() async {
    final token = await AuthService.getToken();
    if (token == null || token.isEmpty) {
      throw 'Please log in to use the cart';
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // GET /cart -> full cart object.
  // Returns the item count so the UI can show a badge.
  static Future<int> getItemCount() async {
    final headers = await _authHeaders();
    final res =
        await http.get(Uri.parse('${ApiConfig.baseUrl}/cart'), headers: headers);

    if (res.statusCode < 200 || res.statusCode >= 300) {
      return 0;
    }

    final body = jsonDecode(res.body);
    final data = (body is Map ? (body['data'] ?? body) : null);
    final items = (data is Map ? data['items'] : null) as List? ?? [];
    return items.length;
  }

  // GET /cart -> returns the raw cart map (items, totals, etc.).
  static Future<Map<String, dynamic>> getCart() async {
    final headers = await _authHeaders();
    final res =
        await http.get(Uri.parse('${ApiConfig.baseUrl}/cart'), headers: headers);

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to load cart (${res.statusCode})';
    }

    final body = jsonDecode(res.body);
    final data = (body is Map ? (body['data'] ?? body) : null);
    return data is Map<String, dynamic> ? data : {};
  }

  // POST /cart/items  body: { productId, price, quantity }
  // The client supplies the price (in rupees) — matches the web app.
  static Future<void> addItem({
    required String productId,
    required double price,
    int quantity = 1,
  }) async {
    final headers = await _authHeaders();
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/cart/items'),
      headers: headers,
      body: jsonEncode({
        'productId': productId,
        'price': price,
        'quantity': quantity,
      }),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ?? 'Failed to add to cart (${res.statusCode})';
    }
  }

  // POST /cart/items/:id  body: { quantity }
  static Future<void> updateQuantity({
    required String itemId,
    required int quantity,
  }) async {
    final headers = await _authHeaders();
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/cart/items/$itemId'),
      headers: headers,
      body: jsonEncode({'quantity': quantity}),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ?? 'Failed to update item (${res.statusCode})';
    }
  }

  // DELETE /cart/items/:id
  static Future<void> removeItem(String itemId) async {
    final headers = await _authHeaders();
    final res = await http.delete(
      Uri.parse('${ApiConfig.baseUrl}/cart/items/$itemId'),
      headers: headers,
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ?? 'Failed to remove item (${res.statusCode})';
    }
  }

  // POST /cart/discount  body: { code }
  // Applies a coupon/discount code. Throws with the server message on failure
  // (e.g. invalid or expired code).
  static Future<void> applyCoupon(String code) async {
    final headers = await _authHeaders();
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/cart/discount'),
      headers: headers,
      body: jsonEncode({'code': code}),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ?? 'Invalid coupon code (${res.statusCode})';
    }
  }

  // DELETE /cart/discount — removes the applied coupon.
  static Future<void> removeCoupon() async {
    final headers = await _authHeaders();
    final res = await http.delete(
      Uri.parse('${ApiConfig.baseUrl}/cart/discount'),
      headers: headers,
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ?? 'Failed to remove coupon (${res.statusCode})';
    }
  }

  // Pull a human-readable message out of a NestJS error body.
  static String? _errorFrom(String responseBody) {
    try {
      final body = jsonDecode(responseBody);
      final msg = (body is Map) ? body['message'] : null;
      if (msg is String) return msg;
      if (msg is List && msg.isNotEmpty) return msg.first.toString();
    } catch (_) {}
    return null;
  }
}
