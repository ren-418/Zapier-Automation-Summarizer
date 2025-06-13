import { Post } from '@/lib/data';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  // Format the date
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Create a preview of the content (first 150 characters)
  const contentPreview = post.content.length > 150
    ? `${post.content.slice(0, 150)}...`
    : post.content;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h2>
        <p className="text-gray-600 mb-4">{contentPreview}</p>
        <div className="flex justify-between items-center">
          <time className="text-sm text-gray-500">{formattedDate}</time>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Read more →
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;