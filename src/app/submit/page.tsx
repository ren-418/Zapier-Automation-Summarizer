'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      // Redirect to homepage on success
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8 text-text text-center">Create New Blog Post</h1>
      
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-card p-8 rounded-lg shadow-lg border border-border">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="title" className="block text-text text-lg font-medium mb-2">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 border border-border rounded-md bg-input text-text placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Enter your blog post title"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-text text-lg font-medium mb-2">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={15}
            className="w-full p-3 border border-border rounded-md bg-input text-text placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Write your blog post content here..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-accent text-primary font-bold py-3 px-6 rounded-md hover:bg-opacity-90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Post'}
        </button>
      </form>
    </div>
  );
} 