import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/address.dart';
import 'auth_service.dart';

// AddressService — CRUD for the logged-in user's saved addresses.
// Every endpoint requires the JWT (Bearer token).
class AddressService {
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

  // GET /addresses -> { addresses: [...] }
  static Future<List<Address>> getAddresses() async {
    final res = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/addresses'),
      headers: await _headers(),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to load addresses (${res.statusCode})';
    }
    final body = jsonDecode(res.body);
    final list = (body is Map ? body['addresses'] : body) as List? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map((e) => Address.fromApi(e))
        .toList();
  }

  // POST /addresses -> created Address
  static Future<Address> createAddress(Address address) async {
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/addresses'),
      headers: await _headers(),
      body: jsonEncode(address.toApi()),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ?? 'Failed to save address (${res.statusCode})';
    }
    return Address.fromApi(jsonDecode(res.body));
  }

  // PUT /addresses/:id -> updated Address
  static Future<Address> updateAddress(String id, Address address) async {
    final res = await http.put(
      Uri.parse('${ApiConfig.baseUrl}/addresses/$id'),
      headers: await _headers(),
      body: jsonEncode(address.toApi()),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ??
          'Failed to update address (${res.statusCode})';
    }
    return Address.fromApi(jsonDecode(res.body));
  }

  // DELETE /addresses/:id
  static Future<void> deleteAddress(String id) async {
    final res = await http.delete(
      Uri.parse('${ApiConfig.baseUrl}/addresses/$id'),
      headers: await _headers(),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to delete address (${res.statusCode})';
    }
  }

  // PATCH /addresses/:id/default -> marks this address as default
  static Future<void> setDefault(String id) async {
    final res = await http.patch(
      Uri.parse('${ApiConfig.baseUrl}/addresses/$id/default'),
      headers: await _headers(),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to set default (${res.statusCode})';
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
