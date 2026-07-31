import 'package:flutter/material.dart';
import '../models/ticket.dart';
import '../services/support_service.dart';
import 'support_new_screen.dart';
import 'support_detail_screen.dart';

// SupportScreen — lists the customer's support tickets and lets them
// open one (to chat) or create a new one.
class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  List<Ticket> _tickets = [];
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
      final tickets = await SupportService.getTickets();
      if (!mounted) return;
      setState(() {
        _tickets = tickets;
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

  // Open the create form; refresh the list if a ticket was created.
  Future<void> _newTicket() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const SupportNewScreen()),
    );
    if (created == true) _load();
  }

  Future<void> _openTicket(Ticket ticket) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => SupportDetailScreen(ticketId: ticket.id),
      ),
    );
    // Status/last-reply may have changed while viewing; refresh on return.
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        title: const Text('Help & Support'),
      ),
      body: _buildBody(),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _newTicket,
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('New Ticket'),
      ),
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
    if (_tickets.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.support_agent, size: 56, color: Colors.grey.shade400),
            const SizedBox(height: 10),
            const Text('No support tickets yet',
                style: TextStyle(color: Colors.grey, fontSize: 16)),
            const SizedBox(height: 4),
            const Text('Tap "New Ticket" to reach out to us.',
                style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _tickets.length,
        separatorBuilder: (_, _) => const SizedBox(height: 12),
        itemBuilder: (context, i) => _ticketCard(_tickets[i]),
      ),
    );
  }

  Widget _ticketCard(Ticket t) {
    return InkWell(
      onTap: () => _openTicket(t),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    t.subject,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ),
                _statusBadge(t.status, t.statusLabel),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.label_outline,
                    size: 15, color: Colors.grey.shade600),
                const SizedBox(width: 4),
                Text(t.category,
                    style:
                        TextStyle(color: Colors.grey.shade700, fontSize: 13)),
                const Spacer(),
                if (t.updatedAt != null)
                  Text(_ago(t.updatedAt!),
                      style: TextStyle(
                          color: Colors.grey.shade500, fontSize: 12)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(String status, String label) {
    final color = _statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
            color: color, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'open':
        return Colors.blue;
      case 'in_progress':
        return Colors.orange;
      case 'resolved':
        return Colors.green;
      case 'closed':
        return Colors.grey;
      default:
        return Colors.deepPurple;
    }
  }

  // Short relative time, e.g. "2h ago", "3d ago".
  String _ago(DateTime dt) {
    final d = DateTime.now().difference(dt);
    if (d.inMinutes < 1) return 'just now';
    if (d.inMinutes < 60) return '${d.inMinutes}m ago';
    if (d.inHours < 24) return '${d.inHours}h ago';
    if (d.inDays < 30) return '${d.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
