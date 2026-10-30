import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

void main() {
  runApp(const IndiaEmergencyApp());
}

class IndiaEmergencyApp extends StatelessWidget {
  const IndiaEmergencyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'India Emergency Help',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xffF3F6FA),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xff173B60),
        ),
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => HomePageState();
}

class HomePageState extends State<HomePage> {
  final stt.SpeechToText speech = stt.SpeechToText();

  bool listening = false;
  String recognizedText = '';
  String emergencyResult = '';

  final List<String> contacts = [];

  Future<void> callNumber(String number) async {
    final uri = Uri(scheme: 'tel', path: number);

    try {
      await launchUrl(uri);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to open phone dialer')),
      );
    }
  }

  Future<void> startVoiceAssistant() async {
    final available = await speech.initialize();

    if (!available) {
      setState(() {
        emergencyResult =
            'Voice recognition unavailable. Check microphone permission.';
      });
      return;
    }

    setState(() {
      listening = true;
      recognizedText = '';
      emergencyResult = 'Listening... Speak clearly.';
    });

    await speech.listen(
      localeId: 'en_IN',
      onResult: (result) {
        setState(() {
          recognizedText = result.recognizedWords;
          emergencyResult = analyseEmergency(recognizedText);
        });
      },
    );
  }

  Future<void> stopVoiceAssistant() async {
    await speech.stop();
    setState(() {
      listening = false;
    });
  }

  String analyseEmergency(String text) {
    final value = text.toLowerCase();

    if (RegExp(
      r'accident|injury|bleeding|hurt|चोट|दुर्घटना|ਜ਼ਖ਼ਮੀ',
    ).hasMatch(value)) {
      return 'Possible accident detected. Consider calling 112.';
    }

    if (RegExp(
      r'breathing|chest pain|heart|सांस|सीने में दर्द|ਸਾਹ',
    ).hasMatch(value)) {
      return 'Possible medical emergency. Call 112 immediately.';
    }

    if (RegExp(
      r'attack|follow|threat|police|हमला|पीछा|ਪਿੱਛਾ',
    ).hasMatch(value)) {
      return 'Possible safety threat. Move to a safe place and call 112.';
    }

    if (RegExp(
      r'fire|smoke|आग|धुआं|ਅੱਗ',
    ).hasMatch(value)) {
      return 'Possible fire emergency. Move away from danger and call 112.';
    }

    return 'If you are in immediate danger, call 112.';
  }

  void showSOSDialog() {
    bool consent = false;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Emergency SOS'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Do you want to call emergency services?',
                  ),
                  const SizedBox(height: 15),
                  CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    value: consent,
                    onChanged: (value) {
                      setDialogState(() {
                        consent = value ?? false;
                      });
                    },
                    title: const Text(
                      'I consent to location sharing with my selected contacts.',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),
                  const Text(
                    'Location sharing is not implemented in this starter.',
                    style: TextStyle(fontSize: 11),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () {
                    Navigator.pop(context);
                    callNumber('112');
                  },
                  child: const Text('Call 112'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void addContact(String name, String phone) {
    if (name.trim().isEmpty || phone.trim().isEmpty) return;

    setState(() {
      contacts.add('$name - $phone');
    });
  }

  Widget emergencyButton(
    String number,
    String title,
    IconData icon,
  ) {
    return Card(
      child: InkWell(
        onTap: () => callNumber(number),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              Icon(icon, color: const Color(0xffD52D3C)),
              const SizedBox(height: 5),
              Text(
                number,
                style: const TextStyle(
                  fontSize: 19,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                title,
                style: const TextStyle(fontSize: 11),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget serviceTile(
    String title,
    String subtitle,
    IconData icon,
    VoidCallback action,
  ) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: const Color(0xff173B60)),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: action,
      ),
    );
  }

  void showInfo(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void showContacts() {
    final name = TextEditingController();
    final phone = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Trusted Contacts'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: name,
              decoration: const InputDecoration(
                labelText: 'Contact name',
              ),
            ),
            TextField(
              controller: phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Phone number',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              addContact(name.text, phone.text);
              Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xff102B4D),
        foregroundColor: Colors.white,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'INDIA EMERGENCY HELP',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            Text(
              'Your Safety Partner',
              style: TextStyle(fontSize: 11),
            ),
          ],
        ),
      ),

      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Emergency Assistance',
            style: TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xffC62838),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              children: [
                const Text(
                  'IN CASE OF EMERGENCY',
                  style: TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 12),

                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.red,
                    shape: const CircleBorder(),
                    padding: const EdgeInsets.all(30),
                  ),
                  onPressed: showSOSDialog,
                  child: const Text(
                    'SOS',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),

                const Text(
                  'Emergency assistance',
                  style: TextStyle(color: Colors.white),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          const Text(
            'AI Voice Emergency Assistant',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),

          Card(
            child: Padding(
              padding: const EdgeInsets.all(15),
              child: Column(
                children: [
                  const Icon(
                    Icons.mic,
                    size: 40,
                    color: Color(0xff173B60),
                  ),

                  const Text(
                    'Describe your emergency using your voice.',
                  ),

                  const SizedBox(height: 12),

                  FilledButton.icon(
                    onPressed: listening
                        ? stopVoiceAssistant
                        : startVoiceAssistant,
                    icon: Icon(
                      listening ? Icons.stop : Icons.mic,
                    ),
                    label: Text(
                      listening ? 'Stop Listening' : 'Start Assistant',
                    ),
                  ),

                  const SizedBox(height: 12),

                  Text('You said: $recognizedText'),

                  const SizedBox(height: 8),

                  Text(
                    emergencyResult,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const Text(
                    'Basic keyword demo only. Not a medical diagnosis or guaranteed emergency detector.',
                    style: TextStyle(fontSize: 10),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          const Text(
            'Emergency Helplines',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),

          GridView.count(
            crossAxisCount: 3,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: [
              emergencyButton('112', 'Emergency', Icons.emergency),
              emergencyButton('100', 'Police', Icons.local_police),
              emergencyButton('101', 'Fire', Icons.fire_truck),
              emergencyButton('102', 'Ambulance', Icons.medical_services),
              emergencyButton('181', 'Women', Icons.support_agent),
              emergencyButton('1930', 'Cyber Fraud', Icons.security),
            ],
          ),

          const SizedBox(height: 12),

          const Text(
            'Safety Services',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),

          serviceTile(
            'Maps & Nearby',
            'Hospitals and police stations',
            Icons.map,
            () => showInfo(
              'Maps',
              'GPS and offline map integration is pending.',
            ),
          ),

          serviceTile(
            'Family Safety',
            'Trusted emergency contacts',
            Icons.family_restroom,
            showContacts,
          ),

          serviceTile(
            'Document Locker',
            'Secure phone-only document storage',
            Icons.lock,
            () => showInfo(
              'Document Locker',
              'Encrypted local document storage must be implemented before storing real documents.',
            ),
          ),

          serviceTile(
            'Cybercrime Help',
            'Official reporting portal',
            Icons.computer,
            () => launchUrl(
              Uri.parse('https://cybercrime.gov.in/'),
            ),
          ),

          serviceTile(
            'Earthquake & Disaster Safety',
            'Drop, cover, hold on & emergency kit checklist',
            Icons.crisis_alert,
            () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const EarthquakeScreen(),
              ),
            ),
          ),

          serviceTile(
            'First Aid',
            'Basic emergency information',
            Icons.medical_services_outlined,
            () => showInfo(
              'First Aid',
              'Call 112 in an emergency and follow professional instructions.',
            ),
          ),

          const SizedBox(height: 20),

          const Text(
            'Prototype starter. Verify emergency numbers and test all features before public release.',
            style: TextStyle(fontSize: 11, color: Colors.black54),
          ),
        ],
      ),
    );
  }
}

typedef _HomePageState = HomePageState;

class EarthquakeScreen extends StatelessWidget {
  const EarthquakeScreen({super.key});

  static const navy = Color(0xFF101B35);
  static const red = Color(0xFFE53935);

  Future<void> openLink(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> callEmergency() async {
    await openLink('tel:112');
  }

  Widget sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 19,
          fontWeight: FontWeight.bold,
          color: navy,
        ),
      ),
    );
  }

  Widget safetyCard(String title, String description, IconData icon) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: red, size: 30),
        title: Text(title,
            style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(description),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F6FA),
      appBar: AppBar(
        title: const Text('Earthquake Emergency'),
        backgroundColor: navy,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: navy,
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.crisis_alert, color: Colors.white, size: 42),
                SizedBox(height: 12),
                Text(
                  'EARTHQUAKE SAFETY SYSTEM',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 21,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Stay calm. Protect yourself. Follow official instructions.',
                  style: TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          ElevatedButton.icon(
            onPressed: callEmergency,
            icon: const Icon(Icons.call),
            label: const Text('CALL EMERGENCY 112'),
            style: ElevatedButton.styleFrom(
              backgroundColor: red,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 55),
            ),
          ),

          sectionTitle('During an Earthquake'),

          safetyCard(
            'DROP',
            'Get down on your hands and knees.',
            Icons.keyboard_double_arrow_down,
          ),

          safetyCard(
            'COVER',
            'Protect your head and neck under a sturdy table or desk. If unavailable, crouch near an interior wall.',
            Icons.shield,
          ),

          safetyCard(
            'HOLD ON',
            'Hold your shelter until the shaking stops.',
            Icons.pan_tool,
          ),

          sectionTitle('After an Earthquake'),

          safetyCard(
            'Avoid damaged buildings',
            'Stay away from damaged structures, walls and fallen electric wires.',
            Icons.warning,
          ),

          safetyCard(
            'Expect aftershocks',
            'If shaking starts again, Drop, Cover and Hold On.',
            Icons.vibration,
          ),

          safetyCard(
            'Check for injuries',
            'Give first aid if safe and contact emergency services.',
            Icons.medical_services,
          ),

          safetyCard(
            'Coastal safety',
            'If you are near the coast and experience strong or long shaking, move to higher ground immediately and follow tsunami warnings.',
            Icons.waves,
          ),

          sectionTitle('Emergency Kit Checklist'),

          const EmergencyChecklist(),

          sectionTitle('Official Earthquake Information'),

          ListTile(
            leading: const Icon(Icons.public, color: navy),
            title: const Text('National Center for Seismology'),
            subtitle: const Text('Official earthquake information'),
            trailing: const Icon(Icons.open_in_new),
            onTap: () => openLink('https://seismo.gov.in/'),
          ),

          ListTile(
            leading: const Icon(Icons.public, color: navy),
            title: const Text('NDMA India'),
            subtitle: const Text('Disaster preparedness and safety'),
            trailing: const Icon(Icons.open_in_new),
            onTap: () => openLink('https://ndma.gov.in/'),
          ),

          const SizedBox(height: 20),
          const Text(
            'Important: This screen is a safety guide. It does not detect earthquakes or generate verified live alerts.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.black54),
          ),
        ],
      ),
    );
  }
}

class EmergencyChecklist extends StatefulWidget {
  const EmergencyChecklist({super.key});

  @override
  State<EmergencyChecklist> createState() => _EmergencyChecklistState();
}

class _EmergencyChecklistState extends State<EmergencyChecklist> {
  final items = [
    'Drinking water',
    'First aid kit',
    'Flashlight and batteries',
    'Power bank',
    'Essential medicines',
    'Dry food',
    'Whistle',
    'Copies of important documents',
    'Emergency contact numbers',
  ];

  final Set<int> checked = {};

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: List.generate(items.length, (index) {
          return CheckboxListTile(
            value: checked.contains(index),
            title: Text(items[index]),
            activeColor: const Color(0xFFE53935),
            onChanged: (value) {
              setState(() {
                if (value == true) {
                  checked.add(index);
                } else {
                  checked.remove(index);
                }
              });
            },
          );
        }),
      ),
    );
  }
}
