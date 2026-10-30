import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  AlertTriangle,
  Phone,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { SupportedLang } from '../data/translations';

interface VoiceEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLang;
  onTriggerSos: () => void;
  onOpenAiWithQuery: (query: string) => void;
}

export const VoiceEmergencyModal: React.FC<VoiceEmergencyModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onTriggerSos,
  onOpenAiWithQuery,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [detectedTrigger, setDetectedTrigger] = useState<string | null>(null);
  const [recommendedNumber, setRecommendedNumber] = useState<string>('112');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setDetectedTrigger(null);
      return;
    }

    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Speech Recognition is not supported by your browser. You can still use the direct emergency call buttons.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }

        setTranscript(currentText);
        analyzeKeywords(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(
            'Microphone permission was denied. Please allow microphone access to use hands-free emergency voice detection.'
          );
        }
      };

      recognition.onend = () => {
        // Auto-restart if modal is still open
        if (isOpen && isListening) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e: any) {
      setErrorMessage('Could not start speech recognition.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const analyzeKeywords = (text: string) => {
    const value = text.toLowerCase();

    // Accident & Trauma (English, Hindi, Punjabi)
    if (/accident|injury|bleeding|hurt|चोट|दुर्घटना|ਜ਼ਖ਼ਮੀ/.test(value)) {
      setDetectedTrigger('Possible Accident Detected (दुर्घटना)');
      setRecommendedNumber('112');
    }
    // Breathing, Cardiac & Medical (English, Hindi, Punjabi)
    else if (/breathing|chest pain|heart|ambulance|doctor|सांस|सीने में दर्द|ਸਾਹ/.test(value)) {
      setDetectedTrigger('Medical Emergency Detected (चिकित्सा आपातकाल)');
      setRecommendedNumber('108');
    }
    // Safety Threat & Attack (English, Hindi, Punjabi)
    else if (/attack|follow|threat|police|stalking|thief|chor|हमला|पीछा|ਪਿੱਛਾ|गुंडा/.test(value)) {
      setDetectedTrigger('Safety Threat Detected (सुरक्षा खतरा)');
      setRecommendedNumber('100');
    }
    // Fire & Smoke (English, Hindi, Punjabi)
    else if (/fire|smoke|cylinder|blast|आग|धुआं|ਅੱਗ/.test(value)) {
      setDetectedTrigger('Fire Emergency Detected (अग्नि आपातकाल)');
      setRecommendedNumber('101');
    }
    // Snakebite
    else if (/snake|snakebite|saanp|सांप/.test(value)) {
      setDetectedTrigger('Snakebite Emergency Detected (सर्पदंश)');
      setRecommendedNumber('108');
    }
    // Cyber Financial Fraud
    else if (/cyber|otp|fraud|scam|bank loot|धोखाधड़ी/.test(value)) {
      setDetectedTrigger('Cyber Financial Fraud (साइबर धोखाधड़ी)');
      setRecommendedNumber('1930');
    }
    // Women Safety
    else if (/women|mahila|महिला|eve teasing|harassment/.test(value)) {
      setDetectedTrigger('Women Safety Alert (महिला सुरक्षा)');
      setRecommendedNumber('1091');
    }
    // General Distress
    else if (/bachao|help|madad|बचाओ|मदद|save me/.test(value)) {
      setDetectedTrigger('Emergency Distress SOS (बचाओ / Help)');
      setRecommendedNumber('112');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-600 text-white">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Voice Emergency SOS Trigger
            </h2>
          </div>
          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-red-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Listening Visualizer */}
          <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="relative inline-block mb-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-600 text-white shadow-xl shadow-red-600/40 animate-pulse scale-105'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {isListening ? (
                  <Mic className="w-10 h-10" />
                ) : (
                  <MicOff className="w-10 h-10" />
                )}
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isListening ? 'Listening for Emergency Distress Words...' : 'Microphone Inactive'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Say aloud: <span className="font-semibold text-red-600">"Help"</span>,{' '}
              <span className="font-semibold text-red-600">"Bachao"</span>,{' '}
              <span className="font-semibold text-red-600">"Ambulance"</span>,{' '}
              <span className="font-semibold text-red-600">"Police"</span>, or describe your injury.
            </p>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Detected Speech
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Detected Trigger Action Card */}
          {detectedTrigger && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{detectedTrigger}</span>
                </div>
                <span className="text-xs font-mono font-bold text-red-600">
                  Recommended: {recommendedNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${recommendedNumber}`}
                  className="flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md min-h-[44px]"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>Call {recommendedNumber} Now</span>
                </a>
                <button
                  onClick={() => {
                    stopListening();
                    onClose();
                    onTriggerSos();
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl min-h-[44px]"
                >
                  <Send className="w-4 h-4 text-red-500" />
                  <span>Dispatch GPS SOS</span>
                </button>
              </div>

              <button
                onClick={() => {
                  stopListening();
                  onClose();
                  onOpenAiWithQuery(transcript);
                }}
                className="w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Get Step-by-Step AI First-Aid Advice for this</span>
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
              {errorMessage}
            </div>
          )}

          {/* Toggle Listening Button */}
          <div className="flex gap-2">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                isListening
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-md'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Pause Voice Listening</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Resume Voice Listening</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Hands-free voice distress processing</span>
          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
