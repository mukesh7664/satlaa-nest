import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

// PaymentService — verifies a Razorpay payment on the backend after the
// native Razorpay popup reports success.
class PaymentService {
  // POST /payment/verify
  // body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
  // Returns true if the backend confirms the payment.
  static Future<bool> verifyRazorpay({
    required String orderId,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    // The endpoint has no auth guard, but we still send the token like the
    // web app does (harmless, and future-proof if the guard is added).
    final token = await AuthService.getToken();
    final headers = {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };

    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/payment/verify'),
      headers: headers,
      body: jsonEncode({
        'orderId': orderId,
        'razorpay_order_id': razorpayOrderId,
        'razorpay_payment_id': razorpayPaymentId,
        'razorpay_signature': razorpaySignature,
      }),
    );

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw _errorFrom(res.body) ??
          'Payment verification failed (${res.statusCode})';
    }

    final body = jsonDecode(res.body);
    // Treat an explicit success flag as authoritative; otherwise assume 2xx = ok.
    if (body is Map && body.containsKey('success')) {
      return body['success'] == true;
    }
    return true;
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
