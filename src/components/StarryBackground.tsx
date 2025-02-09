'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function StarryBackground() {
  const [stars, setStars] = useState<{ top: string; left: string }[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 50 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }));
    setStars(generatedStars);
  }, []);

  return (
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
  );
}
