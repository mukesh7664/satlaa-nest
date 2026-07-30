import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/order.dart';
import '../models/address.dart';
import 'auth_service.dart';

// OrderService — placing orders and reading order history.
// All endpoints require the JWT (Bearer token).
class OrderService {
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

  // POST /checkout/create-order
  //
  // Sends the line items + shipping/billing address + payment method.
  // The response is a payment-init object; we return it raw so the caller
  // can branch on `provider` (razorpay / stripe / quote_request).
  //
  // `items` entries look like: { productId, quantity, price, variantId?,
  // variantInfo?, purchaseType }.
  static Future<Map<String, dynamic>> createOrder({
    required List<Map<String, dynamic>> items,
    required Address shippingAddress,
    Address? billingAddress,
    String paymentMethod = 'razorpay',
    String orderType = 'direct_purchase',
    String? discountCode,
  }) async {
    final billing = billingAddress ?? shippingAddress;
    final body = {
      'orderType': orderType,
      'items': items,
      'shippingAddress': shippingAddress.toOrderShape(),
      'billingAddress': billing.toOrderShape(),
      'sameAsBilling': billingAddress == null,
      'paymentMethod': paymentMethod,
      'currency': 'INR',
      'exchangeRate': 1,
      if (discountCode != null && discountCode.isNotEmpty)
        'discountCode': discountCode,
    };

    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/checkout/create-order'),
      headers: await _headers(),
      body: jsonEncode(body),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ??
          'Failed to place order (${res.statusCode})';
    }
    final decoded = jsonDecode(res.body);
    return decoded is Map<String, dynamic> ? decoded : {};
  }

  // GET /orders -> { data: [...] }
  static Future<List<Order>> getOrders() async {
    final res = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/orders'),
      headers: await _headers(),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to load orders (${res.statusCode})';
    }
    final body = jsonDecode(res.body);
    final list = (body is Map ? body['data'] : body) as List? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map((e) => Order.fromApi(e))
        .toList();
  }

  // GET /orders/:id -> Order
  static Future<Order> getOrder(String id) async {
    final res = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/orders/$id'),
      headers: await _headers(),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to load order (${res.statusCode})';
    }
    final body = jsonDecode(res.body);
    final data = (body is Map && body['data'] is Map) ? body['data'] : body;
    return Order.fromApi(Map<String, dynamic>.from(data));
  }

  // POST /orders/:id/cancel  body: { reason }
  static Future<void> cancelOrder(String id, String reason) async {
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/orders/$id/cancel'),
      headers: await _headers(),
      body: jsonEncode({'reason': reason}),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ??
          'Failed to cancel order (${res.statusCode})';
    }
  }

  static String? _errorFrom(String body) {
    try {
      final decoded = jsonDecode(body);
      final msg = (decoded is Map) ? decoded['message'] : null;
      if (msg is String) return msg;
      if (msg is List && msg.isNotEmpty) return msg.first.toString();
    } catch (_) {}
    return null;
  }
}
