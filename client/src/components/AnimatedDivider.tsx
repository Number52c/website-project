import { motion } from 'framer-motion';

interface AnimatedDividerProps {
  variant?: 'wave' | 'diagonal' | 'curve' | 'zigzag';
  color?: string;
  height?: number;
  animated?: boolean;
}

export default function AnimatedDivider({
  variant = 'wave',
  color = '#C9A84C',
  height = 60,
  animated = true,
}: AnimatedDividerProps) {
  const paths = {
    wave: `M0,${height / 2} Q${height / 2},0 ${height},${height / 2} T${height * 2},${height / 2}`,
    diagonal: `M0,0 L${height},${height} L${height * 2},0`,
    curve: `M0,${height} Q${height / 2},0 ${height},${height}`,
    zigzag: `M0,${height / 2} L${height / 4},0 L${height / 2},${height / 2} L${height * 3 / 4},0 L${height},${height / 2}`,
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <motion.svg
      viewBox={`0 0 ${height * 2} ${height}`}
      className="w-full h-auto"
      initial={animated ? 'hidden' : 'visible'}
      whileInView="visible"
      viewport={{ once: true }}
      variants={pathVariants}
    >
      <motion.path
        d={paths[variant]}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={pathVariants}
      />
    </motion.svg>
  );
}
