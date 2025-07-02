// File: src/app/api/suggest-messages/route.ts

import OpenAI from 'openai';
import { streamText } from 'ai/stream';

import { StreamingTextResponse } from 'ai'; // ✅ correct in v3
import { type NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // make sure this is defined in your .env
});

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const prompt = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction.`;

  const response = await streamText({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    api: openai,
  });

  return new StreamingTextResponse(response);
}
