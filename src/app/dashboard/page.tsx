"use client";
import { useState, useEffect } from "react";
import { FloatingNav } from "@/components/ui/Sidebar";
import { IconHome, IconMusic, IconMessages, IconLogout, IconPlus } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface Post {
  id: string;
  content: string;
  image?: string;
  userId: string;
  username: string;
  timestamp: number;
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({ content: "", image: null as File | null });
  const [isLoading, setIsLoading] = useState(false);

  const navItems = [
    { name: "Home", link: "/dashboard", icon: <IconHome className="h-5 w-5" /> },
    { name: "Playlistify", link: "/dashboard/chat", icon: <IconMusic className="h-5 w-5" /> },
    { name: "Posts", link: "/dashboard/posts", icon: <IconMessages className="h-5 w-5" /> },
    { name: "Logout", link: "/logout", icon: <IconLogout className="h-5 w-5" /> },
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        console.error('Failed to fetch posts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!newPost.content.trim()) {
        alert('Please enter some content');
        return;
      }

      const formData = new FormData();
      formData.append('content', newPost.content);
      if (newPost.image) {
        formData.append('image', newPost.image);
      }
      formData.append('userId', 'user-id'); // Replace with actual user ID
      formData.append('username', 'username'); // Replace with actual username

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setIsCreateOpen(false);
        setNewPost({ content: "", image: null });
        setPosts(prevPosts => [data.post, ...prevPosts]);
        await fetchPosts();
      } else {
        alert(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <FloatingNav navItems={navItems} />
      <main className="flex-1 p-6 ml-20">
        <div className="max-w-3xl mx-auto mt-8">
          <motion.button
            onClick={() => setIsCreateOpen(true)}
            className="w-14 h-14 rounded-full bg-purple-500 fixed bottom-8 right-8 flex items-center justify-center hover:bg-purple-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconPlus className="w-6 h-6 text-white" />
          </motion.button>

          {isCreateOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#1E1F22] rounded-lg p-6 w-full max-w-lg"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Create Post</h2>
                <form onSubmit={handleCreatePost}>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full p-3 rounded bg-[#2E2F33] text-white mb-4"
                    placeholder="What's on your mind?"
                    rows={4}
                    disabled={isLoading}
                  />
                  <input
                    type="file"
                    onChange={(e) => setNewPost({ ...newPost, image: e.target.files?.[0] || null })}
                    className="mb-4 text-white"
                    accept="image/*"
                    disabled={isLoading}
                  />
                  {newPost.image && (
                    <div className="mb-4">
                      <img
                        src={URL.createObjectURL(newPost.image)}
                        alt="Preview"
                        className="rounded-lg max-h-48 object-cover"
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
                      className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          <div className="space-y-6">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1E1F22] rounded-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    {post.username[0].toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-white font-semibold">{post.username}</h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-white mb-4">{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="rounded-lg w-full object-cover max-h-96"
                    loading="lazy"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}