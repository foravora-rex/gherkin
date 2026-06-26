import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TONE_SYSTEM_PROMPTS: Record<string, string> = {
  poetic: `You are a writer who transforms personal reflections into lyrical prose. Take what this person shared and render it as evocative, image-rich writing that captures the feeling beneath their words. Keep their meaning intact; elevate only the form. Write in first person. Do not add details they did not share. Write 2–4 paragraphs.`,

  letter: `You are writing a letter from this person to themselves. Take their reflection and render it as a warm, honest letter beginning with "Dear me," — written as if the person who reflected is writing to their future self about this moment. Keep all their details; transform only the form. Do not add anything they did not share. Write 2–3 paragraphs.`,

  'field-notes': `You are rendering a personal reflection as precise field notes — observational, specific, and unsentimental. Use fragments where useful. Strip unnecessary emotion and let the observations speak. Write in a note-taking style. Do not add anything they did not share. Keep it to 100–200 words.`,

  unfiltered: `You are tightening a personal reflection into its most honest, direct form. Cut hedging and qualifications. Keep the raw truth of what they said. Write in first person. Do not add anything they did not share. Make it feel like they said it without any filter — direct, real, possibly uncomfortable. 2–3 short paragraphs.`,
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { transcript, tone, promptText } = await request.json();

  const systemPrompt = TONE_SYSTEM_PROMPTS[tone];
  if (!systemPrompt) {
    return NextResponse.json({ error: 'Invalid tone' }, { status: 400 });
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `The prompt they reflected on: "${promptText}"\n\nTheir reflection:\n${transcript}`,
      },
    ],
  });

  const renderedText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return NextResponse.json({ renderedText });
}
