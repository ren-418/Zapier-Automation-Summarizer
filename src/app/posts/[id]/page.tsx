import { Post } from '@/lib/data';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface PostDetailPageProps {
  params: { id: string };
}

async function getPostById(id: string): Promise<Post | null> {
  const res = await fetch(`http://localhost:3000/api/posts?id=${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    // Log the error but don't necessarily throw, handle gracefully on UI
    console.error(`Failed to fetch post with ID ${id}:`, res.status, res.statusText);
    return null; // Return null if post not found or error occurs
  }

  const posts = await res.json();
  // The API returns an array, so find the specific post
  return posts.find((post: Post) => post.id === id) || null;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = params;
  const post = await getPostById(id);

  if (!post) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-text">
        <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
        <p className="text-lg mb-8">The blog post you are looking for does not exist.</p>
        <Link href="/" className="text-accent hover:underline flex items-center justify-center">
          <ChevronLeftIcon className="h-5 w-5 mr-1" /> Back to all posts
        </Link>
      </div>
    );
  }

  // Determine type badge styling
  let typeBadgeClasses = 'px-3 py-1 rounded-full text-sm font-medium';
  switch (post.type) {
    case 'Product':
      typeBadgeClasses += ' bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      break;
    case 'Team':
      typeBadgeClasses += ' bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      break;
    case 'Other':
      typeBadgeClasses += ' bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
      break;
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const dateObject = new Date(post.date);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
      <Link href="/blog" className="text-accent hover:underline flex items-center mb-8">
        <ChevronLeftIcon className="h-5 w-5 mr-1" /> Back to all posts
      </Link>

      <article className="bg-card p-8 rounded-lg shadow-lg border border-border">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-text leading-tight">{post.title}</h1>
        
        <div className="flex items-center space-x-4 mb-6 text-tertiary text-sm">
          <time dateTime={dateObject.toISOString()}>{formattedDate}</time>
          <span className={typeBadgeClasses}>{post.type}</span>
        </div>

        <div className="prose prose-lg max-w-none text-text leading-relaxed" style={{ color: 'rgb(var(--color-text))', backgroundColor: 'rgb(var(--color-card))', minHeight: '200px' }}>
          <p>{post.content}</p>
        </div>
      </article>
    </div>
  );
} 