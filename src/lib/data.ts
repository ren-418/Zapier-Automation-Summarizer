export interface Post {
  id: string;
  title: string;
  content: string;
  date: Date;
}

// In-memory storage for blog posts
const posts: Post[] = [
  {
    id: '1',
    title: 'Welcome to My Blog',
    content: 'This is the first post on my blog. Stay tuned for more content!',
    date: new Date('2024-03-13'),
  },
];

// Get all posts
export function getPosts(): Post[] {
  return [...posts].sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface WebhookData {
  title: string;
  content: string;
  summary: string;
  timestamp: string;
}

// Helper function to send webhook with retries
async function sendWebhookWithRetry(url: string, data: WebhookData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Next.js Blog App',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Webhook sent successfully');
        return true;
      }

      const errorText = await response.text();
      console.error(`Webhook attempt ${attempt} failed:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      // If it's a CloudFront error, wait longer before retrying
      if (errorText.includes('CloudFront')) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
        console.log(`Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      }

    } catch (error) {
      console.error(`Webhook attempt ${attempt} failed with error:`, error);
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      }
    }
  }
  return false;
}

import { classifyAndSend } from './classifyAndSend';

// Add a new post
export async function addPost(post: Omit<Post, 'id' | 'date'>): Promise<Post> {
  // Generate a summary for the post
  let summary = '';
  try {
    const summarizeResponse = await fetch('http://localhost:3000/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
      }),
    });

    if (summarizeResponse.ok) {
      const { summary: generatedSummary } = await summarizeResponse.json();
      summary = generatedSummary;
      console.log('Generated summary:', summary);
    } else {
      console.error('Failed to generate summary:', await summarizeResponse.text());
    }
  } catch (error) {
    console.error('Error generating summary:', error);
  }

  const newPost: Post = {
    id: crypto.randomUUID(),
    date: new Date(),
    ...post,
  };

  posts.push(newPost);

  // Send to Zapier webhook with the summary
  try {
    const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('Zapier webhook URL not configured. Skipping webhook notification.');
    } else {
      await sendWebhookWithRetry(webhookUrl, {
        title: post.title,
        content: post.content,
        summary: summary, // Include the generated summary
        timestamp: newPost.date.toISOString(),
      });
    }
  } catch (error) {
    console.error('Failed to send post to Zapier webhook:', error);
  }

  // Call classifyAndSend after sending to Zapier
  try {
    const classificationSummary = summary || `New blog post: ${post.title}. Content preview: ${post.content.substring(0, 100)}...`;
    const classificationLink = `http://localhost:3000/posts/${newPost.id}`;

    console.log('Calling classifyAndSend...');
    const classificationResult = await classifyAndSend(classificationSummary, classificationLink);
    console.log('classifyAndSend result:', classificationResult);
  } catch (classificationError) {
    console.error('Error calling classifyAndSend:', classificationError);
  }

  return newPost;
}