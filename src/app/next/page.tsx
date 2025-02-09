'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [stars, setStars] = useState<{ top: string; left: string }[]>([]);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and sign-up

  // Generate star positions on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const generatedStars = Array.from({ length: 50 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }));
      setStars(generatedStars);
    }
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-black overflow-hidden">
      {/* Starry Background */}
      <div className="absolute inset-0">
        {stars.map((star, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            style={{
              top: star.top,
              left: star.left,
            }}
            animate={{
              opacity: [0.5, 1, 0.5], // Twinkling effect
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Login/Sign-Up Form */}
      <motion.div
        className="relative z-10 bg-gray-800 p-8 rounded-lg shadow-lg w-[90%] max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <form className="flex flex-col space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="p-3 rounded bg-purple-500 text-white font-bold hover:bg-purple-600 transition duration-200"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="flex items-center justify-center mt-4">
          <p className="text-gray-400 mr-2">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-500 font-bold transition duration-200"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
