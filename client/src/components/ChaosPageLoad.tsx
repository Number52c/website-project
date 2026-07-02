import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';

interface ChaosPageLoadProps {
  children: ReactNode;
  duration?: number;
}

/**
 * ChaosPageLoad: Epic page load animation where all elements fly in from random directions
 * and snap into place with physics-based motion. Creates a "chaos to order" effect.
 */
export default function ChaosPageLoad({ children, duration = 1.2 }: ChaosPageLoadProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Generate random starting position (off-screen chaos)
  // Mobile-optimized: reduce animation distance on smaller screens
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const getRandomStart = () => {
    const distance = isMobile ? 300 : 500; // Smaller distance on mobile
    const directions = [
      { x: -distance, y: -distance, rotate: isMobile ? -20 : -45 }, // top-left
      { x: distance, y: -distance, rotate: isMobile ? 20 : 45 },   // top-right
      { x: -distance, y: distance, rotate: isMobile ? -20 : -45 },  // bottom-left
      { x: distance, y: distance, rotate: isMobile ? 20 : 45 },    // bottom-right
      { x: isMobile ? -400 : -800, y: 0, rotate: isMobile ? -30 : -90 },    // left
      { x: isMobile ? 400 : 800, y: 0, rotate: isMobile ? 30 : 90 },      // right
      { x: 0, y: isMobile ? -400 : -800, rotate: 0 },      // top
      { x: 0, y: isMobile ? 400 : 800, rotate: 0 },       // bottom
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  const chaosStart = getRandomStart();

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: chaosStart.x,
      y: chaosStart.y,
      rotate: chaosStart.rotate,
      scale: 0.3,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: isMobile ? 120 : 100, // Faster on mobile for snappier feel
        damping: isMobile ? 18 : 15,
        mass: 1,
      },
    },
  };

  // Wrap children to apply stagger animation
  const childArray = Array.isArray(children) ? children : [children];

  return (
    <motion.div
      variants={containerVariants}
      initial={isLoading ? 'hidden' : 'visible'}
      animate="visible"
      className="w-full"
    >
      {childArray.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="w-full"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Alternative: ChaosPageLoadSection - Wrap individual sections for targeted chaos effect
 */
export function ChaosPageLoadSection({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  // Mobile-optimized: reduce animation distance and rotation on smaller screens
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const distance = isMobile ? 400 : 1000;
  const rotation = isMobile ? 60 : 180;
  const chaosStart = {
    x: (Math.random() - 0.5) * distance,
    y: (Math.random() - 0.5) * distance,
    rotate: (Math.random() - 0.5) * rotation,
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: chaosStart.x,
        y: chaosStart.y,
        rotate: chaosStart.rotate,
        scale: 0.2,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
      }}
      transition={{
        type: 'spring' as const,
        stiffness: isMobile ? 100 : 80, // Faster on mobile
        damping: isMobile ? 15 : 12,
        mass: 1.2,
        delay,
      }}
      viewport={{ once: true, margin: '-100px' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
