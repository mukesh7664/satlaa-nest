// Basic smoke test: make sure the app builds and shows the Home tab.
// Web analogy: like a simple render test (render <App/> and assert something).

import 'package:flutter_test/flutter_test.dart';
import 'package:fanostyle/main.dart';

void main() {
  testWidgets('App launches and shows Fanostyle home', (WidgetTester tester) async {
    // Build the app.
    await tester.pumpWidget(const FanostyleApp());

    // The Home app bar title "Fanostyle" should be visible.
    expect(find.text('Fanostyle'), findsOneWidget);

    // The bottom navigation "Home" label should be visible.
    expect(find.text('Home'), findsOneWidget);
  });
}
