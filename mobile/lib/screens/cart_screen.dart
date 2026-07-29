import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/cart_service.dart';

// A small view model for one row in the cart.
// The backend nests the product data under item.product, so we flatten
// the few fields we actually need to display here.
class _CartLine {
  final String id; // cart-item id -> used for update/delete
  final String name; // product.title
  final String imageUrl; // product.media[].url (main or first)
  final double price; // unit price
  final int quantity;
  final double subtotal; // line total (price * quantity)

  const _CartLine({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.price,
    required this.quantity,
    required this.subtotal,
  });

  // Parse one raw cart item from the backend.
  factory _CartLine.fromApi(Map<String, dynamic> json) {
    final product = (json['product'] as Map<String, dynamic>?) ?? {};

    // Pick the main image, otherwise the first one available.
    final media = (product['media'] as List?) ?? [];
    String image = '';
    for (final m in media) {
      if (m is Map && m['is_main'] == true && m['url'] != null) {
        image = m['url'].toString();
        break;
      }
    }
    if (image.isEmpty && media.isNotEmpty && media.first is Map) {
      image = (media.first as Map)['url']?.toString() ?? '';
    }

    return _CartLine(
      id: json['id']?.toString() ?? '',
      name: product['title']?.toString() ?? 'Product',
      imageUrl: image,
      price: _toDouble(json['price']),
      quantity: _toInt(json['quantity']),
      subtotal: _toDouble(json['subtotal']),
    );
  }

  static double _toDouble(dynamic v) {
    if (v is num) return v.toDouble();
    return double.tryParse(v?.toString() ?? '') ?? 0;
  }

  static int _toInt(dynamic v) {
    if (v is num) return v.toInt();
    return int.tryParse(v?.toString() ?? '') ?? 0;
  }
}

// CartScreen — the Cart tab. Lists cart items with quantity controls,
// a remove button, and the cart total. Requires the user to be logged in.
class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  List<_CartLine> _items = [];
  double _total = 0;
  bool _loading = true;
  String? _error;
  bool _loggedIn = true; // becomes false if there is no token
  final Set<String> _busyIds = {}; // rows with an in-flight update/remove

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    // Guard: cart needs a logged-in user.
    final loggedIn = await AuthService.isLoggedIn();
    if (!loggedIn) {
      if (!mounted) return;
      setState(() {
        _loggedIn = false;
        _loading = false;
      });
      return;
    }

    try {
      final cart = await CartService.getCart();
      final rawItems = (cart['items'] as List?) ?? [];
      final totals = (cart['totals'] as Map<String, dynamic>?) ?? {};
      if (!mounted) return;
      setState(() {
        _loggedIn = true;
        _items = rawItems
            .whereType<Map<String, dynamic>>()
            .map((e) => _CartLine.fromApi(e))
            .toList();
        _total = _CartLine._toDouble(totals['total']);
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  // Change an item's quantity. If it drops to 0, remove it instead.
  Future<void> _changeQty(_CartLine item, int newQty) async {
    if (_busyIds.contains(item.id)) return;
    setState(() => _busyIds.add(item.id));
    try {
      if (newQty <= 0) {
        await CartService.removeItem(item.id);
      } else {
        await CartService.updateQuantity(itemId: item.id, quantity: newQty);
      }
      await _load(); // refresh totals + rows from the server
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _busyIds.remove(item.id));
    }
  }

  Future<void> _remove(_CartLine item) async {
    if (_busyIds.contains(item.id)) return;
    setState(() => _busyIds.add(item.id));
    try {
      await CartService.removeItem(item.id);
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _busyIds.remove(item.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        title: const Text('Cart'),
      ),
      body: _buildBody(),
      // Show the total bar only when there are items.
      bottomNavigationBar: (!_loading && _loggedIn && _items.isNotEmpty)
          ? _buildTotalBar()
          : null,
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    // Not logged in.
    if (!_loggedIn) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Text(
            'Please log in to see your cart.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey),
          ),
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.wifi_off, size: 40, color: Colors.grey),
            const SizedBox(height: 8),
            Text(_error!, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: _load, child: const Text('Retry')),
          ],
        ),
      );
    }

    // Empty cart.
    if (_items.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.shopping_cart_outlined, size: 48, color: Colors.grey),
            SizedBox(height: 8),
            Text('Your cart is empty', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    // Cart items list.
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: _items.length,
        separatorBuilder: (_, _) => const SizedBox(height: 12),
        itemBuilder: (context, index) => _buildRow(_items[index]),
      ),
    );
  }

  Widget _buildRow(_CartLine item) {
    final busy = _busyIds.contains(item.id);
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          // Thumbnail
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              width: 64,
              height: 64,
              child: item.imageUrl.isEmpty
                  ? Container(
                      color: Colors.grey.shade200,
                      child: const Icon(Icons.image_not_supported,
                          color: Colors.grey),
                    )
                  : Image.network(item.imageUrl, fit: BoxFit.cover,
                      errorBuilder: (c, e, s) => Container(
                          color: Colors.grey.shade200,
                          child: const Icon(Icons.image_not_supported,
                              color: Colors.grey))),
            ),
          ),
          const SizedBox(width: 12),

          // Name + price + quantity controls
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                Text(
                  '₹${item.price.toStringAsFixed(0)}',
                  style: const TextStyle(color: Colors.deepPurple),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    _qtyButton(
                      icon: Icons.remove,
                      onTap: busy
                          ? null
                          : () => _changeQty(item, item.quantity - 1),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: busy
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child:
                                  CircularProgressIndicator(strokeWidth: 2),
                            )
                          : Text('${item.quantity}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold)),
                    ),
                    _qtyButton(
                      icon: Icons.add,
                      onTap: busy
                          ? null
                          : () => _changeQty(item, item.quantity + 1),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Line subtotal + delete
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.red),
                onPressed: busy ? null : () => _remove(item),
              ),
              Text(
                '₹${item.subtotal.toStringAsFixed(0)}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // A small round +/- button.
  Widget _qtyButton({required IconData icon, VoidCallback? onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade400),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Icon(icon, size: 18),
      ),
    );
  }

  // The bottom bar showing the cart total and a checkout button.
  Widget _buildTotalBar() {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey.shade200)),
        ),
        child: Row(
          children: [
            const Text('Total', style: TextStyle(color: Colors.grey)),
            const SizedBox(width: 8),
            Text(
              '₹${_total.toStringAsFixed(0)}',
              style: const TextStyle(
                  fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const Spacer(),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.deepPurple,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                    horizontal: 24, vertical: 12),
              ),
              onPressed: () {
                // Checkout flow comes later.
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Checkout coming soon'),
                    duration: Duration(seconds: 1),
                  ),
                );
              },
              child: const Text('Checkout'),
            ),
          ],
        ),
      ),
    );
  }
}
