import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/placeholder_screen.dart';

// Entry point of the app. Flutter calls main() first when the app launches.
// Web analogy: like the root index.tsx that mounts the app.
void main() {
  runApp(const SatlaaApp());
}

// Root widget of the whole application.
// MaterialApp sets up theme, title, and the first screen (home).
class SatlaaApp extends StatelessWidget {
  const SatlaaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Satlaa',
      debugShowCheckedModeBanner: false, // hide the "DEBUG" ribbon in corner
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MainShell(),
    );
  }
}

// MainShell = the app "frame" that holds the bottom navigation bar
// and swaps the screen when you tap a tab.
//
// StatefulWidget = a widget that has changing data (here: which tab is
// currently selected). Web analogy: a component with useState.
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  // Which tab is selected right now (0 = Home). This is our "state".
  int _currentIndex = 0;

  // The screen for each tab. Order matches the nav items below.
  final List<Widget> _screens = const [
    HomeScreen(),
    PlaceholderScreen(title: 'Categories', icon: Icons.grid_view),
    PlaceholderScreen(title: 'Cart', icon: Icons.shopping_cart),
    PlaceholderScreen(title: 'Profile', icon: Icons.person),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // body shows the screen for the currently selected tab.
      body: _screens[_currentIndex],

      // Bottom navigation bar with 4 tabs.
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        // Called when a tab is tapped. setState re-runs build() so the
        // new screen shows. Web analogy: setState(newIndex) triggers re-render.
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
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
