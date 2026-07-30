import 'package:flutter/material.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../models/address.dart';
import '../services/cart_service.dart';
import '../services/order_service.dart';
import '../services/payment_service.dart';
import 'addresses_screen.dart';
import 'order_detail_screen.dart';

// CheckoutScreen — the final step before placing an order.
// Shows the selected shipping address + an order summary built from the
// server-side cart, then places the order via /checkout/create-order and
// opens the Razorpay payment popup, verifying the payment on success.
class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  List<Map<String, dynamic>> _items = []; // raw cart items
  double _total = 0;
  double _subtotal = 0;
  double _discount = 0;
  bool _loading = true;
  String? _error;
  Address? _address; // chosen shipping address
  bool _placing = false;

  late final Razorpay _razorpay; // native payment SDK instance
  String _pendingOrderId = ''; // backend order id awaiting payment

  @override
  void initState() {
    super.initState();
    // Set up the Razorpay SDK and its result listeners once.
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _onPaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _onPaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _onExternalWallet);
    _load();
  }

  @override
  void dispose() {
    _razorpay.clear(); // release native listeners
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final cart = await CartService.getCart();
      final rawItems = (cart['items'] as List?) ?? [];
      final totals = (cart['totals'] as Map<String, dynamic>?) ?? {};
      if (!mounted) return;
      setState(() {
        _items = rawItems.whereType<Map<String, dynamic>>().toList();
        _subtotal = _toDouble(totals['subtotal']);
        _discount = _toDouble(totals['discountAmount']) +
            _toDouble(totals['discount']);
        _total = _toDouble(totals['total']);
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

  // Open the address picker and keep the chosen address.
  Future<void> _pickAddress() async {
    final picked = await Navigator.of(context).push<Address>(
      MaterialPageRoute(
        builder: (_) => const AddressesScreen(selectable: true),
      ),
    );
    if (picked != null) setState(() => _address = picked);
  }

  // Build the order items array from the cart items.
  List<Map<String, dynamic>> _buildOrderItems() {
    return _items.map((item) {
      return {
        'productId': item['productId'],
        'quantity': _toInt(item['quantity']),
        'price': _toDouble(item['price']),
        if (item['variantId'] != null) 'variantId': item['variantId'],
        if (item['selectedVariant'] != null)
          'variantInfo': item['selectedVariant'],
        'purchaseType': 'buy',
      };
    }).toList();
  }

  // Step 1: create the order on the backend, then open the Razorpay popup
  // with the payment details the backend returns.
  Future<void> _placeOrder() async {
    if (_address == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a delivery address')),
      );
      return;
    }
    if (_items.isEmpty) return;

    setState(() => _placing = true);
    try {
      final result = await OrderService.createOrder(
        items: _buildOrderItems(),
        shippingAddress: _address!,
        paymentMethod: 'razorpay',
      );
      if (!mounted) return;

      final provider = result['provider']?.toString();
      final order = result['order'];
      _pendingOrderId =
          (order is Map ? order['id']?.toString() : null) ?? '';

      if (provider == 'razorpay') {
        _openRazorpay(result);
      } else {
        // No gateway (e.g. quote_request) — order is already created.
        _showCreatedDialog(order is Map ? order : null);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
      setState(() => _placing = false);
    }
    // Note: _placing stays true until a Razorpay callback fires.
  }

  // Open the native Razorpay checkout using the backend's init data.
  void _openRazorpay(Map<String, dynamic> initData) {
    final options = {
      'key': initData['key'],
      'order_id': initData['razorpayOrderId'],
      'amount': initData['amount'], // in paise, from the backend
      'currency': initData['currency'] ?? 'INR',
      'name': 'Satlaa',
      'description': 'Order payment',
      'prefill': {
        'contact': _address?.phone ?? '',
        'email': _address?.email ?? '',
      },
    };
    try {
      _razorpay.open(options);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Payment error: $e')));
        setState(() => _placing = false);
      }
    }
  }

  // Razorpay reported success -> verify the payment on the backend.
  Future<void> _onPaymentSuccess(PaymentSuccessResponse response) async {
    try {
      final ok = await PaymentService.verifyRazorpay(
        orderId: _pendingOrderId,
        razorpayOrderId: response.orderId ?? '',
        razorpayPaymentId: response.paymentId ?? '',
        razorpaySignature: response.signature ?? '',
      );
      if (!mounted) return;
      setState(() => _placing = false);
      if (ok) {
        _goToOrderDetail();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment could not be verified')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _placing = false);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  // Razorpay reported failure/cancellation.
  void _onPaymentError(PaymentFailureResponse response) {
    if (!mounted) return;
    setState(() => _placing = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Payment failed: ${response.message ?? 'cancelled'}'),
      ),
    );
  }

  void _onExternalWallet(ExternalWalletResponse response) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Wallet selected: ${response.walletName ?? ''}')),
    );
  }

  // After a verified payment, open the order's detail screen.
  void _goToOrderDetail() {
    if (_pendingOrderId.isEmpty) {
      Navigator.of(context).pop();
      return;
    }
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => OrderDetailScreen(orderId: _pendingOrderId),
      ),
    );
  }

  // Fallback dialog for the no-gateway (quote) path.
  void _showCreatedDialog(Map? order) {
    final orderNumber = order?['orderNumber']?.toString() ?? '';
    setState(() => _placing = false);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Order placed'),
        content: Text(orderNumber.isNotEmpty
            ? 'Order #$orderNumber has been created.'
            : 'Your order has been created.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _goToOrderDetail();
            },
            child: const Text('OK'),
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
        title: const Text('Checkout'),
      ),
      body: _buildBody(),
      bottomNavigationBar: (!_loading && _error == null && _items.isNotEmpty)
          ? _buildPlaceBar()
          : null,
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
    if (_items.isEmpty) {
      return const Center(
        child: Text('Your cart is empty', style: TextStyle(color: Colors.grey)),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // ---- Delivery address section ----
        const Text('Delivery Address',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        InkWell(
          onTap: _pickAddress,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(12),
            ),
            child: _address == null
                ? const Row(
                    children: [
                      Icon(Icons.add_location_alt_outlined,
                          color: Colors.deepPurple),
                      SizedBox(width: 10),
                      Text('Select delivery address',
                          style: TextStyle(color: Colors.deepPurple)),
                    ],
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_address!.fullName,
                          style:
                              const TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(_address!.summary),
                      const SizedBox(height: 4),
                      Text('Phone: ${_address!.phone}',
                          style: const TextStyle(
                              color: Colors.grey, fontSize: 13)),
                      const SizedBox(height: 6),
                      const Text('Tap to change',
                          style: TextStyle(
                              color: Colors.deepPurple, fontSize: 12)),
                    ],
                  ),
          ),
        ),

        const SizedBox(height: 24),

        // ---- Order items ----
        const Text('Order Summary',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        ..._items.map(_buildItemRow),

        const Divider(height: 28),

        // ---- Totals ----
        _totalRow('Subtotal', _subtotal),
        if (_discount > 0) _totalRow('Discount', -_discount),
        const SizedBox(height: 6),
        _totalRow('Total', _total, bold: true),
      ],
    );
  }

  Widget _buildItemRow(Map<String, dynamic> item) {
    final product = (item['product'] as Map<String, dynamic>?) ?? {};
    final name = product['title']?.toString() ?? 'Item';
    final qty = _toInt(item['quantity']);
    final price = _toDouble(item['price']);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(
            child: Text('$name  × $qty',
                maxLines: 2, overflow: TextOverflow.ellipsis),
          ),
          Text('₹${(price * qty).toStringAsFixed(0)}'),
        ],
      ),
    );
  }

  Widget _totalRow(String label, double value, {bool bold = false}) {
    final style = TextStyle(
      fontSize: bold ? 18 : 14,
      fontWeight: bold ? FontWeight.bold : FontWeight.normal,
      color: bold ? Colors.black : Colors.black87,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: style),
          Text('₹${value.toStringAsFixed(0)}', style: style),
        ],
      ),
    );
  }

  Widget _buildPlaceBar() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: SizedBox(
          height: 52,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.deepPurple,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onPressed: _placing ? null : _placeOrder,
            child: _placing
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white),
                  )
                : Text('Place Order  •  ₹${_total.toStringAsFixed(0)}'),
          ),
        ),
      ),
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
