import { promises as fs } from 'fs';
import path from 'path';

export interface Post {
  id: string;
  title: string;
  content: string;
  date: Date;
  type: "Product" | "Team" | "Other";
}

interface RawPost {
  id: string;
  title: string;
  content: string;
  date: string; // Date is a string in JSON
  type: "Product" | "Team" | "Other";
}

const postsFilePath = path.join(process.cwd(), 'src', 'data', 'posts.json');

// Get all posts
export async function getPosts(): Promise<Post[]> {
  try {
    const fileContent = await fs.readFile(postsFilePath, 'utf8');
    const posts: Post[] = JSON.parse(fileContent).map((post: RawPost) => ({
      ...post,
      date: new Date(post.date),
    }));
    console.log(`[getPosts] Returning ${posts.length} posts from file.`);
    return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File not found, return empty array
      console.warn('posts.json not found, initializing with empty array.');
      return [];
    }
    console.error('Error reading posts.json:', error);
    throw error;
  }
}

import { classifyAndSend } from './classifyAndSend';

// Add a new post
export async function addPost(post: Omit<Post, 'id' | 'date' | 'type'>): Promise<Post> {
  const currentPosts = await getPosts(); // Read existing posts from file

  // Generate a summary for the post - now handled by Zapier, so we use a content preview
  const contentPreview = post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '');
  const initialSummary = `New post: ${post.title}. ${contentPreview}`;

  let classifiedType: Post['type'] = 'Other';

  // Classify the post using the /api/classify endpoint first
  try {
    console.log('Calling /api/classify for type classification...');
    const classifyResponse = await fetch('http://localhost:3000/api/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ summary: initialSummary }), // Use initialSummary for classification
    });

    if (classifyResponse.ok) {
      const { type } = await classifyResponse.json() as { type: Post['type'] };
      classifiedType = type;
      console.log(`Post classified as: ${classifiedType}`);
    } else {
      console.error('Failed to classify post:', await classifyResponse.text());
    }
  } catch (classificationError) {
    console.error('Error during classification:', classificationError);
  }

  const newPost: Post = {
    id: crypto.randomUUID(),
    date: new Date(),
    type: classifiedType, // Use the classified type directly
    ...post,
  };

  currentPosts.push(newPost); // Add new post to the array
  console.log(`[addPost] Added post: ${newPost.title}. Total posts: ${currentPosts.length}`);

  // Write updated posts back to file
  try {
    const postsToWrite = currentPosts.map(p => ({
      ...p,
      date: p.date.toISOString(), // Convert Date object to ISO string for storage
    }));
    await fs.writeFile(postsFilePath, JSON.stringify(postsToWrite, null, 2), 'utf8');
    console.log('[addPost] Posts saved to posts.json');
  } catch (writeError) {
    console.error('Error writing posts to posts.json:', writeError);
    throw writeError;
  }

  // Send to Discord (if applicable) using the classified type
  try {
    const classificationLink = `http://localhost:3000/posts/${newPost.id}`;
    await classifyAndSend(initialSummary, classifiedType, classificationLink);
    console.log('classifyAndSend completed.');
  } catch (classificationError) {
    console.error('Error during classifyAndSend:', classificationError);
  }

  return newPost;
}