import 'package:flutter/material.dart';
import '../models/product.dart';
import '../widgets/product_card.dart';

// HomeScreen — the first screen shown when the app opens.
// It has a search bar on top and a grid of products below.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Scaffold = the basic frame of a screen (appbar, body, etc.).
    // Web analogy: like a page layout wrapper.
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.deepPurple,
        title: const Text(
          'Satlaa',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            letterSpacing: 1,
          ),
        ),
        actions: [
          // Cart icon on the top-right.
          IconButton(
            icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),

      // CustomScrollView = makes the whole screen scrollable, holding
      // different pieces (search bar, grid) as "slivers".
      body: CustomScrollView(
        slivers: [
          // ---- Search bar (scrolls away with the content) ----
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.search, color: Colors.grey),
                    SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: 'Search suits, lehengas...',
                          border: InputBorder.none, // remove the inner border
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ---- Section heading ----
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16, 4, 16, 12),
              child: Text(
                'Trending Now',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ),

          // ---- Product grid ----
          // SliverPadding = spacing around the grid.
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            sliver: SliverGrid(
              // Grid settings: 2 columns, gaps between cards, card shape.
              gridDelegate:
                  const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2, // 2 columns
                mainAxisSpacing: 16, // vertical gap
                crossAxisSpacing: 12, // horizontal gap
                childAspectRatio: 0.62, // card width:height ratio
              ),
              // delegate = what to build in each cell.
              // Web analogy: like products.map((p) => <ProductCard .../>)
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final product = dummyProducts[index];
                  return ProductCard(
                    product: product,
                    onTap: () {
                      // For now just show a small message (snackbar).
                      // Later we will open the product detail screen from here.
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Tapped: ${product.name}'),
                          duration: const Duration(seconds: 1),
                        ),
                      );
                    },
                  );
                },
                childCount: dummyProducts.length, // how many cards to build
              ),
            ),
          ),

          // A little empty space at the bottom so the last row is not
          // hidden behind the navigation bar.
          const SliverToBoxAdapter(child: SizedBox(height: 16)),
        ],
      ),
    );
  }
}
