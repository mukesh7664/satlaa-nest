import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/product.dart';
import '../services/catalog_service.dart';
import '../services/cart_service.dart';
import '../services/wishlist_service.dart';
import '../services/auth_service.dart';
import 'checkout_screen.dart';

// ProductDetailScreen — shows one product in full: big image(s), name,
// price, stock, a wishlist toggle, and Add to Cart / Buy Now buttons.
//
// We accept the product we already have (from the grid) so the screen
// can show instantly, and then fetch fresh details in the background
// (in case the list only had partial data).
class ProductDetailScreen extends StatefulWidget {
  final Product product;

  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late Product _product; // current product data shown on screen
  int _imageIndex = 0; // which image is selected in the gallery
  bool _adding = false; // true while an add-to-cart / buy-now runs
  bool _inWishlist = false; // whether this product is in the wishlist
  bool _wishlistBusy = false; // true while toggling the wishlist

  @override
  void initState() {
    super.initState();
    _product = widget.product;
    _refresh(); // load full details in the background
    _loadWishlistState();
  }

  // Fetch the latest product details by slug (or id) and update the UI.
  Future<void> _refresh() async {
    try {
      final slugOrId = _product.slug.isNotEmpty ? _product.slug : _product.id;
      if (slugOrId.isEmpty) return;
      final fresh = await CatalogService.getProductBySlug(slugOrId);
      if (mounted) setState(() => _product = fresh);
    } catch (_) {
      // Ignore — we already show the data passed from the list.
    }
  }

  // Check if this product is already in the wishlist (best-effort).
  Future<void> _loadWishlistState() async {
    try {
      if (!await AuthService.isLoggedIn()) return;
      final items = await WishlistService.getWishlist();
      final inList = items.any((p) => p.id == _product.id);
      if (mounted) setState(() => _inWishlist = inList);
    } catch (_) {
      // Non-critical — leave the heart in its default (off) state.
    }
  }

  // Add or remove this product from the wishlist.
  Future<void> _toggleWishlist() async {
    if (_wishlistBusy) return;
    if (!await AuthService.isLoggedIn()) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in to use the wishlist')),
      );
      return;
    }
    setState(() => _wishlistBusy = true);
    final wasIn = _inWishlist;
    try {
      if (wasIn) {
        await WishlistService.remove(_product.id);
      } else {
        await WishlistService.add(_product.id);
      }
      if (mounted) setState(() => _inWishlist = !wasIn);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _wishlistBusy = false);
    }
  }

  // Add this product to the cart. Returns true on success.
  Future<bool> _addToCart({bool showMessage = true}) async {
    setState(() => _adding = true);
    try {
      await CartService.addItem(
        productId: _product.id,
        price: _product.price,
        quantity: 1,
      );
      if (mounted && showMessage) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${_product.name} added to cart'),
            duration: const Duration(seconds: 1),
          ),
        );
      }
      return true;
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
      return false;
    } finally {
      if (mounted) setState(() => _adding = false);
    }
  }

  // Buy Now — same behaviour as the web app: add to cart silently, then
  // go straight to checkout.
  Future<void> _buyNow() async {
    final ok = await _addToCart(showMessage: false);
    if (!ok || !mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const CheckoutScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final images =
        _product.images.isNotEmpty ? _product.images : [_product.imageUrl];
    final mainImage = images[_imageIndex.clamp(0, images.length - 1)];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: AppColors.brand,
        foregroundColor: Colors.white,
        title: const Text('Details'),
        actions: [
          // Wishlist heart toggle.
          IconButton(
            onPressed: _wishlistBusy ? null : _toggleWishlist,
            icon: Icon(
              _inWishlist ? Icons.favorite : Icons.favorite_border,
              color: _inWishlist ? Colors.redAccent : Colors.white,
            ),
          ),
        ],
      ),
      body: ListView(
        children: [
          // ---- Big main image ----
          AspectRatio(
            aspectRatio: 1,
            child: Container(
              color: Colors.grey.shade100,
              child: mainImage.isEmpty
                  ? const Center(
                      child: Icon(Icons.image_not_supported,
                          color: Colors.grey, size: 48),
                    )
                  : Image.network(
                      mainImage,
                      fit: BoxFit.cover,
                      errorBuilder: (c, e, s) => const Center(
                        child: Icon(Icons.image_not_supported,
                            color: Colors.grey, size: 48),
                      ),
                    ),
            ),
          ),

          // ---- Thumbnail row (only if there is more than one image) ----
          if (images.length > 1)
            SizedBox(
              height: 72,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.all(8),
                itemCount: images.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final selected = i == _imageIndex;
                  return GestureDetector(
                    onTap: () => setState(() => _imageIndex = i),
                    child: Container(
                      width: 56,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: selected
                              ? AppColors.brand
                              : Colors.grey.shade300,
                          width: selected ? 2 : 1,
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(7),
                        child: Image.network(images[i], fit: BoxFit.cover,
                            errorBuilder: (c, e, s) =>
                                Container(color: Colors.grey.shade200)),
                      ),
                    ),
                  );
                },
              ),
            ),

          // ---- Text details ----
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _product.name,
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),

                // Price + MRP + discount badge
                Row(
                  children: [
                    Text(
                      '₹${_product.price.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.brand,
                      ),
                    ),
                    if (_product.mrp != null) ...[
                      const SizedBox(width: 10),
                      Text(
                        '₹${_product.mrp!.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 15,
                          color: Colors.grey,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                    ],
                    if (_product.discountPercent > 0) ...[
                      const SizedBox(width: 10),
                      Text(
                        '${_product.discountPercent}% OFF',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ],
                ),

                const SizedBox(height: 12),

                // Stock status line
                Row(
                  children: [
                    Icon(
                      _product.inStock ? Icons.check_circle : Icons.cancel,
                      size: 18,
                      color: _product.inStock ? Colors.green : Colors.red,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      _product.inStock ? 'In stock' : 'Out of stock',
                      style: TextStyle(
                        color: _product.inStock ? Colors.green : Colors.red,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),

      // ---- Sticky action bar: Add to Cart + Buy Now ----
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // Add to Cart (outlined)
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.brand,
                      side: const BorderSide(color: AppColors.brand),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed:
                        (!_product.inStock || _adding) ? null : _addToCart,
                    icon: _adding
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child:
                                CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.shopping_cart_outlined),
                    label: const Text('Add to Cart'),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Buy Now (filled)
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.brand,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed:
                        (!_product.inStock || _adding) ? null : _buyNow,
                    child: Text(_product.inStock ? 'Buy Now' : 'Out of Stock'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
