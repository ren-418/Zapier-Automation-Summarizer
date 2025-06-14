'use client';

import { useState } from 'react';
import { Post } from '@/lib/data';
import PostCard from '@/components/PostCard';

async function getPosts(): Promise<Post[]> {
  const res = await fetch('http://localhost:3000/api/posts', {
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Failed to fetch posts');
    return [];
  }

  return res.json();
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    getPosts().then(data => {
      setPosts(data);
      setLoading(false);
    }).catch(error => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });
  });

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold mb-8 text-text text-center md:text-left">All Posts</h2>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <svg className="animate-spin h-10 w-10 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : posts.length === 0 ? (
        <p className="text-text text-center py-8">No posts yet. Be the first to create one!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}