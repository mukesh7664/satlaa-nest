// Product model — parses the backend's catalog product shape.
//
// The backend returns a nested/transformed shape (not flat), e.g.:
//   { "_id", "slug", "productInfo": { "title", "price": { "current", "original" } },
//     "simplePricing": { "basePrice", "inStock", "stockQuantity" },
//     "icon": { "url" }, "images": [ { "url" } ] }
// This model flattens it into simple fields the UI can use easily.
class Product {
  final String id; // backend "_id"
  final String slug;
  final String name; // productInfo.title
  final double price; // simplePricing.basePrice (rupees)
  final double? mrp; // productInfo.price.original (may be empty -> null)
  final String imageUrl; // main image (icon.url or first image)
  final List<String> images; // all image urls
  final bool inStock;
  final int stockQuantity;

  const Product({
    required this.id,
    required this.slug,
    required this.name,
    required this.price,
    this.mrp,
    required this.imageUrl,
    this.images = const [],
    this.inStock = true,
    this.stockQuantity = 0,
  });

  // Discount % (0 if no valid MRP).
  int get discountPercent {
    if (mrp == null || mrp! <= price) return 0;
    return (((mrp! - price) / mrp!) * 100).round();
  }

  // Build a Product from the backend JSON. Very defensive because several
  // fields can be missing, empty strings, or in different types.
  factory Product.fromApi(Map<String, dynamic> json) {
    final info = (json['productInfo'] as Map<String, dynamic>?) ?? {};
    final priceInfo = (info['price'] as Map<String, dynamic>?) ?? {};
    final simple = (json['simplePricing'] as Map<String, dynamic>?) ?? {};

    // base price: prefer numeric simplePricing.basePrice, else parse string.
    final basePrice = _toDouble(simple['basePrice']) ??
        _toDouble(priceInfo['current']) ??
        0;

    // images list
    final imagesRaw = (json['images'] as List?) ?? [];
    final images = imagesRaw
        .map((e) => (e is Map) ? e['url']?.toString() : null)
        .whereType<String>()
        .where((s) => s.isNotEmpty)
        .toList();

    final icon = json['icon'] as Map<String, dynamic>?;
    final mainImage = (icon?['url']?.toString().isNotEmpty == true)
        ? icon!['url'].toString()
        : (images.isNotEmpty ? images.first : '');

    // MRP: only keep it if it's a real number greater than price.
    double? mrp = _toDouble(priceInfo['original']);
    if (mrp != null && mrp <= basePrice) mrp = null;

    return Product(
      id: json['_id']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      name: info['title']?.toString() ?? 'Product',
      price: basePrice,
      mrp: mrp,
      imageUrl: mainImage,
      images: images.isNotEmpty
          ? images
          : (mainImage.isNotEmpty ? [mainImage] : const []),
      inStock: simple['inStock'] == true || (simple['inStock'] == null),
      stockQuantity: _toDouble(simple['stockQuantity'])?.toInt() ?? 0,
    );
  }

  // Parse a value that might be a number, a numeric string, or empty/null.
  static double? _toDouble(dynamic v) {
    if (v == null) return null;
    if (v is num) return v.toDouble();
    final s = v.toString().trim();
    if (s.isEmpty) return null;
    return double.tryParse(s);
  }
}
