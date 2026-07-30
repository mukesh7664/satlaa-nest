import 'package:flutter/material.dart';
import '../models/order.dart';
import '../services/order_service.dart';

// OrderDetailScreen — full details of a single order: status, a simple
// tracking timeline, item list, shipping address, price breakdown, and
// a cancel button (only for cancellable orders).
class OrderDetailScreen extends StatefulWidget {
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Order? _order;
  bool _loading = true;
  String? _error;
  bool _cancelling = false;

  // The main happy-path stages, in order, for the tracking timeline.
  static const List<String> _timelineStages = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
  ];

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
    try {
      final order = await OrderService.getOrder(widget.orderId);
      if (!mounted) return;
      setState(() {
        _order = order;
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

  Future<void> _cancel() async {
    final reason = await _askReason();
    if (reason == null) return; // user dismissed

    setState(() => _cancelling = true);
    try {
      await OrderService.cancelOrder(widget.orderId, reason);
      await _load(); // reload to show the new status
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order cancelled')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _cancelling = false);
    }
  }

  // Ask the user for a cancellation reason.
  Future<String?> _askReason() {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel order'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'Reason for cancellation',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Back'),
          ),
          TextButton(
            onPressed: () {
              final text = controller.text.trim();
              Navigator.pop(ctx, text.isEmpty ? 'Not specified' : text);
            },
            child: const Text('Confirm', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        title: const Text('Order Details'),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
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

    final order = _order!;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // ---- Header: order number + status ----
        Text(
          order.orderNumber.isNotEmpty
              ? 'Order #${order.orderNumber}'
              : 'Order',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text('Placed on ${_formatDate(order.createdAt)}',
            style: const TextStyle(color: Colors.grey)),
        const SizedBox(height: 20),

        // ---- Tracking timeline ----
        if (order.status != 'cancelled') ...[
          const Text('Tracking',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildTimeline(order.status),
        ] else
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Row(
              children: [
                Icon(Icons.cancel, color: Colors.red),
                SizedBox(width: 8),
                Text('This order was cancelled',
                    style: TextStyle(color: Colors.red)),
              ],
            ),
          ),

        const SizedBox(height: 24),

        // ---- Items ----
        const Text('Items',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        ...order.items.map(_buildItemRow),

        const Divider(height: 28),

        // ---- Price breakdown ----
        _priceRow('Subtotal', order.subtotal),
        if (order.discountAmount > 0)
          _priceRow('Discount', -order.discountAmount),
        if (order.taxAmount > 0) _priceRow('Tax', order.taxAmount),
        _priceRow('Shipping',
            order.shippingCost == 0 ? null : order.shippingCost,
            freeText: order.shippingCost == 0 ? 'Free' : null),
        const SizedBox(height: 6),
        _priceRow('Total', order.totalAmount, bold: true),

        const SizedBox(height: 20),

        // ---- Shipping address ----
        if (order.shippingAddress != null) ...[
          const Text('Shipping Address',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(_formatAddress(order.shippingAddress!)),
          const SizedBox(height: 20),
        ],

        // ---- Payment status ----
        Row(
          children: [
            const Text('Payment: ', style: TextStyle(color: Colors.grey)),
            Text(
              order.paymentStatus.toUpperCase(),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: order.paymentStatus == 'paid'
                    ? Colors.green
                    : Colors.orange,
              ),
            ),
          ],
        ),

        const SizedBox(height: 24),

        // ---- Cancel button (only if allowed) ----
        if (order.canCancel)
          SizedBox(
            height: 48,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: _cancelling ? null : _cancel,
              icon: _cancelling
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.cancel_outlined),
              label: const Text('Cancel Order'),
            ),
          ),
      ],
    );
  }

  // A vertical stepper-style timeline highlighting reached stages.
  Widget _buildTimeline(String currentStatus) {
    final currentIndex = _timelineStages.indexOf(currentStatus);
    return Column(
      children: List.generate(_timelineStages.length, (i) {
        final reached = currentIndex >= 0 && i <= currentIndex;
        final isLast = i == _timelineStages.length - 1;
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Dot + connecting line
            Column(
              children: [
                Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: reached ? Colors.deepPurple : Colors.grey.shade300,
                    shape: BoxShape.circle,
                  ),
                  child: reached
                      ? const Icon(Icons.check, size: 14, color: Colors.white)
                      : null,
                ),
                if (!isLast)
                  Container(
                    width: 2,
                    height: 28,
                    color: reached ? Colors.deepPurple : Colors.grey.shade300,
                  ),
              ],
            ),
            const SizedBox(width: 12),
            Padding(
              padding: const EdgeInsets.only(top: 1),
              child: Text(
                _label(_timelineStages[i]),
                style: TextStyle(
                  color: reached ? Colors.black : Colors.grey,
                  fontWeight: reached ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildItemRow(OrderItem item) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          // Thumbnail
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              width: 52,
              height: 52,
              child: item.imageUrl.isEmpty
                  ? Container(
                      color: Colors.grey.shade200,
                      child: const Icon(Icons.image_not_supported,
                          color: Colors.grey, size: 20),
                    )
                  : Image.network(item.imageUrl, fit: BoxFit.cover,
                      errorBuilder: (c, e, s) => Container(
                          color: Colors.grey.shade200,
                          child: const Icon(Icons.image_not_supported,
                              color: Colors.grey, size: 20))),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.productName,
                    maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text('Qty: ${item.quantity}',
                    style: const TextStyle(color: Colors.grey, fontSize: 13)),
              ],
            ),
          ),
          Text('₹${item.totalPrice.toStringAsFixed(0)}',
              style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _priceRow(String label, double? value,
      {bool bold = false, String? freeText}) {
    final style = TextStyle(
      fontSize: bold ? 18 : 14,
      fontWeight: bold ? FontWeight.bold : FontWeight.normal,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: style),
          Text(
            freeText ?? '₹${(value ?? 0).toStringAsFixed(0)}',
            style: style.copyWith(
              color: freeText != null ? Colors.green : null,
            ),
          ),
        ],
      ),
    );
  }

  // Build a readable address from the stored jsonb (field names vary,
  // so we try both the order shape and the address-entity shape).
  String _formatAddress(Map<String, dynamic> a) {
    final name = a['fullName']?.toString() ?? '';
    final street =
        a['streetAddress']?.toString() ?? a['street']?.toString() ?? '';
    final apt = a['apartment']?.toString() ?? a['landmark']?.toString() ?? '';
    final city = a['city']?.toString() ?? '';
    final state = a['state']?.toString() ?? '';
    final pin = a['pinCode']?.toString() ?? a['pincode']?.toString() ?? '';
    final phone = a['phone']?.toString() ?? '';
    final parts = [
      if (name.isNotEmpty) name,
      [street, apt, city, state, pin]
          .where((s) => s.isNotEmpty)
          .join(', '),
      if (phone.isNotEmpty) 'Phone: $phone',
    ].where((s) => s.isNotEmpty);
    return parts.join('\n');
  }

  String _label(String status) {
    return status
        .split('_')
        .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
  }

  String _formatDate(String iso) {
    if (iso.isEmpty) return '';
    return iso.length >= 10 ? iso.substring(0, 10) : iso;
  }
}
