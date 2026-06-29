'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Options = {
  onFinalTranscript: (text: string) => void;
};

export type VoiceDictation = {
  isSupported: boolean | null;
  isListening: boolean;
  isSpeaking: boolean;
  interimTranscript: string;
  toggleListening: () => void;
  stopListening: () => void;
};

export function useVoiceDictation({ onFinalTranscript }: Options): VoiceDictation {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const onFinalRef = useRef(onFinalTranscript);

  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const supported = 'SpeechRecognition' in w || 'webkitSpeechRecognition' in w;
    setIsSupported(supported);
    if (!supported) return;

    const SpeechRecognitionClass = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const trimmed = result[0].transcript.trim();
          if (trimmed) onFinalRef.current(trimmed);
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onspeechstart = () => setIsSpeaking(true);

    recognition.onspeechend = () => {
      setIsSpeaking(false);
      setInterimTranscript('');
    };

    // Restart on silence — the user controls when they are done, not the browser
    recognition.onend = () => {
      if (isListeningRef.current) {
        try { recognition.start(); } catch { /* already starting */ }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isListeningRef.current = false;
      recognition.abort();
    };
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    setInterimTranscript('');
    recognitionRef.current?.stop();
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      isListeningRef.current = true;
      setIsListening(true);
      try { recognitionRef.current?.start(); } catch { /* already running */ }
    }
  }, [stopListening]);

  return { isSupported, isListening, isSpeaking, interimTranscript, toggleListening, stopListening };
}
