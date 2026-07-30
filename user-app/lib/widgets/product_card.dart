import 'package:flutter/material.dart';
import '../models/product.dart';

// ProductCard — a reusable "component" that displays a single product.
// Web analogy: like `function ProductCard({ product }) { return <div>...</div> }`
//
// StatelessWidget = a component with no changing data of its own.
// Web analogy: a pure component that only takes props (here `product`).
class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback? onTap; // what to do when tapped (optional)

  const ProductCard({super.key, required this.product, this.onTap});

  @override
  Widget build(BuildContext context) {
    // InkWell = a tappable area (gives a click/ripple effect). Like <button>/onClick.
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start, // align to the left
        children: [
          // ---- Product image ----
          // Expanded = take the remaining vertical space (to show a big image).
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12), // rounded corners (like border-radius)
              child: Stack(
                // Stack = place things on top of each other (like position: absolute).
                fit: StackFit.expand,
                children: [
                  // Load image from network. loadingBuilder = while it is loading.
                  Image.network(
                    product.imageUrl,
                    fit: BoxFit.cover, // like CSS object-fit: cover
                    loadingBuilder: (context, child, progress) {
                      if (progress == null) return child; // finished loading
                      return Container(
                        color: Colors.grey.shade200,
                        child: const Center(
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      );
                    },
                    errorBuilder: (context, error, stack) => Container(
                      color: Colors.grey.shade200,
                      child: const Icon(Icons.image_not_supported,
                          color: Colors.grey),
                    ),
                  ),

                  // ---- Discount badge (only show when there is a discount) ----
                  if (product.discountPercent > 0)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${product.discountPercent}% OFF',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 8), // a small gap (like margin)

          // ---- Product name ----
          Text(
            product.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis, // long name becomes "..." (like text-overflow)
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: 4),

          // ---- Price row (price + mrp together) ----
          Row(
            children: [
              Text(
                '₹${product.price.toStringAsFixed(0)}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Colors.deepPurple,
                ),
              ),
              // Show MRP only when it exists — with a strike-through (line-through).
              if (product.mrp != null) ...[
                const SizedBox(width: 6),
                Text(
                  '₹${product.mrp!.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                    decoration: TextDecoration.lineThrough, // like CSS line-through
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
