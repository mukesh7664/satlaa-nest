import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

// LabeledField — shows a text label ABOVE the input (modern form style),
// instead of the Material floating label that sits on the border.
// Wrap any input widget (TextFormField, DropdownButtonFormField, etc.).
class LabeledField extends StatelessWidget {
  final String label;
  final Widget child;
  final bool required;
  final EdgeInsetsGeometry padding;

  const LabeledField({
    super.key,
    required this.label,
    required this.child,
    this.required = false,
    this.padding = const EdgeInsets.only(bottom: 16),
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // The label, sitting above the input box.
          Padding(
            padding: const EdgeInsets.only(bottom: 6, left: 2),
            child: Text.rich(
              TextSpan(
                text: label,
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
                children: required
                    ? const [
                        TextSpan(
                          text: ' *',
                          style: TextStyle(color: AppColors.danger),
                        ),
                      ]
                    : null,
              ),
            ),
          ),
          child,
        ],
      ),
    );
  }
}
