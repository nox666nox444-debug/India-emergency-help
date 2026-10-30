export interface FirstAidTopic {
  id: string;
  title: string;
  category: 'critical' | 'trauma' | 'environmental' | 'medical';
  subtitle: string;
  summary: string;
  image?: string;
  recommendedHelpline: string;
  steps: {
    order: number;
    title: string;
    description: string;
    crucialNote?: string;
  }[];
  doList: string[];
  dontList: string[];
  goodSamaritanTip?: string;
}

export const FIRST_AID_TOPICS: FirstAidTopic[] = [
  {
    id: 'cpr',
    title: 'Adult CPR (Cardiopulmonary Resuscitation)',
    category: 'critical',
    subtitle: 'Hands-Only CPR for sudden collapse or non-breathing person',
    summary: 'Immediate chest compressions double or triple a cardiac arrest victim’s survival chance before ambulance arrives.',
    image: '/src/assets/images/cpr_first_aid_guide_1793317695637.jpg',
    recommendedHelpline: '108 / 112',
    steps: [
      {
        order: 1,
        title: 'Check Safety & Responsiveness',
        description: 'Shake shoulders firmly and shout: "Are you okay?". Look at the chest for 5-10 seconds to see if they are breathing normally.',
        crucialNote: 'Agonal gasps are NOT normal breathing—start CPR immediately.',
      },
      {
        order: 2,
        title: 'Call 112 / 108 Immediately',
        description: 'Put your phone on speakerphone and tell dispatch: "Adult collapsed, unconscious, not breathing". Request an AED if available.',
      },
      {
        order: 3,
        title: 'Position Hands on Center of Chest',
        description: 'Place the heel of one hand in the center of the chest (lower half of sternum). Interlock your other hand on top. Keep elbows straight.',
      },
      {
        order: 4,
        title: 'Push Hard & Fast (100–120 BPM)',
        description: 'Compress chest at least 5 cm (2 inches) deep at 100 to 120 compressions per minute. Allow complete chest recoil between pushes.',
        crucialNote: 'Rhythm matching the Hindi song "Chaiyya Chaiyya" or "Stayin Alive" (100–120 BPM).',
      },
      {
        order: 5,
        title: 'Do Not Stop Until Help Takes Over',
        description: 'Rotate with another bystander every 2 minutes without pausing compressions for more than 5 seconds.',
      },
    ],
    doList: [
      'Push hard in the center of the chest (lower half of breastbone)',
      'Push to a rate of 100–120 compressions/minute',
      'Allow the chest to fully spring back up after each compression',
      'Use the metronome tool below to keep the exact cadence',
    ],
    dontList: [
      'Do NOT delay compressions to check for faint pulse if inexperienced',
      'Do NOT give mouth-to-mouth if not trained; Hands-Only CPR is just as effective',
      'Do NOT lean on chest during the upward recoil phase',
      'Do NOT give water, food, or medicines to an unresponsive person',
    ],
    goodSamaritanTip: 'Under the Indian Good Samaritan Protection Law, bystanders assisting cardiac arrest victims in good faith are legally immune from civil and criminal liability.',
  },
  {
    id: 'snakebite',
    title: 'Snakebite Emergency (Indian Big Four Protocol)',
    category: 'environmental',
    subtitle: 'Protocol for Russell’s Viper, Cobra, Krait & Saw-scaled Viper bites',
    summary: 'India reports over 50,000 snakebite fatalities annually. Prompt immobilization and reaching a hospital with Anti-Snake Venom (ASV) is life-saving.',
    image: '/src/assets/images/snakebite_first_aid_1793317698965.jpg',
    recommendedHelpline: '108 / 112',
    steps: [
      {
        order: 1,
        title: 'Keep Victim Absolutely Calm & Still',
        description: 'Lay the patient down. Any panic, walking, or physical exertion accelerates venom absorption into the bloodstream.',
        crucialNote: 'Reassure victim that over 70% of snakes are non-venomous or deliver dry bites.',
      },
      {
        order: 2,
        title: 'Immobilize the Bitten Limb',
        description: 'Apply a broad crepe or cloth bandage firmly from fingers/toes upwards. Use a splint (stick/rolled newspaper) to prevent joint bending.',
      },
      {
        order: 3,
        title: 'Remove Tight Rings, Bangles & Anklets',
        description: 'Severe swelling will occur rapidly. Remove jewelry and tight clothing before swelling causes tourniquet necrosis.',
      },
      {
        order: 4,
        title: 'Rush Immediately to Nearest Hospital with ASV',
        description: 'Transport by vehicle or ambulance immediately. Polyvalent Anti-Snake Venom (ASV) is the only proven antidote in India.',
      },
    ],
    doList: [
      'Keep the bitten limb below heart level',
      'Immobilize the limb like a fractured bone with a splint',
      'Mark the swelling boundary with a pen every 15 minutes to track progression',
      'Note snake appearance if safely seen (do not try to catch or kill it)',
    ],
    dontList: [
      'NEVER cut the bite wound with blades or knives',
      'NEVER try to suck venom with mouth or suction pumps',
      'NEVER apply tight arterial rubber tourniquets (causes limb amputation)',
      'NEVER apply ice, herbal pastes, battery acid, or potassium permanganate',
      'NEVER visit faith healers or quacks; rush straight to a PHC/Hospital',
    ],
    goodSamaritanTip: 'Government Primary Health Centres (PHCs) and district hospitals in India stock free Polyvalent Anti-Snake Venom (ASV).',
  },
  {
    id: 'road-accident',
    title: 'Road Accident & Trauma Rescue (Golden Hour)',
    category: 'trauma',
    subtitle: 'Supreme Court Good Samaritan Guidelines & Golden Hour response',
    summary: 'The first 60 minutes after a road collision in India determines survival. You can save lives without fear of police harassment.',
    recommendedHelpline: '112 / 108 / 1033',
    steps: [
      {
        order: 1,
        title: 'Ensure Scene Safety',
        description: 'Turn on hazard lights of vehicles, put warning triangles/stones 50 meters back to stop oncoming highway traffic from plowing into the site.',
      },
      {
        order: 2,
        title: 'Dial 112 or 108 (Highway 1033)',
        description: 'State exact highway milestone, landmark, or share GPS coordinates from this app.',
      },
      {
        order: 3,
        title: 'Stabilize Head & Neck (Cervical Spine)',
        description: 'Do not twist or bend the victim’s neck. If victim is wearing a motorcycle helmet, do NOT yank it off unless breathing is completely blocked.',
      },
      {
        order: 4,
        title: 'Stop Life-Threatening Bleeding',
        description: 'Press clean folded cloth directly on spurting or heavy wounds with continuous, firm two-handed pressure.',
      },
    ],
    doList: [
      'Call emergency 112 immediately and state exact location',
      'Protect the neck and spine from moving or jolting',
      'Check if airway is clear of vomit, blood, or dentures',
      'Keep victim warm with a blanket or jacket to prevent trauma shock',
    ],
    dontList: [
      'Do NOT pull victims out through broken car windows unless vehicle is on fire',
      'Do NOT force helmet off violently (risk of spinal cord severance)',
      'Do NOT pour water down the mouth of an unconscious or dazed victim',
      'Do NOT allow crowd to surround and choke fresh air',
    ],
    goodSamaritanTip: 'The Supreme Court of India mandates: Good Samaritans who help accident victims cannot be forced to disclose identity, pay hospital admission deposits, or attend court trials.',
  },
  {
    id: 'severe-bleeding',
    title: 'Severe Arterial & Venous Bleeding',
    category: 'trauma',
    subtitle: 'Direct pressure, wound packing, and hemorrhage control',
    summary: 'Severe blood loss can cause irreversible shock within 3 to 5 minutes. Direct pressure stops 95% of bleedings.',
    recommendedHelpline: '108 / 112',
    steps: [
      {
        order: 1,
        title: 'Apply Direct Two-Handed Pressure',
        description: 'Take a sterile pad or cleanest available cloth (t-shirt, dupatta, towel) and press directly over the bleed with full body weight.',
      },
      {
        order: 2,
        title: 'Maintain Unbroken Pressure for 10 Minutes',
        description: 'Do not lift the cloth to "check" if it stopped—this breaks nascent clots. If blood soaks through, add another layer on top.',
      },
      {
        order: 3,
        title: 'Elevate Limb If Not Fractured',
        description: 'Raise the bleeding arm or leg above the level of the heart to slow down hydrostatic pressure.',
      },
      {
        order: 4,
        title: 'Bandage Securely',
        description: 'Wrap a roller bandage firmly around the dressing. Ensure fingers/toes remain warm with normal pulse.',
      },
    ],
    doList: [
      'Use continuous firm direct pressure with palms or thumbs',
      'Pack deep wounds in groin or armpit with clean cloth and press hard',
      'Keep patient lying down flat with legs slightly elevated to prevent shock',
    ],
    dontList: [
      'Do NOT remove the first dressing if soaked; keep adding layers',
      'Do NOT use thin wire or shoe lace as a makeshift tourniquet (tissue damage)',
      'Do NOT remove deeply embedded objects (glass, knife); pad around them',
    ],
  },
  {
    id: 'choking',
    title: 'Choking (Heimlich Maneuver)',
    category: 'critical',
    subtitle: 'Clear blocked airway for conscious adult, child, and infant',
    summary: 'When a person cannot speak, cough, or breathe and clutches their throat, immediate abdominal thrusts are required.',
    recommendedHelpline: '108 / 112',
    steps: [
      {
        order: 1,
        title: 'Identify Complete Airway Obstruction',
        description: 'Ask: "Are you choking?". If they can only nod, cannot cough forcefully or speak, act immediately.',
      },
      {
        order: 2,
        title: 'Deliver 5 Firm Back Blows',
        description: 'Stand behind the person, lean them forward, and hit hard between the shoulder blades with the heel of your hand.',
      },
      {
        order: 3,
        title: 'Perform 5 Abdominal Thrusts (Heimlich)',
        description: 'Make a fist with one hand, place thumb-side just above the navel. Grasp fist with your other hand and pull inward and upward sharply.',
      },
      {
        order: 4,
        title: 'Repeat 5 Blows & 5 Thrusts',
        description: 'Continue cycle until foreign object dislodges or person becomes unconscious. If unconscious, lower to floor and start CPR compressions.',
      },
    ],
    doList: [
      'Encourage coughing if they can still make sounds or cough',
      'Use inward and upward J-hook motion during thrusts',
      'For pregnant or obese victims, perform chest thrusts at middle of breastbone',
    ],
    dontList: [
      'Do NOT do blind finger sweeps inside mouth (pushes object deeper)',
      'Do NOT give water to drink while someone is actively choking',
      'Do NOT perform abdominal thrusts on infants under 1 year (use 5 back slaps & 5 chest thrusts)',
    ],
  },
  {
    id: 'heatstroke',
    title: 'Severe Heatstroke & Hyperthermia',
    category: 'environmental',
    subtitle: 'Emergency cooling for Indian heatwave (Loo) conditions',
    summary: 'Core body temperature exceeding 40°C (104°F) with hot, dry skin or confusion is a medical emergency requiring rapid active cooling.',
    recommendedHelpline: '108 / 112',
    steps: [
      {
        order: 1,
        title: 'Move Out of Heat Immediately',
        description: 'Bring victim into deep shade, air conditioning, or an airy room. Lay them flat and elevate feet slightly.',
      },
      {
        order: 2,
        title: 'Strip Heavy Clothing',
        description: 'Remove tight outer clothes, socks, and heavy fabrics to expose skin to air circulation.',
      },
      {
        order: 3,
        title: 'Cool Aggressively with Water & Fan',
        description: 'Spray or sponge cool water all over the body while fanning vigorously. Place ice packs or wet cold towels in armpits, neck, and groin.',
      },
      {
        order: 4,
        title: 'Oral Rehydration Salts (ORS) If Alert',
        description: 'If fully conscious and able to swallow, give small sips of cool ORS solution or salted lemon water (nimbu pani).',
      },
    ],
    doList: [
      'Cool down the victim as fast as possible',
      'Apply ice packs to high-blood flow areas: neck, armpits, and groin',
      'Fan continuously while spraying cool water to maximize evaporative cooling',
    ],
    dontList: [
      'Do NOT give paracetamol or aspirin (ineffective for heatstroke, strains liver)',
      'Do NOT give chilled liquids or alcohol to someone who is delirious or vomiting',
      'Do NOT leave a heatstroke patient unattended',
    ],
  },
  {
    id: 'burns',
    title: 'Burns & Scalds Emergency Protocol',
    category: 'trauma',
    subtitle: 'Thermal, boiling liquid, steam, and festive firecracker burns',
    summary: 'Early thermal management prevents deep tissue scarring and shock. Cool running water is the only proven initial treatment.',
    recommendedHelpline: '108 / 112',
    steps: [
      {
        order: 1,
        title: 'Cool with Running Tap Water for 20 Minutes',
        description: 'Immediately pour gentle, cool running tap water over the burn for at least 20 continuous minutes. This stops heat from cooking deeper tissue.',
      },
      {
        order: 2,
        title: 'Remove Jewelry & Constrictive Items',
        description: 'Gently remove rings, watches, bracelets, and belts before swelling begins. Do NOT tear away clothes stuck firmly to burned skin.',
      },
      {
        order: 3,
        title: 'Cover with Clean Plastic Cling Film or Sterile Cloth',
        description: 'Lay clean kitchen cling film loosely over the burn (prevents infection and reduces air pain). Do not wrap tight.',
      },
      {
        order: 4,
        title: 'Seek Medical Care for Major Burns',
        description: 'Any burn larger than victim’s palm, or on face, hands, joints, or genitals, requires hospital evaluation.',
      },
    ],
    doList: [
      'Use clean cool tap water (15°C to 25°C) for full 20 minutes',
      'Keep patient warm with blankets over unburned areas (prevent hypothermia)',
      'Seek immediate hospital attention for chemical or electrical burns',
    ],
    dontList: [
      'NEVER apply ice or ice water (freezes damaged cells and causes necrosis)',
      'NEVER apply toothpaste, butter, raw egg, turmeric, or ink (causes severe infection)',
      'NEVER pop or puncture burn blisters',
      'NEVER apply cotton wool directly onto raw burned skin',
    ],
  },
  {
    id: 'heart-attack',
    title: 'Suspected Heart Attack (Myocardial Infarction)',
    category: 'medical',
    subtitle: 'Crushing chest pressure, left arm pain, cold sweats',
    summary: 'Every minute matters. Call 108/112 immediately and administer chewable Disprin/Aspirin 300mg if not allergic.',
    recommendedHelpline: '108 / 112',
    steps: [
      {
        order: 1,
        title: 'Call Ambulance (108 / 112) Right Away',
        description: 'Never drive yourself to the hospital if experiencing chest pain. Ambulance crews have ECG and oxygen equipment.',
      },
      {
        order: 2,
        title: 'Rest in a W-Sitting Position',
        description: 'Sit on the floor with back supported and knees bent. This reduces cardiac workload and prevents injury if victim faints.',
      },
      {
        order: 3,
        title: 'Chew One Aspirin (Disprin 300mg)',
        description: 'If the patient is not allergic to aspirin, has no bleeding ulcer, and doctor hasn’t advised against it, have them chew and swallow 300mg soluble aspirin.',
      },
      {
        order: 4,
        title: 'Monitor Breathing & Be Ready for CPR',
        description: 'Loosen collar, tie, and belt. If patient stops responding or breathing, immediately start Hands-Only chest compressions.',
      },
    ],
    doList: [
      'Keep the patient sitting and calm',
      'Loosen tight neckwear and open windows for ventilation',
      'Have someone prepare medical prescriptions and insurance cards for hospital',
    ],
    dontList: [
      'Do NOT dismiss chest heaviness as simple "acidity" or "gas"',
      'Do NOT allow the patient to walk or exert themselves',
      'Do NOT give food, heavy drinks, or stimulants',
    ],
  },
  {
    id: 'cyber-fraud',
    title: 'Financial Cyber Fraud Golden Hour (Call 1930)',
    category: 'critical',
    subtitle: 'UPI, OTP, ATM phishing & unauthorized bank withdrawal freeze',
    summary: 'Reporting unauthorized financial debit to 1930 within 2 hours enables nodal banking officers to freeze funds before mule accounts cash out.',
    recommendedHelpline: '1930 (National Cyber Crime)',
    steps: [
      {
        order: 1,
        title: 'Call 1930 Immediately',
        description: 'Dial 1930 from anywhere in India. Keep your bank account number, transaction UTR/reference number, and debit timestamp ready.',
      },
      {
        order: 2,
        title: 'Block Debit Cards & Net Banking via SMS / App',
        description: 'Use your bank’s official emergency lock feature (e.g., SMS "BLOCK <card_last_4>" or mobile banking toggle) to prevent further debits.',
      },
      {
        order: 3,
        title: 'Register Complaint on cybercrime.gov.in',
        description: 'Submit an online complaint on the Ministry of Home Affairs National Cyber Crime Reporting Portal within 24 hours to obtain an official acknowledgment number.',
      },
    ],
    doList: [
      'Dial 1930 within the first 1-2 hours of the fraudulent debit',
      'Preserve SMS alerts, transaction IDs, WhatsApp chat screenshots, and scammer phone numbers',
      'Inform your home bank branch manager in writing with the 1930 acknowledgment slip',
    ],
    dontList: [
      'Do NOT delete SMS messages or WhatsApp chat logs with the fraudster',
      'Do NOT click on any link sent by scammers claiming to "refund" your money',
      'Do NOT install screen-sharing apps like AnyDesk, TeamViewer, or RustDesk on stranger requests',
    ],
  },
];
