import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user.dart';

// AuthService — all authentication logic in one place.
// It talks to the backend (/auth/register, /auth/login, /auth/profile)
// and saves the token + user on the device so the user stays logged in.
//
// Web analogy: like a mix of your auth API calls + localStorage handling.
class AuthService {
  // Storage keys (like localStorage keys "token" / "user" in the web app).
  static const _tokenKey = 'token';
  static const _userKey = 'user';

  // ---- Storage helpers ----

  // Save token + user after a successful login/register.
  static Future<void> _saveSession(String token, User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  // Read the saved token (null if not logged in).
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Read the saved user (null if not logged in).
  static Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_userKey);
    if (raw == null) return null;
    return User.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  // Are we logged in? (token exists)
  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Clear everything — used on logout.
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }

  // ---- API calls ----

  // Log in with email + password.
  // Backend: POST /auth/login  { email, password } -> { token, user }
  static Future<User> login({
    required String email,
    required String password,
  }) async {
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = _decode(res);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final token = data['token'] as String;
      final user = User.fromJson(data['user'] as Map<String, dynamic>);
      await _saveSession(token, user);
      return user;
    }
    throw _errorMessage(data, fallback: 'Login failed');
  }

  // Register a new customer.
  // Backend: POST /auth/register { firstName, lastName, email, password, phone }
  //          -> { token, user }
  static Future<User> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phone,
  }) async {
    final res = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
      }),
    );

    final data = _decode(res);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final token = data['token'] as String;
      final user = User.fromJson(data['user'] as Map<String, dynamic>);
      await _saveSession(token, user);
      return user;
    }
    throw _errorMessage(data, fallback: 'Registration failed');
  }

  // ---- Small helpers ----

  // Safely decode a JSON response body into a Map.
  static Map<String, dynamic> _decode(http.Response res) {
    try {
      final body = jsonDecode(res.body);
      if (body is Map<String, dynamic>) return body;
      return {'raw': body};
    } catch (_) {
      return {};
    }
  }

  // Pull a readable error message from the backend response.
  // NestJS usually returns { message: "..."} or { message: ["...", ...] }.
  static String _errorMessage(Map<String, dynamic> data,
      {required String fallback}) {
    final msg = data['message'];
    if (msg is String) return msg;
    if (msg is List && msg.isNotEmpty) return msg.first.toString();
    return fallback;
  }
}
