import { Post } from '@/lib/data';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-card text-text rounded-lg shadow-md overflow-hidden 
                 hover:shadow-xl transition-all duration-300 ease-in-out 
                 border border-border flex flex-col"
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
          <span className={typeBadgeClasses}>{post.type}</span>
        </div>
        <p className="text-secondary mb-4 flex-grow text-base">{contentPreview}</p>
      </div>
      <div className="p-6 pt-0 flex justify-between items-center mt-auto">
        <time className="text-sm text-tertiary">{formattedDate}</time>
        <Link href={`/posts/${post.id}`} className="text-accent hover:underline font-medium text-base">
          Read more →
        </Link>
      </div>
    </motion.article>
  );
};

export default PostCard;