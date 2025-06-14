export interface Post {
  id: string;
  title: string;
  content: string;
  date: Date;
  type: string;
}

// In-memory storage for blog posts
const posts: Post[] = [
  {
    id: '1',
    title: 'Welcome to My Blog',
    content: 'This is the first post on my blog. Stay tuned for more content!',
    date: new Date('2024-03-13'),
    type: 'Other',
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
export async function addPost(post: Omit<Post, 'id' | 'date' | 'type'>): Promise<Post> {
  // Generate a summary for the post - now handled by Zapier, so we use a content preview
  const contentPreview = post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '');
  const initialSummary = `New post: ${post.title}. ${contentPreview}`;

  const newPost: Post = {
    id: crypto.randomUUID(),
    date: new Date(),
    // For now, type is determined by classifyAndSend. If Zapier sends type, this will change.
    type: 'Other', // Default or placeholder type
    ...post,
  };

  posts.push(newPost);

  // Send to Zapier webhook
  try {
    const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('Zapier webhook URL not configured. Skipping Zapier webhook notification.');
    } else {
      await sendWebhookWithRetry(webhookUrl, {
        title: post.title,
        content: post.content,
        summary: initialSummary, // Send the content preview as summary to Zapier
        timestamp: newPost.date.toISOString(),
      });
    }
  } catch (error) {
    console.error('Failed to send post to Zapier webhook:', error);
  }

  // Classify and send to Discord (if applicable)
  try {
    const classificationLink = `http://localhost:3000/posts/${newPost.id}`;
    console.log('Calling classifyAndSend for type classification...');

    // Re-classify the post using the /api/classify endpoint
    const classifyResponse = await fetch('http://localhost:3000/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary: initialSummary }), // Use initialSummary for classification
    });

    let classifiedType: Post['type'] = 'Other';
    if (classifyResponse.ok) {
      const { type } = await classifyResponse.json();
      classifiedType = type;
      console.log(`Post classified as: ${classifiedType}`);
      // Update the newPost object with the classified type
      newPost.type = classifiedType; // This modifies the object in the 'posts' array directly
    } else {
      console.error('Failed to classify post:', await classifyResponse.text());
    }

    await classifyAndSend(initialSummary, classifiedType, classificationLink); // Pass initialSummary and classifiedType
    console.log('classifyAndSend completed.');

  } catch (classificationError) {
    console.error('Error during classification and sending:', classificationError);
  }

  return newPost;
}