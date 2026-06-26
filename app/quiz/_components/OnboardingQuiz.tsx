'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Option = { label: string; value: string };

type Question = {
  id: string;
  type: 'single' | 'multi';
  text: string;
  subtext?: string;
  options: Option[];
};

const QUESTIONS: Question[] = [
  {
    id: 'tags',
    type: 'multi',
    text: 'What are you into?',
    subtext: 'Choose everything that feels true.',
    options: [
      { label: 'Music', value: 'music' },
      { label: 'Films & series', value: 'screen-stage' },
      { label: 'Books & writing', value: 'stories-words' },
      { label: 'Gaming', value: 'gaming' },
      { label: 'Theatre & live events', value: 'theatre' },
      { label: 'Podcasts', value: 'podcasts' },
      { label: 'Art & photography', value: 'art' },
      { label: 'Sport & movement', value: 'sport' },
    ],
  },
  {
    id: 'chapter',
    type: 'single',
    text: 'What chapter are you in?',
    subtext: 'Just the one that feels closest.',
    options: [
      { label: 'Something is changing', value: 'transition' },
      { label: "I'm building, slowly", value: 'building' },
      { label: "I'm looking back more than forward", value: 'reflection' },
      { label: "I'm not sure yet — that's why I'm here", value: 'searching' },
    ],
  },
  {
    id: 'inner_life',
    type: 'single',
    text: 'What are you here for?',
    options: [
      { label: 'To understand why I feel the way I do', value: 'understanding' },
      { label: 'To make sense of my tastes and obsessions', value: 'tastes' },
      { label: "To find patterns in who I've been", value: 'patterns' },
      { label: 'To build something permanent about myself', value: 'legacy' },
    ],
  },
];

type Answers = {
  tags: string[];
  chapter: string;
  inner_life: string[];
};

export default function OnboardingQuiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Answers>({
    tags: [],
    chapter: '',
    inner_life: [],
  });

  const question = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  function advance() {
    if (step < QUESTIONS.length - 1) {
      setVisible(false);
      setTimeout(() => {
        setStep((s) => s + 1);
        setVisible(true);
      }, 300);
    } else {
      handleSubmit();
    }
  }

  function handleSingleSelect(value: string) {
    if (question.id === 'chapter') {
      setAnswers((a) => ({ ...a, chapter: value }));
    } else if (question.id === 'inner_life') {
      setAnswers((a) => ({ ...a, inner_life: [value] }));
    }
    advance();
  }

  function toggleTag(value: string) {
    setAnswers((a) => ({
      ...a,
      tags: a.tags.includes(value)
        ? a.tags.filter((v) => v !== value)
        : [...a.tags, value],
    }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    });
    router.push('/explore');
  }

  const canAdvanceMulti = question.type === 'multi' && answers.tags.length > 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress bar */}
      <div className="h-0.5 bg-stone-100">
        <div
          className="h-full bg-[#85A16A] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question area */}
      <div
        className={`flex-1 flex flex-col items-center justify-center px-8 py-16 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-full max-w-lg">
          {/* Step counter */}
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-8">
            {step + 1} / {QUESTIONS.length}
          </p>

          {/* Question text */}
          <h2 className="text-3xl font-light text-stone-900 mb-2 leading-snug">
            {question.text}
          </h2>
          {question.subtext && (
            <p className="text-sm text-stone-400 mb-10">{question.subtext}</p>
          )}
          {!question.subtext && <div className="mb-10" />}

          {/* Options */}
          {question.type === 'multi' ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {question.options.map((option) => {
                  const isSelected = answers.tags.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleTag(option.value)}
                      className={`text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                        isSelected
                          ? 'border-[#85A16A] bg-[#85A16A]/8 text-stone-900'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:text-stone-900'
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 rounded border mr-3 align-middle transition-colors ${
                          isSelected
                            ? 'bg-[#85A16A] border-[#85A16A]'
                            : 'border-stone-300'
                        }`}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={advance}
                disabled={!canAdvanceMulti || isSubmitting}
                className={`px-8 py-3 rounded-full text-sm transition-all duration-150 ${
                  canAdvanceMulti
                    ? 'bg-[#85A16A] text-white hover:opacity-90'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSingleSelect(option.value)}
                  disabled={isSubmitting}
                  className="text-left px-5 py-4 rounded-xl border border-stone-200 text-sm text-stone-700 hover:border-[#85A16A] hover:text-stone-900 transition-all duration-150"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
