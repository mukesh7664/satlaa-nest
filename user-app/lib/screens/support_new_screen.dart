import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/labeled_field.dart';
import '../services/support_service.dart';

// SupportNewScreen — form to create a new support ticket.
// Pops with `true` when a ticket was successfully created.
class SupportNewScreen extends StatefulWidget {
  const SupportNewScreen({super.key});

  @override
  State<SupportNewScreen> createState() => _SupportNewScreenState();
}

class _SupportNewScreenState extends State<SupportNewScreen> {
  final _formKey = GlobalKey<FormState>();
  final _subject = TextEditingController();
  final _description = TextEditingController();

  // Same options the web app uses.
  static const _categories = [
    'Order',
    'Payment',
    'Delivery',
    'Return / Refund',
    'Product',
    'Other',
  ];
  static const _priorities = ['low', 'medium', 'high', 'urgent'];

  String _category = 'Order';
  String _priority = 'medium';
  bool _saving = false;

  @override
  void dispose() {
    _subject.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);
    try {
      await SupportService.createTicket(
        subject: _subject.text.trim(),
        description: _description.text.trim(),
        category: _category,
        priority: _priority,
      );
      if (!mounted) return;
      Navigator.of(context).pop(true); // signal "created"
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
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: AppColors.brand,
        foregroundColor: Colors.white,
        title: const Text('New Ticket'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Subject
            LabeledField(
              label: 'Subject',
              required: true,
              child: TextFormField(
                controller: _subject,
                decoration: const InputDecoration(
                    hintText: 'Short summary of your issue'),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Subject is required'
                    : null,
              ),
            ),

            // Category
            LabeledField(
              label: 'Category',
              child: DropdownButtonFormField<String>(
                initialValue: _category,
                items: _categories
                    .map((c) =>
                        DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (v) => setState(() => _category = v ?? _category),
              ),
            ),

            // Priority
            LabeledField(
              label: 'Priority',
              child: DropdownButtonFormField<String>(
                initialValue: _priority,
                items: _priorities
                    .map((p) => DropdownMenuItem(
                          value: p,
                          child: Text(_priorityLabel(p)),
                        ))
                    .toList(),
                onChanged: (v) => setState(() => _priority = v ?? _priority),
              ),
            ),

            // Description
            LabeledField(
              label: 'Describe your issue',
              required: true,
              child: TextFormField(
                controller: _description,
                maxLines: 6,
                decoration: const InputDecoration(
                    hintText: 'Tell us what happened...'),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Please describe your issue'
                    : null,
              ),
            ),

            const SizedBox(height: 8),
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
                onPressed: _saving ? null : _submit,
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Submit Ticket'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _priorityLabel(String p) => p[0].toUpperCase() + p.substring(1);
}
