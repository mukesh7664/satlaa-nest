import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/ticket.dart';
import '../services/support_service.dart';

// SupportDetailScreen — shows a ticket's detail and its chat thread,
// lets the customer reply, and close the ticket.
class SupportDetailScreen extends StatefulWidget {
  final String ticketId;

  const SupportDetailScreen({super.key, required this.ticketId});

  @override
  State<SupportDetailScreen> createState() => _SupportDetailScreenState();
}

class _SupportDetailScreenState extends State<SupportDetailScreen> {
  Ticket? _ticket;
  List<TicketMessage> _messages = [];
  bool _loading = true;
  String? _error;

  final _reply = TextEditingController();
  final _scroll = ScrollController();
  bool _sending = false;
  bool _closing = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _reply.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      // Ticket detail + messages together.
      final ticket = await SupportService.getTicket(widget.ticketId);
      final messages = await SupportService.getMessages(widget.ticketId);
      if (!mounted) return;
      setState(() {
        _ticket = ticket;
        _messages = messages;
        _loading = false;
      });
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send() async {
    final text = _reply.text.trim();
    if (text.isEmpty || _sending) return;

    setState(() => _sending = true);
    try {
      final msg = await SupportService.sendMessage(widget.ticketId, text);
      if (!mounted) return;
      setState(() {
        _messages = [..._messages, msg];
        _reply.clear();
        _sending = false;
        // A reply reopens a resolved/closed ticket on the backend.
        if (_ticket != null && _ticket!.isClosed) {
          _ticket = Ticket(
            id: _ticket!.id,
            subject: _ticket!.subject,
            description: _ticket!.description,
            category: _ticket!.category,
            status: 'open',
            priority: _ticket!.priority,
            createdAt: _ticket!.createdAt,
            updatedAt: DateTime.now(),
          );
        }
      });
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      setState(() => _sending = false);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _close() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Close ticket'),
        content: const Text(
            'Mark this ticket as closed? You can reopen it by replying again.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Close ticket',
                  style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => _closing = true);
    try {
      await SupportService.closeTicket(widget.ticketId);
      if (!mounted) return;
      setState(() => _closing = false);
      _load();
    } catch (e) {
      if (!mounted) return;
      setState(() => _closing = false);
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
        title: const Text('Ticket'),
        actions: [
          if (_ticket != null && !_ticket!.isClosed)
            _closing
                ? const Padding(
                    padding: EdgeInsets.all(14),
                    child: SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    ),
                  )
                : IconButton(
                    tooltip: 'Close ticket',
                    onPressed: _close,
                    icon: const Icon(Icons.check_circle_outline),
                  ),
        ],
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

    final ticket = _ticket!;
    return Column(
      children: [
        // ---- Ticket header (subject, status, category, description) ----
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(ticket.subject,
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                  _statusBadge(ticket.status, ticket.statusLabel),
                ],
              ),
              const SizedBox(height: 6),
              Text('${ticket.category}  •  Priority: ${ticket.priority}',
                  style:
                      TextStyle(color: Colors.grey.shade600, fontSize: 12)),
              if (ticket.description.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(ticket.description,
                    style: const TextStyle(fontSize: 14, height: 1.4)),
              ],
            ],
          ),
        ),

        // ---- Chat thread ----
        Expanded(
          child: _messages.isEmpty
              ? const Center(
                  child: Text('No replies yet. Send a message below.',
                      style: TextStyle(color: Colors.grey)),
                )
              : ListView.builder(
                  controller: _scroll,
                  padding: const EdgeInsets.all(14),
                  itemCount: _messages.length,
                  itemBuilder: (context, i) => _messageBubble(_messages[i]),
                ),
        ),

        // ---- Reply box ----
        _buildReplyBar(),
      ],
    );
  }

  Widget _messageBubble(TicketMessage m) {
    final mine = m.isMine;
    return Align(
      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 5),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        decoration: BoxDecoration(
          color: mine ? AppColors.brand : Colors.grey.shade100,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(14),
            topRight: const Radius.circular(14),
            bottomLeft: Radius.circular(mine ? 14 : 2),
            bottomRight: Radius.circular(mine ? 2 : 14),
          ),
        ),
        child: Column(
          crossAxisAlignment:
              mine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            if (!mine)
              Padding(
                padding: const EdgeInsets.only(bottom: 3),
                child: Text(m.senderName,
                    style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppColors.brand)),
              ),
            Text(
              m.message,
              style: TextStyle(
                  color: mine ? Colors.white : Colors.black87, fontSize: 14),
            ),
            if (m.createdAt != null) ...[
              const SizedBox(height: 3),
              Text(
                _time(m.createdAt!),
                style: TextStyle(
                    fontSize: 10,
                    color: mine ? Colors.white70 : Colors.grey.shade500),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildReplyBar() {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey.shade200)),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _reply,
                minLines: 1,
                maxLines: 4,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            CircleAvatar(
              radius: 22,
              backgroundColor: AppColors.brand,
              child: _sending
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : IconButton(
                      icon: const Icon(Icons.send, color: Colors.white),
                      onPressed: _send,
                    ),
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
      child: Text(label,
          style: TextStyle(
              color: color, fontSize: 12, fontWeight: FontWeight.w600)),
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
        return AppColors.brand;
    }
  }

  String _time(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '${dt.day}/${dt.month} $h:$m';
  }
}
