'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useVoiceDictation } from '@/lib/hooks/useVoiceDictation';
import ImageSearch from './ImageSearch';
import type { ImageResult } from '@/lib/imageSearch';

type Step = 'answer' | 'follow-up' | 'tone' | 'rendering' | 'result';

type Props = {
  promptId: string;
  promptText: string;
  followUp: string | null;
  preferredTone: string | null;
};

const TONES = [
  { id: 'poetic', label: 'Poetic', description: 'Lyrical and evocative' },
  { id: 'letter', label: 'Note to self', description: 'Held as it was felt' },
  { id: 'field-notes', label: 'Field notes', description: 'Observational and precise' },
  { id: 'unfiltered', label: 'Unfiltered', description: 'Raw and honest' },
];

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export default function ReflectionFlow({ promptId, promptText, followUp, preferredTone }: Props) {
  const router = useRouter();
  const posthog = usePostHog();
  const [step, setStep] = useState<Step>('answer');

  function handleFinalTranscript(text: string) {
    if (step === 'answer') {
      setAnswer1((prev) => (prev ? prev + ' ' : '') + text);
    } else if (step === 'follow-up') {
      setAnswer2((prev) => (prev ? prev + ' ' : '') + text);
    }
  }

  const { isSupported, isListening, isSpeaking, interimTranscript, toggleListening, stopListening } =
    useVoiceDictation({ onFinalTranscript: handleFinalTranscript });
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [selectedTone, setSelectedTone] = useState(preferredTone ?? 'unfiltered');
  const [renderedText, setRenderedText] = useState('');
  const [originalRenderedText, setOriginalRenderedText] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fullTranscript = followUp && answer2
    ? `${answer1}\n\n${answer2}`
    : answer1;

  async function handleRender() {
    posthog?.capture('tone_selected', { tone: selectedTone, promptId });
    setStep('rendering');
    setError('');
    try {
      const res = await fetch('/api/reflect/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: fullTranscript, tone: selectedTone, promptText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRenderedText(data.renderedText);
      setOriginalRenderedText(data.renderedText);
      setStep('result');
    } catch {
      setError('Something went wrong. Please try again.');
      setStep('tone');
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await fetch('/api/reflect/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId,
          promptText,
          transcript: fullTranscript,
          renderedText,
          tone: selectedTone,
          image: selectedImage,
        }),
      });
      posthog?.capture('reflection_saved', {
        tone: selectedTone,
        promptId,
        edited: renderedText !== originalRenderedText,
      });
      router.push('/gallery');
    } catch {
      setIsSaving(false);
      setError('Could not save. Please try again.');
    }
  }

  const inputPlaceholder = isSupported === true ? 'Speak or write; take your time' : 'Write; take your time';

  if (step === 'answer') {
    return (
      <div className="max-w-2xl w-full mx-auto px-8 py-16">
        {isSupported === false && (
          <div className="mb-8 px-4 py-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-500 leading-relaxed">
            Voice-to-text — speak your reflection instead of typing — is available in{' '}
            <span className="text-stone-700 font-medium">Chrome</span> and{' '}
            <span className="text-stone-700 font-medium">Edge</span>. Open Gherkin there for the full experience.
          </div>
        )}
        <p className="text-xs uppercase tracking-widest text-[#466353] mb-8">Reflect</p>
        <p className="text-xl font-light text-stone-800 leading-relaxed mb-10">
          {promptText}
        </p>
        <textarea
          autoFocus
          value={answer1}
          onChange={(e) => setAnswer1(e.target.value)}
          placeholder={inputPlaceholder}
          className="w-full min-h-48 text-sm text-stone-700 placeholder-stone-300 bg-transparent border-b border-stone-200 focus:outline-none focus:border-[#85A16A] resize-none leading-relaxed transition-colors pb-2"
        />
        {isListening && interimTranscript && (
          <p className="mt-2 text-xs text-stone-400 italic">{interimTranscript}</p>
        )}
        <div className="mt-8 flex items-center justify-between">
          {isSupported === true && (
            <div className="relative group">
              <button
                onClick={toggleListening}
                aria-label={isListening ? 'Stop recording' : 'Start voice dictation'}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-full text-sm transition-all overflow-hidden ${
                  isListening
                    ? `bg-[#85A16A] text-white${!isSpeaking ? ' animate-pulse' : ''}`
                    : 'border border-[#85A16A] text-[#85A16A] hover:bg-[#85A16A]/8'
                }`}
              >
                {isListening && isSpeaking && (
                  <span className="absolute -inset-0.5 rounded-full border border-[#85A16A]/50 animate-ping" />
                )}
                <MicIcon />
                <span className="relative">{isListening ? 'Listening…' : 'Speak'}</span>
              </button>
              {!isListening && (
                <div className="absolute bottom-full left-0 mb-2 w-52 px-3 py-2 text-xs text-stone-500 bg-white border border-stone-200 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Dictation follows your browser's display language.
                </div>
              )}
            </div>
          )}
          {isSupported !== true && <span />}
          <button
            onClick={() => {
              stopListening();
              setStep(followUp ? 'follow-up' : 'tone');
            }}
            disabled={answer1.trim().length < 10}
            className={`px-8 py-3 rounded-full text-sm transition-all ${
              answer1.trim().length >= 10
                ? 'bg-[#85A16A] text-white hover:opacity-90'
                : 'bg-stone-100 text-[#466353] cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'follow-up') {
    return (
      <div className="max-w-2xl w-full mx-auto px-8 py-16">
        <p className="text-xs uppercase tracking-widest text-[#466353] mb-8">One more</p>
        <p className="text-xl font-light text-stone-800 leading-relaxed mb-10">
          {followUp}
        </p>
        <textarea
          autoFocus
          value={answer2}
          onChange={(e) => setAnswer2(e.target.value)}
          placeholder={inputPlaceholder}
          className="w-full min-h-48 text-sm text-stone-700 placeholder-stone-300 bg-transparent border-b border-stone-200 focus:outline-none focus:border-[#85A16A] resize-none leading-relaxed transition-colors pb-2"
        />
        {isListening && interimTranscript && (
          <p className="mt-2 text-xs text-stone-400 italic">{interimTranscript}</p>
        )}
        <div className="mt-8 flex items-center justify-between">
          {isSupported === true && (
            <div className="relative group">
              <button
                onClick={toggleListening}
                aria-label={isListening ? 'Stop recording' : 'Start voice dictation'}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-full text-sm transition-all overflow-hidden ${
                  isListening
                    ? `bg-[#85A16A] text-white${!isSpeaking ? ' animate-pulse' : ''}`
                    : 'border border-[#85A16A] text-[#85A16A] hover:bg-[#85A16A]/8'
                }`}
              >
                {isListening && isSpeaking && (
                  <span className="absolute -inset-0.5 rounded-full border border-[#85A16A]/50 animate-ping" />
                )}
                <MicIcon />
                <span className="relative">{isListening ? 'Listening…' : 'Speak'}</span>
              </button>
              {!isListening && (
                <div className="absolute bottom-full left-0 mb-2 w-52 px-3 py-2 text-xs text-stone-500 bg-white border border-stone-200 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Dictation follows your browser's display language.
                </div>
              )}
            </div>
          )}
          {isSupported !== true && <span />}
          <button
            onClick={() => {
              stopListening();
              setStep('tone');
            }}
            disabled={answer2.trim().length < 5}
            className={`px-8 py-3 rounded-full text-sm transition-all ${
              answer2.trim().length >= 5
                ? 'bg-[#85A16A] text-white hover:opacity-90'
                : 'bg-stone-100 text-[#466353] cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'tone') {
    return (
      <div className="max-w-2xl w-full mx-auto px-8 py-16">
        <p className="text-xs uppercase tracking-widest text-[#466353] mb-8">
          How shall we render it?
        </p>
        <h2 className="text-2xl font-light text-stone-900 mb-10">Choose a tone.</h2>
        {error && <p className="text-sm text-red-400 mb-6">{error}</p>}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`text-left px-5 py-4 rounded-xl border transition-all duration-150 ${
                selectedTone === tone.id
                  ? 'border-[#85A16A] bg-[#85A16A]/8'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <p className={`text-sm font-medium mb-1 ${selectedTone === tone.id ? 'text-stone-900' : 'text-stone-700'}`}>
                {tone.label}
                {preferredTone === tone.id && (
                  <span className="ml-2 text-xs text-[#85A16A] font-normal">your default</span>
                )}
              </p>
              <p className="text-xs text-[#466353]">{tone.description}</p>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setRenderedText(fullTranscript);
            setOriginalRenderedText(fullTranscript);
            setSelectedTone('as-written');
            setStep('result');
          }}
          className={`w-full text-left px-5 py-4 rounded-xl border border-dashed transition-all duration-150 mb-10 ${
            selectedTone === 'as-written'
              ? 'border-[#85A16A] bg-[#85A16A]/8'
              : 'border-stone-200 hover:border-stone-300'
          }`}
        >
          <p className="text-sm font-medium text-stone-700 mb-1">As written</p>
          <p className="text-xs text-[#466353]">Skip the AI — save your own words exactly</p>
        </button>

        <div className="flex justify-end">
          <button
            onClick={handleRender}
            className="bg-[#85A16A] text-white px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            Write it
          </button>
        </div>
      </div>
    );
  }

  if (step === 'rendering') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-[#466353] animate-pulse">Writing your reflection…</p>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="max-w-2xl w-full mx-auto px-8 py-16">
        <p className="text-xs uppercase tracking-widest text-[#466353] mb-8">
          {selectedTone === 'as-written' ? 'As written' : TONES.find((t) => t.id === selectedTone)?.label}
        </p>
        <textarea
          value={renderedText}
          onChange={(e) => setRenderedText(e.target.value)}
          className="w-full min-h-64 text-sm text-stone-700 bg-transparent border-b border-stone-200 focus:outline-none focus:border-[#85A16A] resize-none leading-relaxed transition-colors pb-2 mb-10"
        />
        <div className="mb-10 pt-6 border-t border-stone-100">
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-4">
            Add an image <span className="normal-case">(optional)</span>
          </p>
          <ImageSearch selected={selectedImage} onSelect={setSelectedImage} />
        </div>
        {error && <p className="text-sm text-red-400 mb-6">{error}</p>}
        <div className="flex items-center gap-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#85A16A] text-white px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Save to my gallery'}
          </button>
          <button
            onClick={() => setStep('tone')}
            className="text-sm text-[#466353] hover:text-stone-700 transition-colors"
          >
            Try another tone
          </button>
        </div>
      </div>
    );
  }

  return null;
}
