'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const Cover = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [beamPositions, setBeamPositions] = useState<number[]>([]);

  useEffect(() => {
    if (ref.current) {
      setContainerWidth(ref.current?.clientWidth ?? 0);
      const height = ref.current?.clientHeight ?? 0;
      const numberOfBeams = Math.floor(height / 10); // Adjust beam spacing
      const positions = Array.from(
        { length: numberOfBeams },
        (_, i) => (i + 1) * (height / (numberOfBeams + 1))
      );
      setBeamPositions(positions);
    }
  }, [ref]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={ref}
      className={cn(
        'relative hover:bg-neutral-900 group/cover inline-block dark:bg-neutral-900 bg-black px-4 py-4 transition duration-200 rounded-sm',
        className
      )}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: {
                duration: 0.2,
              },
            }}
            className="h-full w-full overflow-hidden absolute inset-0"
          >
            <motion.div
              animate={{
                translateX: ['-50%', '0%'],
              }}
              transition={{
                translateX: {
                  duration: 10,
                  ease: 'linear',
                  repeat: Infinity,
                },
              }}
              className="w-[200%] h-full flex"
            >
              {/* Add sparkles or additional animations */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beams */}
      {beamPositions.map((position, index) => (
        <Beam
          key={index}
          hovered={hovered}
          duration={Math.random() * 2 + 1}
          delay={Math.random() * 2 + 1}
          style={{
            top: `${position}px`,
          }}
        />
      ))}

      {/* Children */}
      <motion.span
        key={String(hovered)}
        animate={{
          scale: hovered ? 0.8 : 1,
        }}
        exit={{
          filter: 'none',
          scale: 1,
        }}
        transition={{
          duration: 0.2,
          scale: {
            duration: 0.2,
          },
        }}
        className="dark:text-white inline-block text-neutral-900 relative z-20 group-hover/cover:text-white transition duration-200"
      >
        {children}
      </motion.span>
    </div>
  );
};

export const Beam = ({
  className,
  delay,
  duration,
  hovered,
  style,
}: {
  className?: string;
  delay?: number;
  duration?: number;
  hovered?: boolean; // Add hovered to the type definition
  style?: React.CSSProperties; // Add style for inline styles like top
}) => {
  return (
    <motion.div
      className={`absolute inset-x-0 w-full h-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 ${className}`}
      initial={{ opacity: hovered ? 1 : 0 }}
      animate={{ opacity: hovered ? [0.5, 1] : [1, 0.5] }}
      transition={{
        delay,
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={style} // Pass inline styles like top here
    />
  );
};
