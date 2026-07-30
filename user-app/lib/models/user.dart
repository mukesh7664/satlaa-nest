// User model — matches the Customer entity returned by the backend.
// The backend returns flat fields only: id, name, email, phone, isActive,
// createdAt, updatedAt. (No firstName/lastName at runtime.)
class User {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final bool isActive;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.isActive = true,
  });

  // Build a User from the JSON map the backend sends.
  // Web analogy: like parsing the JSON response into a typed object.
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      phone: json['phone']?.toString(),
      isActive: json['isActive'] ?? true,
    );
  }

  // Convert back to JSON — used to cache the user on the device.
  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'isActive': isActive,
      };
}
