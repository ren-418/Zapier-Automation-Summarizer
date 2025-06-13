export interface Post {
  id: string;
  title: string;
  content: string;
  date: Date;
}

// In-memory storage for blog posts
let posts: Post[] = [
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
export function addPost(post: Omit<Post, 'id' | 'date'>): Post {
  const newPost: Post = {
    id: crypto.randomUUID(),
    date: new Date(),
    ...post,
  };
  
  posts.push(newPost);
  return newPost;
} 