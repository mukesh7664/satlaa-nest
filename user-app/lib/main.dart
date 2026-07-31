import 'package:flutter/material.dart';
import 'services/auth_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/categories_screen.dart';
import 'screens/play_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/profile_screen.dart';

// Entry point of the app. Flutter calls main() first when the app launches.
void main() {
  runApp(const FanostyleApp());
}

// Root widget of the whole application.
class FanostyleApp extends StatelessWidget {
  const FanostyleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fanostyle',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      // AuthGate decides which screen to show first.
      home: const AuthGate(),
    );
  }
}

// AuthGate = the "guard" at the entrance of the app.
// On startup it checks whether a token is saved:
//   - logged in  -> show the main app (MainShell)
//   - logged out -> show the login screen
// Web analogy: like a route guard / protected-route wrapper.
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _checking = true; // true while we read the saved token
  bool _loggedIn = false;

  @override
  void initState() {
    super.initState();
    _check();
  }

  Future<void> _check() async {
    final loggedIn = await AuthService.isLoggedIn();
    if (mounted) {
      setState(() {
        _loggedIn = loggedIn;
        _checking = false;
      });
    }
  }

  // Called by the login/signup screens after success.
  void _onLoggedIn() => setState(() => _loggedIn = true);

  // Called by the profile screen after logout.
  void _onLoggedOut() => setState(() => _loggedIn = false);

  @override
  Widget build(BuildContext context) {
    // While checking the saved token, show a simple splash spinner.
    if (_checking) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    // Show login or the main app depending on auth state.
    if (!_loggedIn) {
      return LoginScreen(onLoggedIn: _onLoggedIn);
    }
    return MainShell(onLoggedOut: _onLoggedOut);
  }
}

// MainShell = the app "frame" that holds the bottom navigation bar
// and swaps the screen when you tap a tab.
class MainShell extends StatefulWidget {
  // Passed down to the Profile tab so logout can return to login.
  final VoidCallback onLoggedOut;

  const MainShell({super.key, required this.onLoggedOut});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  // Screens are built in build() because the Profile tab needs onLoggedOut.
  @override
  Widget build(BuildContext context) {
    final screens = [
      const HomeScreen(),
      const PlayScreen(),
      const CategoriesScreen(),
      const CartScreen(),
      ProfileScreen(onLoggedOut: widget.onLoggedOut),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        // Slimmer than the Material 3 default (80) for a compact bar.
        height: 60,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() => _currentIndex = index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.play_circle_outline),
            selectedIcon: Icon(Icons.play_circle),
            label: 'Play',
          ),
          NavigationDestination(
            icon: Icon(Icons.grid_view_outlined),
            selectedIcon: Icon(Icons.grid_view),
            label: 'Categories',
          ),
          NavigationDestination(
            icon: Icon(Icons.shopping_cart_outlined),
            selectedIcon: Icon(Icons.shopping_cart),
            label: 'Cart',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
