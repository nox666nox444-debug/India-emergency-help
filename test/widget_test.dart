import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../lib/main.dart';

void main() {
  testWidgets('Emergency App smoke test - verifies AppBar and SOS card', (WidgetTester tester) async {
    // Build India Emergency Help App
    await tester.pumpWidget(const IndiaEmergencyApp());

    // Verify Title and Subtitle exist
    expect(find.text('INDIA EMERGENCY HELP'), findsOneWidget);
    expect(find.text('Your Safety Partner'), findsOneWidget);

    // Verify Emergency SOS button is present
    expect(find.text('SOS'), findsOneWidget);
    expect(find.text('IN CASE OF EMERGENCY'), findsOneWidget);

    // Verify primary emergency numbers are rendered
    expect(find.text('112'), findsOneWidget);
    expect(find.text('100'), findsOneWidget);
    expect(find.text('101'), findsOneWidget);
    expect(find.text('102'), findsOneWidget);
    expect(find.text('181'), findsOneWidget);
    expect(find.text('1930'), findsOneWidget);

    // Verify Voice Assistant section is present
    expect(find.text('AI Voice Emergency Assistant'), findsOneWidget);
    expect(find.text('Start Assistant'), findsOneWidget);
  });

  testWidgets('Emergency keywords analysis logic test', (WidgetTester tester) async {
    await tester.pumpWidget(const IndiaEmergencyApp());

    final homeState = tester.state<_HomePageState>(find.byType(HomePage));

    // Test English and Hindi accident keywords
    expect(homeState.analyseEmergency('Accident on highway'), contains('accident detected'));
    expect(homeState.analyseEmergency('गाड़ी की दुर्घटना हो गई'), contains('accident detected'));

    // Test Medical / Cardiac keywords
    expect(homeState.analyseEmergency('severe chest pain'), contains('medical emergency'));
    expect(homeState.analyseEmergency('सांस लेने में दिक्कत'), contains('medical emergency'));

    // Test Threat / Police keywords
    expect(homeState.analyseEmergency('someone is attacking me'), contains('safety threat'));
    expect(homeState.analyseEmergency('पीछा कर रहा है कोई'), contains('safety threat'));

    // Test Fire keywords
    expect(homeState.analyseEmergency('heavy smoke and fire'), contains('fire emergency'));
    expect(homeState.analyseEmergency('आग लग गई है'), contains('fire emergency'));
  });

  testWidgets('Earthquake Emergency Screen and Checklist test', (WidgetTester tester) async {
    // Render EarthquakeScreen directly
    await tester.pumpWidget(
      const MaterialApp(
        home: EarthquakeScreen(),
      ),
    );

    // Verify header, action button and core safety advice
    expect(find.text('EARTHQUAKE SAFETY SYSTEM'), findsOneWidget);
    expect(find.text('CALL EMERGENCY 112'), findsOneWidget);
    expect(find.text('DROP'), findsOneWidget);
    expect(find.text('COVER'), findsOneWidget);
    expect(find.text('HOLD ON'), findsOneWidget);

    // Verify after earthquake points
    expect(find.text('Avoid damaged buildings'), findsOneWidget);
    expect(find.text('Expect aftershocks'), findsOneWidget);
    expect(find.text('Check for injuries'), findsOneWidget);
    expect(find.text('Coastal safety'), findsOneWidget);

    // Verify official links
    expect(find.text('National Center for Seismology'), findsOneWidget);
    expect(find.text('NDMA India'), findsOneWidget);

    // Verify checklist items
    expect(find.text('Drinking water'), findsOneWidget);
    expect(find.text('First aid kit'), findsOneWidget);
    expect(find.text('Flashlight and batteries'), findsOneWidget);

    // Tap on a checklist item and ensure toggle works
    await tester.tap(find.text('Drinking water'));
    await tester.pump();
  });
}
