import { motion } from 'framer-motion';
import { useState } from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AnimatedChartProps {
  data: ChartDataPoint[];
  maxValue?: number;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
}

export default function AnimatedChart({
  data,
  maxValue,
  height = 300,
  showLabels = true,
  showValues = true,
  animated = true,
}: AnimatedChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const max = maxValue || Math.max(...data.map((d) => d.value));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const barVariants = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: {
      scaleY: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className="w-full"
      initial={animated ? 'hidden' : 'visible'}
      animate="visible"
      variants={containerVariants}
    >
      <div
        className="flex items-flex-end justify-around gap-4 px-4"
        style={{ height: `${height}px` }}
      >
        {data.map((item, index) => (
          <motion.div
            key={item.label}
            className="flex flex-col items-center flex-1 group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            variants={barVariants}
          >
            {/* Bar */}
            <motion.div
              className="w-full rounded-t-lg transition-all duration-300"
              style={{
                height: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || '#C9A84C',
              }}
              animate={
                hoveredIndex === index
                  ? { scaleY: 1.05, filter: 'brightness(1.2)' }
                  : { scaleY: 1, filter: 'brightness(1)' }
              }
              transition={{ duration: 0.2 }}
            />

            {/* Value label on hover */}
            {showValues && (
              <motion.div
                className="text-xs font-bold mt-2 text-[#C9A84C]"
                animate={hoveredIndex === index ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 4 } as any}
                transition={{ duration: 0.2 }}
              >
                {item.value}
              </motion.div>
            )}

            {/* Category label */}
            {showLabels && (
              <motion.div
                className="text-xs font-semibold mt-2 text-center text-[#6B6B6B] group-hover:text-[#0D1B3E] transition-colors"
                animate={hoveredIndex === index ? { scale: 1.05 } : { scale: 1 }}
              >
                {item.label}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
