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

// Add a new post
export async function addPost(post: Omit<Post, 'id' | 'date'>): Promise<Post> {
  const newPost: Post = {
    id: crypto.randomUUID(),
    date: new Date(),
    ...post,
  };

  posts.push(newPost);

  // Send to Zapier webhook
  try {
    const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('Zapier webhook URL not configured. Skipping webhook notification.');
    } else {
      await sendWebhookWithRetry(webhookUrl, {
        title: post.title,
        content: post.content,
        timestamp: newPost.date.toISOString(),
      });
    }
  } catch (error) {
    // Log the error but don't fail the post creation
    console.error('Failed to send post to Zapier webhook:', error);
  }

  return newPost;
}