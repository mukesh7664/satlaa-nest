// Order + OrderItem models — match the backend Order/OrderItem entities.
//
// Orders come back from GET /orders ({ data: [...] }) and GET /orders/:id.
// We only parse the fields the app actually displays.

// One line item inside an order.
class OrderItem {
  final String id;
  final String productName;
  final String imageUrl; // best-effort (backend may not always send it)
  final double price;
  final int quantity;
  final double totalPrice;
  final Map<String, dynamic>? variantInfo;

  const OrderItem({
    this.id = '',
    required this.productName,
    this.imageUrl = '',
    required this.price,
    required this.quantity,
    required this.totalPrice,
    this.variantInfo,
  });

  factory OrderItem.fromApi(Map<String, dynamic> json) {
    // Image can live in a few places depending on how the backend joins it.
    String image = '';
    final product = json['product'];
    if (product is Map) {
      final media = product['media'];
      if (media is List && media.isNotEmpty && media.first is Map) {
        image = (media.first as Map)['url']?.toString() ?? '';
      }
      image = image.isNotEmpty
          ? image
          : (product['icon'] is Map
              ? (product['icon']['url']?.toString() ?? '')
              : '');
    }

    return OrderItem(
      id: json['id']?.toString() ?? '',
      productName: json['productName']?.toString() ??
          (product is Map ? product['title']?.toString() ?? 'Item' : 'Item'),
      imageUrl: image,
      price: _toDouble(json['price']),
      quantity: _toInt(json['quantity']),
      totalPrice: _toDouble(json['totalPrice']),
      variantInfo: json['variantInfo'] is Map
          ? Map<String, dynamic>.from(json['variantInfo'])
          : null,
    );
  }
}

class Order {
  final String id;
  final String orderNumber;
  final String status;
  final String paymentStatus;
  final String paymentMethod;
  final double totalAmount;
  final double subtotal;
  final double taxAmount;
  final double shippingCost;
  final double discountAmount;
  final String currency;
  final String trackingId;
  final String createdAt;
  final List<OrderItem> items;
  final Map<String, dynamic>? shippingAddress;

  const Order({
    required this.id,
    this.orderNumber = '',
    this.status = 'pending',
    this.paymentStatus = 'unpaid',
    this.paymentMethod = '',
    this.totalAmount = 0,
    this.subtotal = 0,
    this.taxAmount = 0,
    this.shippingCost = 0,
    this.discountAmount = 0,
    this.currency = 'INR',
    this.trackingId = '',
    this.createdAt = '',
    this.items = const [],
    this.shippingAddress,
  });

  factory Order.fromApi(Map<String, dynamic> json) {
    final rawItems = (json['items'] as List?) ?? [];
    return Order(
      id: json['id']?.toString() ?? '',
      orderNumber: json['orderNumber']?.toString() ?? '',
      status: json['status']?.toString() ?? 'pending',
      paymentStatus: json['paymentStatus']?.toString() ?? 'unpaid',
      paymentMethod: json['paymentMethod']?.toString() ?? '',
      totalAmount: _toDouble(json['totalAmount']),
      subtotal: _toDouble(json['subtotal']),
      taxAmount: _toDouble(json['taxAmount']),
      shippingCost: _toDouble(json['shippingCost']),
      discountAmount: _toDouble(json['discountAmount']),
      currency: json['currency']?.toString() ?? 'INR',
      trackingId: json['trackingId']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? '',
      items: rawItems
          .whereType<Map<String, dynamic>>()
          .map((e) => OrderItem.fromApi(e))
          .toList(),
      shippingAddress: json['shippingAddress'] is Map
          ? Map<String, dynamic>.from(json['shippingAddress'])
          : null,
    );
  }

  // A short, human-friendly label for the status.
  String get statusLabel {
    return status
        .split('_')
        .map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}')
        .join(' ');
  }

  // Whether this order can still be cancelled (early statuses only).
  bool get canCancel {
    const cancellable = {
      'pending',
      'confirmed',
      'processing',
      'ready_to_ship',
    };
    return cancellable.contains(status);
  }
}

// Shared number parsing (values may be numbers or numeric strings).
double _toDouble(dynamic v) {
  if (v is num) return v.toDouble();
  return double.tryParse(v?.toString() ?? '') ?? 0;
}

int _toInt(dynamic v) {
  if (v is num) return v.toInt();
  return int.tryParse(v?.toString() ?? '') ?? 0;
}
