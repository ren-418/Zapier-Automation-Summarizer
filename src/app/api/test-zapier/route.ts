import { NextResponse } from 'next/server';

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface BlogPostPayload {
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  timestamp: string;
  metadata: {
    source: string;
    test: boolean;
  };
}

export async function GET() {
  try {
    const webhookUrl = "https://hooks.zapier.com/hooks/catch/23333155/uy05gja/"; // Hardcoded for testing

    console.log('Sending test blog post to Zapier webhook:', webhookUrl);

    // Create a sample blog post payload
    const samplePost: BlogPostPayload = {
      title: "Sample Blog Post",
      content: "This is a sample blog post content for testing Zapier integration. It includes various fields that might be useful for automation.",
      author: "Test Author",
      category: "Testing",
      tags: ["test", "zapier", "automation", "webhook"],
      timestamp: new Date().toISOString(),
      metadata: {
        source: "test-zapier-endpoint",
        test: true
      }
    };

    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Next.js Blog App',
          },
          body: JSON.stringify(samplePost),
        });

        if (response.ok) {
          const responseData = await response.text();
          return NextResponse.json({
            success: true,
            message: 'Sample blog post sent successfully to Zapier',
            data: samplePost,
            response: responseData
          });
        }

        const errorText = await response.text();
        console.error(`Zapier webhook attempt ${attempt} failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        lastError = errorText;

        // If it's a CloudFront error, wait longer before retrying
        if (errorText.includes('CloudFront')) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
          console.log(`Waiting ${waitTime}ms before retry...`);
          await delay(waitTime);
        }

      } catch (error) {
        console.error(`Zapier webhook attempt ${attempt} failed with error:`, error);
        lastError = error;
        if (attempt < 3) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(`Waiting ${waitTime}ms before retry...`);
          await delay(waitTime);
        }
      }
    }

    return NextResponse.json({
      error: 'Failed to send sample blog post to Zapier after all retries',
      details: lastError,
      sampleData: samplePost
    }, { status: 503 });

  } catch (error) {
    console.error('Zapier test failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test blog post to Zapier',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}