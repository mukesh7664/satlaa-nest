import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/address.dart';
import '../services/address_service.dart';
import 'address_form_screen.dart';

// AddressesScreen — lists the user's saved addresses with add/edit/delete
// and "set default". Can also be used as a picker during checkout: pass
// [selectable] = true, and tapping an address returns it via Navigator.pop.
class AddressesScreen extends StatefulWidget {
  final bool selectable;

  const AddressesScreen({super.key, this.selectable = false});

  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  List<Address> _addresses = [];
  bool _loading = true;
  String? _error;

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
      final items = await AddressService.getAddresses();
      if (!mounted) return;
      setState(() {
        _addresses = items;
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

  // Open the add/edit form. Reloads the list if something was saved.
  Future<void> _openForm({Address? existing}) async {
    final saved = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => AddressFormScreen(existing: existing),
      ),
    );
    if (saved == true) _load();
  }

  Future<void> _delete(Address a) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete address?'),
        content: Text(a.summary),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    try {
      await AddressService.deleteAddress(a.id);
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _setDefault(Address a) async {
    try {
      await AddressService.setDefault(a.id);
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: AppColors.brand,
        foregroundColor: Colors.white,
        title: Text(widget.selectable ? 'Select Address' : 'My Addresses'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.brand,
        foregroundColor: Colors.white,
        onPressed: () => _openForm(),
        icon: const Icon(Icons.add),
        label: const Text('Add'),
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
    if (_addresses.isEmpty) {
      return const Center(
        child: Text('No saved addresses yet',
            style: TextStyle(color: Colors.grey)),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 88),
        itemCount: _addresses.length,
        separatorBuilder: (_, _) => const SizedBox(height: 12),
        itemBuilder: (context, index) => _buildCard(_addresses[index]),
      ),
    );
  }

  Widget _buildCard(Address a) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: a.isDefault ? AppColors.brand : Colors.grey.shade200,
          width: a.isDefault ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(a.fullName,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(width: 8),
              if (a.isDefault)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceAlt,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text('Default',
                      style: TextStyle(
                          fontSize: 11, color: AppColors.brand)),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(a.summary, style: const TextStyle(color: Colors.black87)),
          const SizedBox(height: 4),
          Text('Phone: ${a.phone}',
              style: const TextStyle(color: Colors.grey, fontSize: 13)),
          const SizedBox(height: 8),

          // Action row
          Row(
            children: [
              // In picker mode, the primary action is "Deliver here".
              if (widget.selectable)
                TextButton.icon(
                  onPressed: () => Navigator.of(context).pop(a),
                  icon: const Icon(Icons.check_circle, size: 18),
                  label: const Text('Deliver here'),
                ),
              if (!widget.selectable && !a.isDefault)
                TextButton(
                  onPressed: () => _setDefault(a),
                  child: const Text('Set default'),
                ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.edit, size: 20, color: Colors.grey),
                onPressed: () => _openForm(existing: a),
              ),
              IconButton(
                icon:
                    const Icon(Icons.delete_outline, size: 20, color: Colors.red),
                onPressed: () => _delete(a),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
