import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { summary } = body;

    if (!summary || typeof summary !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body. "summary" (string) is required.' },
        { status: 400 }
      );
    }

    const normalizedSummary = summary.toLowerCase();
    let type: "Product" | "Team" | "Other" = "Other";

    if (normalizedSummary.includes('launch') || normalizedSummary.includes('product')) {
      type = 'Product';
    } else if (normalizedSummary.includes('hiring') || normalizedSummary.includes('team')) {
      type = 'Team';
    }

    console.log(`Received summary: "${summary}"`);
    console.log(`Classified as: "${type}"`);

    return NextResponse.json({ type });
  } catch (error) {
    console.error('Error in classify API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}