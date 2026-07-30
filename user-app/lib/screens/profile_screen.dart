import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import 'orders_screen.dart';
import 'wishlist_screen.dart';
import 'addresses_screen.dart';

// ProfileScreen — shows the logged-in user's info and a logout button.
// It reads the user that AuthService saved on the device at login time.
class ProfileScreen extends StatefulWidget {
  // Called after logout so the app can return to the login screen.
  final VoidCallback onLoggedOut;

  const ProfileScreen({super.key, required this.onLoggedOut});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  User? _user;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadUser(); // load the saved user when the screen first appears
  }

  Future<void> _loadUser() async {
    final user = await AuthService.getCurrentUser();
    if (mounted) {
      setState(() {
        _user = user;
        _loading = false;
      });
    }
  }

  Future<void> _confirmLogout() async {
    // Ask for confirmation before logging out.
    final shouldLogout = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Logout', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (shouldLogout == true) {
      await AuthService.logout(); // clear token + user
      widget.onLoggedOut(); // return to login
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.deepPurple,
        title: const Text('Profile', style: TextStyle(color: Colors.white)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const SizedBox(height: 12),

                // ---- Avatar + name + email ----
                Center(
                  child: CircleAvatar(
                    radius: 44,
                    backgroundColor: Colors.deepPurple.shade100,
                    child: Text(
                      _initials(_user?.name),
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.deepPurple,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: Text(
                    _user?.name.isNotEmpty == true ? _user!.name : 'Guest',
                    style: const TextStyle(
                        fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 4),
                Center(
                  child: Text(
                    _user?.email ?? '',
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                ),
                const SizedBox(height: 32),

                // ---- Info rows ----
                _infoTile(Icons.person_outline, 'Name',
                    _user?.name ?? '-'),
                _infoTile(Icons.email_outlined, 'Email',
                    _user?.email ?? '-'),
                _infoTile(Icons.phone_outlined, 'Phone',
                    (_user?.phone?.isNotEmpty == true)
                        ? _user!.phone!
                        : 'Not added'),

                const SizedBox(height: 24),

                // ---- Account menu links ----
                _menuTile(Icons.receipt_long, 'My Orders', () {
                  Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const OrdersScreen()));
                }),
                _menuTile(Icons.favorite_border, 'Wishlist', () {
                  Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const WishlistScreen()));
                }),
                _menuTile(Icons.location_on_outlined, 'My Addresses', () {
                  Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => const AddressesScreen()));
                }),

                const SizedBox(height: 24),

                // ---- Logout button ----
                SizedBox(
                  height: 50,
                  child: OutlinedButton.icon(
                    onPressed: _confirmLogout,
                    icon: const Icon(Icons.logout, color: Colors.red),
                    label: const Text('Logout',
                        style: TextStyle(color: Colors.red, fontSize: 16)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.red),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  // A single info row (icon + label + value).
  Widget _infoTile(IconData icon, String label, String value) {
    return Card(
      elevation: 0,
      color: Colors.grey.shade50,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: Colors.deepPurple),
        title: Text(label,
            style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
        subtitle: Text(value,
            style: const TextStyle(
                fontSize: 15, color: Colors.black, fontWeight: FontWeight.w500)),
      ),
    );
  }

  // A tappable menu row (icon + label + chevron) used for account links.
  Widget _menuTile(IconData icon, String label, VoidCallback onTap) {
    return Card(
      elevation: 0,
      color: Colors.grey.shade50,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: Colors.deepPurple),
        title: Text(label,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: onTap,
      ),
    );
  }

  // First letter(s) of the name for the avatar. e.g. "Rani Kaur" -> "RK".
  String _initials(String? name) {
    if (name == null || name.trim().isEmpty) return '?';
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts[1][0]).toUpperCase();
  }
}
