import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Helper to detect mobile/touch devices
const isMobileDevice = () => typeof window !== 'undefined' && (
  window.innerWidth < 768 || 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0
);

/**
 * Fade in animation container
 */
export const FadeInContainer = ({
  children,
  delay = 0,
  duration = 0.6,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration, delay }}
    viewport={{ once: true, margin: '-100px' }}
  >
    {children}
  </motion.div>
);

/**
 * Staggered container for animating children
 */
export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  staggerDelay?: number;
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-100px' }}
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
  >
    {children}
  </motion.div>
);

/**
 * Staggered item (use inside StaggerContainer)
 */
export const StaggerItem = ({ children }: { children: ReactNode }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
  >
    {children}
  </motion.div>
);

/**
 * Scale on hover animation (disabled on touch devices for better mobile UX)
 */
export const ScaleOnHover = ({
  children,
  scale = 1.05,
}: {
  children: ReactNode;
  scale?: number;
}) => {
  const isTouch = isMobileDevice();
  return (
    <motion.div
      whileHover={!isTouch ? { scale } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Floating animation (reduced on mobile for performance)
 */
export const FloatingElement = ({
  children,
  duration = 3,
}: {
  children: ReactNode;
  duration?: number;
}) => {
  const isTouch = isMobileDevice();
  return (
    <motion.div
      animate={{ y: [0, isTouch ? -10 : -20, 0] }}
      transition={{
        duration: isTouch ? duration * 1.5 : duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Slide in from left
 */
export const SlideInLeft = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true, margin: '-100px' }}
  >
    {children}
  </motion.div>
);

/**
 * Slide in from right
 */
export const SlideInRight = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true, margin: '-100px' }}
  >
    {children}
  </motion.div>
);

/**
 * Rotate and fade in (reduced rotation on mobile)
 */
export const RotateInFade = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => {
  const isTouch = isMobileDevice();
  return (
    <motion.div
      initial={{ opacity: 0, rotate: isTouch ? -5 : -10 }}
      whileInView={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, margin: '-100px' }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Pulse animation (reduced on mobile)
 */
export const PulseElement = ({
  children,
  duration = 2,
}: {
  children: ReactNode;
  duration?: number;
}) => {
  const isTouch = isMobileDevice();
  return (
    <motion.div
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{
        duration: isTouch ? duration * 1.5 : duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Expandable card with animation
 */
export const ExpandableCard = ({
  children,
  isExpanded,
}: {
  children: ReactNode;
  isExpanded: boolean;
}) => (
  <motion.div
    animate={{
      height: isExpanded ? 'auto' : '0',
      opacity: isExpanded ? 1 : 0,
    }}
    transition={{ duration: 0.3 }}
    style={{ overflow: 'hidden' }}
  >
    {children}
  </motion.div>
);
