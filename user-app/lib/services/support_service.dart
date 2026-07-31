import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/ticket.dart';
import 'auth_service.dart';

// SupportService — customer support tickets.
// All endpoints require a Bearer token (the customer must be logged in).
// Mirrors the backend /support/tickets contract used by the web app.
class SupportService {
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

  // GET /support/tickets -> list of the customer's tickets.
  static Future<List<Ticket>> getTickets() async {
    final res = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/support/tickets'),
      headers: await _headers(),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to load tickets (${res.statusCode})';
    }
    final body = jsonDecode(res.body);
    final list = (body is Map ? body['data'] : body) as List? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map((e) => Ticket.fromApi(e))
        .toList();
  }

  // POST /support/tickets -> create a new ticket.
  static Future<Ticket> createTicket({
    required String subject,
    required String description,
    required String category,
    String priority = 'medium',
  }) async {
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/support/tickets'),
      headers: await _headers(),
      body: jsonEncode({
        'subject': subject,
        'description': description,
        'category': category,
        'priority': priority,
      }),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ?? 'Failed to submit (${res.statusCode})';
    }
    final body = jsonDecode(res.body);
    final data = (body is Map && body['data'] != null) ? body['data'] : body;
    return Ticket.fromApi(data as Map<String, dynamic>);
  }

  // GET /support/tickets/:id -> single ticket detail.
  static Future<Ticket> getTicket(String id) async {
    final res = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/support/tickets/$id'),
      headers: await _headers(),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to load ticket (${res.statusCode})';
    }
    final body = jsonDecode(res.body);
    final data = (body is Map && body['data'] != null) ? body['data'] : body;
    return Ticket.fromApi(data as Map<String, dynamic>);
  }

  // GET /support/tickets/:id/messages -> chat thread.
  static Future<List<TicketMessage>> getMessages(String id) async {
    final res = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/support/tickets/$id/messages'),
      headers: await _headers(),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw 'Failed to load messages (${res.statusCode})';
    }
    final body = jsonDecode(res.body);
    final list = (body is Map ? body['data'] : body) as List? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map((e) => TicketMessage.fromApi(e))
        .toList();
  }

  // POST /support/tickets/:id/messages -> add a reply.
  static Future<TicketMessage> sendMessage(String id, String message) async {
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/support/tickets/$id/messages'),
      headers: await _headers(),
      body: jsonEncode({'message': message}),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ?? 'Failed to send (${res.statusCode})';
    }
    final body = jsonDecode(res.body);
    final data = (body is Map && body['data'] != null) ? body['data'] : body;
    return TicketMessage.fromApi(data as Map<String, dynamic>);
  }

  // PATCH /support/tickets/:id/close -> close a ticket.
  static Future<void> closeTicket(String id) async {
    final res = await http.patch(
      Uri.parse('${ApiConfig.baseUrl}/support/tickets/$id/close'),
      headers: await _headers(),
      body: jsonEncode({}),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ?? 'Failed to close (${res.statusCode})';
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
