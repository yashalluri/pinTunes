
'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [stars, setStars] = useState<{ top: string; left: string }[]>([]);
  const [transitioning, setTransitioning] = useState(false);

  // Generate star positions on the client side
  useEffect(() => {
    const generatedStars = Array.from({ length: 50 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }));
    setStars(generatedStars);
  }, []);

  const handleClick = () => {
    setTransitioning(true); // Start transition animation
    setTimeout(() => {
      router.push('/next'); // Navigate to the next page after animation
    }, 2000); // Delay navigation to match animation duration
  };

  return (
    <div className="relative flex items-center justify-center h-screen bg-black overflow-hidden">
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

      {/* Text Content */}
      {!transitioning && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <h1 className="text-4xl font-bold text-gray-300 font-sans">
            Create the playlists for the moment{' '}
            <motion.span
              className="text-purple-500 cursor-pointer no-underline"
              whileHover={{
                scale: 1.2,
                textShadow: '0px 0px 8px rgba(255,255,255,0.9)', // Moon glow effect
              }}
              onClick={handleClick}
            >
             PinTunes
            </motion.span>
          </h1>
        </motion.div>
      )}

      {/* Transition Effect */}
      {transitioning && (
        <motion.div
          className="absolute inset-0 bg-black flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <motion.h1
            className="text-4xl font-bold text-gray-300"
            initial={{ scale: 1 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 2 }}
          >
            PinTunes
          </motion.h1>
        </motion.div>
      )}
    </div>
  );
}
