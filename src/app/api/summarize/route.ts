import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { title, description, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const prompt = `Summarize the following blog article into 1–2 professional, clear sentences. Focus on the main topic and key update, and write it as if posting an update to a professional team Discord server. Be brief and informative.

Title: ${title}
Description: ${description || ''}
Full Content: ${content}

Format the response as a single sentence starting with an appropriate emoji (🚀 for launches, 📢 for announcements, etc.).`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional technical writer who creates clear, concise summaries for team communications."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 150,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('Failed to generate summary');
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in summarize endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}