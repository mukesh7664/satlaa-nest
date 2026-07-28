// Basic smoke test: make sure the app builds and shows the Home tab.
// Web analogy: like a simple render test (render <App/> and assert something).

import 'package:flutter_test/flutter_test.dart';
import 'package:satlaa_app/main.dart';

void main() {
  testWidgets('App launches and shows Satlaa home', (WidgetTester tester) async {
    // Build the app.
    await tester.pumpWidget(const SatlaaApp());

    // The Home app bar title "Satlaa" should be visible.
    expect(find.text('Satlaa'), findsOneWidget);

    // The bottom navigation "Home" label should be visible.
    expect(find.text('Home'), findsOneWidget);
  });
}
