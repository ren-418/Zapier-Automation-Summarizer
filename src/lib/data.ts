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
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
          timestamp: newPost.date.toISOString(),
        }),
      });
    }
  } catch (error) {
    // Log the error but don't fail the post creation
    console.error('Failed to send post to Zapier webhook:', error);
  }

  return newPost;
}