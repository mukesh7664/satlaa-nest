// Central place for API configuration.
//
// IMPORTANT (read this):
// The phone is a SEPARATE device from your laptop. On the phone,
// "localhost" means the phone itself — NOT your laptop. So we must use
// the laptop's LAN IP address so the phone can reach the backend.
//
// Requirements for this to work:
//   1. Phone and laptop must be on the SAME Wi-Fi network.
//   2. The backend (api_nest) must be running on the laptop (port 5004).
//   3. If your laptop's IP changes, update the value below.
//      Find it on the laptop with:  hostname -I
//
// Advanced: you can override this at build time without editing code:
//   flutter run --dart-define=API_URL=http://192.168.1.50:5004/api/v1
class ApiConfig {
  // Laptop LAN IP detected during setup. Change if your network changes.
  static const String _defaultBaseUrl = 'http://192.168.2.8:5004/api/v1';

  // Uses the --dart-define value if provided, otherwise the default above.
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: _defaultBaseUrl,
  );
}
