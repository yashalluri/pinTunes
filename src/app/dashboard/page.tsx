'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [stars, setStars] = useState<{ top: string; left: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const storedUserData = localStorage.getItem('userData');
    if (!storedUserData) {
      router.push('/next');
      return;
    }

    // Generate stars
    if (typeof window !== 'undefined') {
      const generatedStars = Array.from({ length: 50 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }));
      setStars(generatedStars);
    }
  }, [router]);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
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
              opacity: [0.5, 1, 0.5],
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
    </div>
  );
} 