import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/labeled_field.dart';
import '../models/address.dart';
import '../services/address_service.dart';

// AddressFormScreen — add a new address or edit an existing one.
// Pass an [existing] address to edit; pass null to add a new one.
// Returns true (via Navigator.pop) when something was saved, so the
// caller can refresh its list.
class AddressFormScreen extends StatefulWidget {
  final Address? existing;

  const AddressFormScreen({super.key, this.existing});

  @override
  State<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends State<AddressFormScreen> {
  final _formKey = GlobalKey<FormState>();

  // One controller per text field.
  late final TextEditingController _fullName;
  late final TextEditingController _phone;
  late final TextEditingController _email;
  late final TextEditingController _street;
  late final TextEditingController _landmark;
  late final TextEditingController _city;
  late final TextEditingController _state;
  late final TextEditingController _pincode;

  bool _isDefault = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final a = widget.existing;
    _fullName = TextEditingController(text: a?.fullName ?? '');
    _phone = TextEditingController(text: a?.phone ?? '');
    _email = TextEditingController(text: a?.email ?? '');
    _street = TextEditingController(text: a?.street ?? '');
    _landmark = TextEditingController(text: a?.landmark ?? '');
    _city = TextEditingController(text: a?.city ?? '');
    _state = TextEditingController(text: a?.state ?? '');
    _pincode = TextEditingController(text: a?.pincode ?? '');
    _isDefault = a?.isDefault ?? false;
  }

  @override
  void dispose() {
    // Always free controllers to avoid memory leaks.
    _fullName.dispose();
    _phone.dispose();
    _email.dispose();
    _street.dispose();
    _landmark.dispose();
    _city.dispose();
    _state.dispose();
    _pincode.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);
    final address = Address(
      fullName: _fullName.text.trim(),
      phone: _phone.text.trim(),
      email: _email.text.trim(),
      street: _street.text.trim(),
      landmark: _landmark.text.trim(),
      city: _city.text.trim(),
      state: _state.text.trim(),
      pincode: _pincode.text.trim(),
      country: 'India',
      isDefault: _isDefault,
      type: 'both',
    );

    try {
      if (widget.existing == null) {
        await AddressService.createAddress(address);
      } else {
        await AddressService.updateAddress(widget.existing!.id, address);
      }
      if (!mounted) return;
      Navigator.of(context).pop(true); // signal "saved"
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final editing = widget.existing != null;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: AppColors.brand,
        foregroundColor: Colors.white,
        title: Text(editing ? 'Edit Address' : 'Add Address'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _field(_fullName, 'Full Name', required: true),
            _field(
              _phone,
              'Phone',
              required: true,
              keyboard: TextInputType.phone,
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Phone is required';
                if (v.trim().length < 10) return 'Enter a valid phone';
                return null;
              },
            ),
            _field(_email, 'Email (optional)',
                keyboard: TextInputType.emailAddress),
            _field(_street, 'Street Address', required: true, maxLines: 2),
            _field(_landmark, 'Landmark (optional)'),
            _field(_city, 'City', required: true),
            _field(_state, 'State', required: true),
            _field(
              _pincode,
              'Pincode',
              required: true,
              keyboard: TextInputType.number,
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Pincode is required';
                if (v.trim().length != 6) return 'Enter a 6-digit pincode';
                return null;
              },
            ),

            // Default toggle
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Set as default address'),
              value: _isDefault,
              activeThumbColor: AppColors.brand,
              onChanged: (v) => setState(() => _isDefault = v),
            ),

            const SizedBox(height: 16),
            SizedBox(
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.brand,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : Text(editing ? 'Update Address' : 'Save Address'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // A single labelled text field: label shown ABOVE the input box.
  Widget _field(
    TextEditingController controller,
    String label, {
    bool required = false,
    TextInputType? keyboard,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    // Strip a trailing "(optional)" from the visible label for the required mark.
    final isRequired = required || validator != null;
    return LabeledField(
      label: label,
      required: isRequired,
      child: TextFormField(
        controller: controller,
        keyboardType: keyboard,
        maxLines: maxLines,
        decoration: const InputDecoration(hintText: ''),
        validator: validator ??
            (required
                ? (v) => (v == null || v.trim().isEmpty)
                    ? '$label is required'
                    : null
                : null),
      ),
    );
  }
}
