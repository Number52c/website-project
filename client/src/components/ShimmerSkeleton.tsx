import { motion } from 'framer-motion';

interface ShimmerSkeletonProps {
  width?: string;
  height?: string;
  count?: number;
  circle?: boolean;
  className?: string;
}

export default function ShimmerSkeleton({
  width = 'w-full',
  height = 'h-4',
  count = 3,
  circle = false,
  className = '',
}: ShimmerSkeletonProps) {
  const shimmerVariants = {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear' as const,
      },
    },
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          variants={shimmerVariants}
          animate="animate"
          className={`${width} ${height} ${circle ? 'rounded-full' : 'rounded-lg'} bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700`}
          style={{
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </div>
  );
}
