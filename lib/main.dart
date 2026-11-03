import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:sensors_plus/sensors_plus.dart';
import 'package:geolocator/geolocator.dart';

class EmergencyContactItem {
  final String id;
  String name;
  String phone;
  String countryCode;
  String relation;
  int priority;
  bool enabled;

  EmergencyContactItem({
    required this.id,
    required this.name,
    required this.phone,
    this.countryCode = '+91',
    this.relation = 'Family',
    this.priority = 1,
    this.enabled = true,
  });

  String get fullPhoneNumber {
    final clean = phone.trim();
    if (clean.startsWith('+')) return clean;
    final cc = countryCode.trim().isNotEmpty ? countryCode.trim() : '+91';
    return '$cc${clean.replaceAll(RegExp(r'^0+'), '')}';
  }
}

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

  // Shake SOS State
  StreamSubscription<AccelerometerEvent>? _sensorSub;
  bool shakeSosEnabled = true;
  String shakeSensitivity = 'medium'; // 'low', 'medium', 'high'
  double _lastX = 0, _lastY = 0, _lastZ = 0;
  DateTime? _lastSampleTime;
  int _shakePeaks = 0;
  DateTime? _lastPeakTime;
  DateTime? _lastTriggerTime;
  bool _isCountdownActive = false;

  final List<EmergencyContactItem> trustedContacts = [
    EmergencyContactItem(
      id: '1',
      name: 'Primary Family Contact',
      phone: '',
      countryCode: '+91',
      relation: 'Family',
      priority: 1,
    ),
  ];

  @override
  void initState() {
    super.initState();
    initShakeSensor();
  }

  @override
  void dispose() {
    _sensorSub?.cancel();
    super.dispose();
  }

  void initShakeSensor() {
    _sensorSub?.cancel();
    if (!shakeSosEnabled) return;

    _sensorSub = accelerometerEventStream().listen((event) {
      if (!shakeSosEnabled || _isCountdownActive) return;

      final now = DateTime.now();
      if (_lastSampleTime != null &&
          now.difference(_lastSampleTime!).inMilliseconds < 50) {
        return;
      }

      final timeDiff = _lastSampleTime == null
          ? 100
          : now.difference(_lastSampleTime!).inMilliseconds;
      final dx = (event.x - _lastX).abs();
      final dy = (event.y - _lastY).abs();
      final dz = (event.z - _lastZ).abs();
      final magnitude = (dx + dy + dz) / (timeDiff / 100.0);

      _lastX = event.x;
      _lastY = event.y;
      _lastZ = event.z;
      _lastSampleTime = now;

      // 10-second debounce cooldown
      if (_lastTriggerTime != null &&
          now.difference(_lastTriggerTime!).inMilliseconds < 10000) {
        return;
      }

      double threshold = 18.0;
      if (shakeSensitivity == 'low') threshold = 26.0;
      if (shakeSensitivity == 'high') threshold = 12.0;

      if (magnitude > threshold) {
        if (_lastPeakTime != null &&
            now.difference(_lastPeakTime!).inMilliseconds < 800) {
          _shakePeaks++;
        } else {
          _shakePeaks = 1;
        }
        _lastPeakTime = now;

        if (_shakePeaks >= 2) {
          _shakePeaks = 0;
          _lastTriggerTime = now;
          triggerShakeSosCountdown();
        }
      } else if (_lastPeakTime != null &&
          now.difference(_lastPeakTime!).inMilliseconds > 900) {
        _shakePeaks = 0;
      }
    });
  }

  void triggerShakeSosCountdown() {
    if (_isCountdownActive) return;
    setState(() {
      _isCountdownActive = true;
    });

    int secondsRemaining = 5;
    Timer? timer;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            timer ??= Timer.periodic(const Duration(seconds: 1), (t) {
              if (secondsRemaining > 1) {
                setDialogState(() {
                  secondsRemaining--;
                });
              } else {
                t.cancel();
                timer = null;
                Navigator.of(dialogCtx, rootNavigator: true).pop();
                _isCountdownActive = false;
                dispatchShakeEmergency();
              }
            });

            return AlertDialog(
              backgroundColor: const Color(0xFFC62838),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              title: const Row(
                children: [
                  Icon(Icons.vibration, color: Colors.white),
                  SizedBox(width: 8),
                  Text(
                    'SHAKE SOS DETECTED',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Emergency shake recognized. Activating in:',
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: 84,
                    height: 84,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.black26,
                      border: Border.all(color: Colors.white, width: 3),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      '$secondsRemaining',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 40,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Press CANCEL below if this was an accidental trigger.',
                    style: TextStyle(color: Colors.white70, fontSize: 11),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
              actions: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFFC62838),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () {
                      timer?.cancel();
                      timer = null;
                      Navigator.of(dialogCtx, rootNavigator: true).pop();
                      setState(() {
                        _isCountdownActive = false;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'SOS Cancelled. No emergency calls or alerts placed.',
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.cancel, color: Color(0xFFC62838)),
                    label: const Text(
                      'CANCEL SOS (FALSE ALARM)',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ],
            );
          },
        );
      },
    ).then((_) {
      timer?.cancel();
      _isCountdownActive = false;
    });
  }

  Future<void> dispatchShakeEmergency() async {
    Position? position;
    String locationNotice = 'Retrieving GPS...';

    try {
      final perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }
      position = await Geolocator.getCurrentPosition(
        timeLimit: const Duration(seconds: 6),
      );
    } catch (_) {
      locationNotice =
          'Location unavailable. Emergency calling options remain active.';
    }

    if (!mounted) return;

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.shield_alert, color: Color(0xFFC62838)),
              SizedBox(width: 8),
              Text('Emergency Dispatch'),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Police 112 with Confirmation
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFEBEE),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFFFCDD2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'POLICE EMERGENCY 112',
                        style: TextStyle(
                          color: Color(0xFFC62838),
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Opens the official emergency dialer for user confirmation.',
                        style: TextStyle(fontSize: 11, color: Colors.black87),
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          style: FilledButton.styleFrom(
                            backgroundColor: const Color(0xFFC62838),
                          ),
                          onPressed: () {
                            Navigator.pop(ctx);
                            callNumber('112');
                          },
                          icon: const Icon(Icons.phone),
                          label: const Text('Call 112 Now'),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // Location Status
                Text(
                  position != null
                      ? 'GPS: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)} (±${position.accuracy.round()}m)'
                      : locationNotice,
                  style: const TextStyle(fontSize: 11, color: Colors.black54),
                ),

                const SizedBox(height: 14),
                const Text(
                  'Family Emergency Contacts:',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const SizedBox(height: 6),

                if (trustedContacts.isEmpty ||
                    trustedContacts.every((c) => c.phone.trim().isEmpty))
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: Text(
                      'No family phone numbers configured yet. Add them in Shake SOS settings.',
                      style: TextStyle(fontSize: 11, color: Colors.black54),
                    ),
                  )
                else
                  ...trustedContacts
                      .where((c) => c.phone.trim().isNotEmpty)
                      .map((contact) {
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        dense: true,
                        title: Text('${contact.name} (${contact.relation})'),
                        subtitle: Text(contact.fullPhoneNumber),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.phone, color: Colors.green),
                              onPressed: () {
                                callNumber(contact.fullPhoneNumber);
                              },
                              tooltip: 'Call',
                            ),
                            IconButton(
                              icon: const Icon(Icons.sms, color: Colors.blue),
                              onPressed: () async {
                                String msg =
                                    '🚨 EMERGENCY SOS! I need immediate help in India.\n';
                                if (position != null) {
                                  msg +=
                                      '📍 Live Location: https://www.google.com/maps?q=${position.latitude},${position.longitude}\n';
                                }
                                msg += 'Helpline: 112';

                                final uri = Uri(
                                  scheme: 'sms',
                                  path: contact.fullPhoneNumber,
                                  queryParameters: {'body': msg},
                                );
                                try {
                                  await launchUrl(uri);
                                } catch (_) {}
                              },
                              tooltip: 'Send SMS SOS',
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  void showShakeSettingsDialog() {
    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dialogCtx, setModalState) {
            return AlertDialog(
              title: const Text('Shake-to-Emergency SOS'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Enable Shake SOS'),
                      subtitle: const Text('Detect deliberate phone shakes'),
                      value: shakeSosEnabled,
                      onChanged: (val) {
                        setState(() {
                          shakeSosEnabled = val;
                          initShakeSensor();
                        });
                        setModalState(() {});
                      },
                    ),
                    const Divider(),
                    const Text(
                      'Sensitivity:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    RadioListTile<String>(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Low (Firm, deliberate shake)'),
                      value: 'low',
                      groupValue: shakeSensitivity,
                      onChanged: (val) {
                        setState(() {
                          shakeSensitivity = val!;
                        });
                        setModalState(() {});
                      },
                    ),
                    RadioListTile<String>(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Medium (Standard deliberate)'),
                      value: 'medium',
                      groupValue: shakeSensitivity,
                      onChanged: (val) {
                        setState(() {
                          shakeSensitivity = val!;
                        });
                        setModalState(() {});
                      },
                    ),
                    RadioListTile<String>(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: const Text('High (Light deliberate)'),
                      value: 'high',
                      groupValue: shakeSensitivity,
                      onChanged: (val) {
                        setState(() {
                          shakeSensitivity = val!;
                        });
                        setModalState(() {});
                      },
                    ),
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Family Contacts:',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        TextButton.icon(
                          onPressed: () {
                            _showAddContactDialog(dialogCtx, setModalState);
                          },
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('Add'),
                        ),
                      ],
                    ),
                    ...trustedContacts.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final contact = entry.value;
                      return ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          radius: 12,
                          child: Text('${idx + 1}', style: const TextStyle(fontSize: 10)),
                        ),
                        title: Text('${contact.name} (${contact.relation})'),
                        subtitle: Text(contact.fullPhoneNumber),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, size: 18, color: Colors.red),
                          onPressed: () {
                            setState(() {
                              trustedContacts.removeAt(idx);
                            });
                            setModalState(() {});
                          },
                        ),
                      );
                    }),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          triggerShakeSosCountdown();
                        },
                        icon: const Icon(Icons.play_arrow),
                        label: const Text('Test 5-Second SOS Countdown'),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                FilledButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Done'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showAddContactDialog(BuildContext parentCtx, StateSetter parentSetState) {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    String relation = 'Family';
    String cc = '+91';

    showDialog(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Add Family Contact'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(labelText: 'Name (e.g. Mother)'),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                SizedBox(
                  width: 80,
                  child: DropdownButtonFormField<String>(
                    value: cc,
                    items: const [
                      DropdownMenuItem(value: '+91', child: Text('+91')),
                      DropdownMenuItem(value: '+1', child: Text('+1')),
                      DropdownMenuItem(value: '+44', child: Text('+44')),
                    ],
                    onChanged: (v) => cc = v ?? '+91',
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: phoneCtrl,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(labelText: 'Phone number'),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(c), child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              if (nameCtrl.text.trim().isNotEmpty &&
                  phoneCtrl.text.trim().isNotEmpty) {
                setState(() {
                  trustedContacts.add(
                    EmergencyContactItem(
                      id: DateTime.now().millisecondsSinceEpoch.toString(),
                      name: nameCtrl.text.trim(),
                      phone: phoneCtrl.text.trim(),
                      countryCode: cc,
                      relation: relation,
                      priority: trustedContacts.length + 1,
                    ),
                  );
                });
                parentSetState(() {});
                Navigator.pop(c);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

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

    if (RegExp(
      r'earthquake|tremor|shaking|bhukamp|bhookamp|भूकंप|ਭੂਚਾਲ',
    ).hasMatch(value)) {
      return 'Possible earthquake emergency. Drop, Cover and Hold On. Call 112.';
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
        actions: [
          IconButton(
            icon: const Icon(Icons.vibration),
            tooltip: 'Shake SOS Settings',
            onPressed: showShakeSettingsDialog,
          ),
        ],
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

          Card(
            color: const Color(0xffFFF3F4),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xffFFCDD2)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.screen_rotation, color: Color(0xffC62838)),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'Shake-to-Emergency SOS',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: Color(0xffC62838),
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: shakeSosEnabled ? Colors.green.shade100 : Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          shakeSosEnabled ? 'ACTIVE' : 'OFF',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: shakeSosEnabled ? Colors.green.shade800 : Colors.grey.shade700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Shake phone firmly to trigger 112 emergency dialer and family GPS SMS alerts. Sensitivity: ${shakeSensitivity.toUpperCase()}.',
                    style: const TextStyle(fontSize: 12, color: Colors.black87),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: triggerShakeSosCountdown,
                          icon: const Icon(Icons.play_arrow, size: 16),
                          label: const Text('Test 5s SOS', style: TextStyle(fontSize: 12)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: FilledButton.icon(
                          style: FilledButton.styleFrom(
                            backgroundColor: const Color(0xff102B4D),
                          ),
                          onPressed: showShakeSettingsDialog,
                          icon: const Icon(Icons.tune, size: 16),
                          label: const Text('Configure', style: TextStyle(fontSize: 12)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
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
