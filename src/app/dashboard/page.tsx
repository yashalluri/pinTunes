'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import StarryBackground from '../../components/StarryBackground';

type Post = {
  id: number;
  text: string;
  image?: string; // Optional image
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]); // Define the posts state with proper typing
  const [newPost, setNewPost] = useState<{ text: string; image: File | null }>({
    text: '',
    image: null,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Fetch posts from the backend (dummy data for now)
      const response = await fetch('/api/posts');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewPost({ ...newPost, text: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPost({ ...newPost, image: e.target.files[0] });
    }
  };

  const handlePostSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('text', newPost.text);
      if (newPost.image) {
        formData.append('image', newPost.image);
      }

      // Send post data to backend
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create post');

      // Refresh posts after submission
      fetchPosts();
      setNewPost({ text: '', image: null });
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <StarryBackground />

      {/* Floating Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 bg-opacity-50 p-4 z-10">
        <ul className="flex justify-center space-x-4">
          <li>
            <a href="/dashboard" className="hover:text-purple-500">
              Feed
            </a>
          </li>
          <li>
            <a href="/dashboard/playlistify" className="hover:text-purple-500">
              Playlistify
            </a>
          </li>
          <li>
            <a href="/dashboard/posts" className="hover:text-purple-500">
              Posts
            </a>
          </li>
        </ul>
      </nav>

      {/* Feed Content */}
      <div className="container mx-auto pt-20 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Feed</h1>

        {/* New Post Form */}
        <form onSubmit={handlePostSubmit} className="mb-8">
          <textarea
            value={newPost.text}
            onChange={handleInputChange}
            placeholder="Share your musical experience..."
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-2"
          />
          <button
            type="submit"
            className="mt-2 bg-purple-500 text-white px-4 py-2 rounded"
          >
            Post
          </button>
        </form>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 p-4 rounded"
            >
              <p>{post.text}</p>
              {post.image && (
                <img
                  src={`/uploads/${post.image}`} // Adjust path as per your backend setup
                  alt="Post"
                  className="mt-2 rounded"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
