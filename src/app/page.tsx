'use client';

import { useState } from 'react';
import { Post } from '@/lib/data';
import PostCard from '@/components/PostCard';
import Image from 'next/image';

async function getPosts(): Promise<Post[]> {
  // This fetch will run on the client side since the component is 'use client'
  const res = await fetch('http://localhost:3000/api/posts', {
    cache: 'no-store',
  });

  if (!res.ok) {
    // In a real app, you'd handle this gracefully, e.g., throw a user-friendly error
    console.error('Failed to fetch posts');
    return []; // Return empty array on failure
  }

  return res.json();
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [subscribe, setSubscribe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', { email, subscribe });
    // Here you would typically send this data to your newsletter service
    alert(`Subscribed ${email} to newsletter: ${subscribe}`);
    setEmail('');
    setSubscribe(false);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-20 md:py-28 lg:py-36 overflow-hidden ">
        {/* Overlay to darken background image, if used */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-90"></div>
        {/* You can replace this with a responsive image or just keep the gradient background */}
        {/* <Image
          src="/path-to-your-business-city-image.jpg"
          alt="Business city background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="opacity-30"
        /> */}

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 max-w-2xl mx-auto md:mx-0">
            Take Your <span className="text-accent">Business</span> to Higher Ground
          </h1>
          <p className="text-lg sm:text-xl mb-8 max-w-xl mx-auto md:mx-0 text-gray-300">
            Get marketing tips to accelerate your business growth
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 max-w-xl mx-auto md:mx-0">
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-grow p-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="bg-accent text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Submit
            </button>
          </form>
          <div className="mt-4 text-center md:text-left">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={subscribe}
                onChange={(e) => setSubscribe(e.target.checked)}
                className="form-checkbox h-5 w-5 text-accent rounded border-gray-300 focus:ring-accent"
              />
              <span className="ml-2 text-gray-300">Yes, subscribe me to your newsletter.</span>
            </label>
          </div>
        </div>
      </section>
    </>
  );
}
