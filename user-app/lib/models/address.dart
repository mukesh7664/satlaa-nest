// Address model — matches the backend Address entity.
// Backend fields (note the exact names): fullName, phone, email, street,
// landmark, city, state, country, pincode, isDefault, type.
class Address {
  final String id;
  final String fullName;
  final String phone;
  final String email;
  final String street; // main address line
  final String landmark; // secondary line (optional)
  final String city;
  final String state;
  final String country;
  final String pincode;
  final bool isDefault;
  final String type; // "shipping" | "billing" | "both"

  const Address({
    this.id = '',
    required this.fullName,
    required this.phone,
    this.email = '',
    required this.street,
    this.landmark = '',
    required this.city,
    required this.state,
    this.country = 'India',
    required this.pincode,
    this.isDefault = false,
    this.type = 'both',
  });

  factory Address.fromApi(Map<String, dynamic> json) {
    return Address(
      id: json['id']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      street: json['street']?.toString() ?? '',
      landmark: json['landmark']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      state: json['state']?.toString() ?? '',
      country: json['country']?.toString() ?? 'India',
      pincode: json['pincode']?.toString() ?? '',
      isDefault: json['isDefault'] == true,
      type: json['type']?.toString() ?? 'both',
    );
  }

  // Body sent to POST/PUT /addresses.
  Map<String, dynamic> toApi() {
    return {
      'fullName': fullName,
      'phone': phone,
      'email': email,
      'street': street,
      'landmark': landmark,
      'city': city,
      'state': state,
      'country': country,
      'pincode': pincode,
      'isDefault': isDefault,
      'type': type,
    };
  }

  // The order endpoints want a slightly different address shape
  // (streetAddress / apartment / pinCode). This maps our Address to it.
  Map<String, dynamic> toOrderShape() {
    return {
      'fullName': fullName,
      'streetAddress': street,
      'apartment': landmark,
      'city': city,
      'state': state,
      'pinCode': pincode,
      'country': country,
      'phone': phone,
      'email': email,
    };
  }

  // One-line summary for showing in lists.
  String get summary {
    final parts = [street, if (landmark.isNotEmpty) landmark, city, state, pincode]
        .where((s) => s.isNotEmpty);
    return parts.join(', ');
  }
}
