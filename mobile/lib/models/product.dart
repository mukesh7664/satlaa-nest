// Product model — this is a "blueprint" for a single product.
// Web analogy: like a TypeScript `interface Product { ... }`.
// In Dart we use a `class`.

class Product {
  final String id;
  final String name;
  final double price; // current price (₹)
  final double? mrp; // original price — optional (hence `?`). Used to show discount.
  final String imageUrl;
  final String category;

  // Constructor — these values are needed when creating an object.
  const Product({
    required this.id,
    required this.name,
    required this.price,
    this.mrp,
    required this.imageUrl,
    required this.category,
  });

  // How much % discount — a small helper (getter).
  int get discountPercent {
    if (mrp == null || mrp! <= price) return 0;
    return (((mrp! - price) / mrp!) * 100).round();
  }
}

// Dummy data — for now products come from here, not the backend.
// Web analogy: like a mock JSON array.
// (Images come from picsum.photos — needs internet. Later we will
//  plug in the real backend API here.)
const List<Product> dummyProducts = [
  Product(
    id: '1',
    name: 'Rani Pink Punjabi Suit',
    price: 2499,
    mrp: 3999,
    category: 'Punjabi Suit',
    imageUrl: 'https://picsum.photos/seed/satlaa1/400/500',
  ),
  Product(
    id: '2',
    name: 'Royal Blue Lehenga',
    price: 5999,
    mrp: 8999,
    category: 'Lehenga',
    imageUrl: 'https://picsum.photos/seed/satlaa2/400/500',
  ),
  Product(
    id: '3',
    name: 'Yellow Cotton Suit',
    price: 1799,
    category: 'Punjabi Suit',
    imageUrl: 'https://picsum.photos/seed/satlaa3/400/500',
  ),
  Product(
    id: '4',
    name: 'Maroon Bridal Lehenga',
    price: 12999,
    mrp: 15999,
    category: 'Lehenga',
    imageUrl: 'https://picsum.photos/seed/satlaa4/400/500',
  ),
  Product(
    id: '5',
    name: 'Green Patiala Suit',
    price: 2199,
    mrp: 2999,
    category: 'Punjabi Suit',
    imageUrl: 'https://picsum.photos/seed/satlaa5/400/500',
  ),
  Product(
    id: '6',
    name: 'Peach Party Lehenga',
    price: 7499,
    mrp: 9999,
    category: 'Lehenga',
    imageUrl: 'https://picsum.photos/seed/satlaa6/400/500',
  ),
  Product(
    id: '7',
    name: 'White Phulkari Suit',
    price: 3299,
    category: 'Punjabi Suit',
    imageUrl: 'https://picsum.photos/seed/satlaa7/400/500',
  ),
  Product(
    id: '8',
    name: 'Golden Wedding Lehenga',
    price: 18999,
    mrp: 24999,
    category: 'Lehenga',
    imageUrl: 'https://picsum.photos/seed/satlaa8/400/500',
  ),
];
