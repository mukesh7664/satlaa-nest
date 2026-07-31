// Support ticket models — mirror the backend /support/tickets contract.
//
// Ticket statuses: open | in_progress | resolved | closed
// Priorities:      low | medium | high | urgent
// Messages have a senderRole of 'customer' or 'admin'.

class Ticket {
  final String id;
  final String subject;
  final String description;
  final String category;
  final String status;
  final String priority;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Ticket({
    required this.id,
    required this.subject,
    required this.description,
    required this.category,
    required this.status,
    required this.priority,
    this.createdAt,
    this.updatedAt,
  });

  // Human-friendly status label, e.g. "in_progress" -> "In Progress".
  String get statusLabel {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  }

  bool get isClosed => status == 'closed' || status == 'resolved';

  factory Ticket.fromApi(Map<String, dynamic> json) {
    return Ticket(
      id: json['id']?.toString() ?? '',
      subject: json['subject']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      status: json['status']?.toString() ?? 'open',
      priority: json['priority']?.toString() ?? 'medium',
      createdAt: _toDate(json['createdAt']),
      updatedAt: _toDate(json['updatedAt']),
    );
  }

  static DateTime? _toDate(dynamic v) {
    if (v == null) return null;
    return DateTime.tryParse(v.toString())?.toLocal();
  }
}

class TicketMessage {
  final String id;
  final String ticketId;
  final String senderRole; // 'customer' | 'admin'
  final String message;
  final String senderName;
  final DateTime? createdAt;

  const TicketMessage({
    required this.id,
    required this.ticketId,
    required this.senderRole,
    required this.message,
    required this.senderName,
    this.createdAt,
  });

  // True when this message was sent by the logged-in customer (right side).
  bool get isMine => senderRole == 'customer';

  factory TicketMessage.fromApi(Map<String, dynamic> json) {
    return TicketMessage(
      id: json['id']?.toString() ?? '',
      ticketId: json['ticketId']?.toString() ?? '',
      senderRole: json['senderRole']?.toString() ?? 'customer',
      message: json['message']?.toString() ?? '',
      senderName: json['senderName']?.toString() ??
          (json['senderRole'] == 'admin' ? 'Support Team' : 'You'),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '')
          ?.toLocal(),
    );
  }
}
