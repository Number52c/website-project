import { motion } from 'framer-motion';
import { useState } from 'react';
import { Video as LucideIcon } from 'lucide-react';

interface AnimatedKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: 'gold' | 'green' | 'blue' | 'red';
  trend?: { value: number; isPositive: boolean };
  onClick?: () => void;
}

const colorMap = {
  gold: 'bg-gradient-to-br from-[#C9A84C]/15 to-[#C9A84C]/5 border-[#C9A84C]/50 text-[#e6c200] shadow-lg shadow-[#C9A84C]/30',
  green: 'bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/30',
  blue: 'bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/30',
  red: 'bg-gradient-to-br from-pink-500/15 to-pink-500/5 border-pink-500/50 text-pink-300 shadow-lg shadow-pink-500/30',
};

export default function AnimatedKPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'gold',
  trend,
  onClick,
}: AnimatedKPICardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative p-4 sm:p-6 rounded-xl border backdrop-blur-md cursor-pointer transition-all duration-300 overflow-hidden ${colorMap[color]}`}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        animate={isHovered ? { opacity: 0.1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(circle at center, ${
            color === 'gold'
              ? '#C9A84C'
              : color === 'green'
                ? '#22c55e'
                : color === 'blue'
                  ? '#3b82f6'
                  : '#ef4444'
          }, transparent)`,
        }}
      />

      <div className="relative z-10">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs sm:text-sm font-bold tracking-widest uppercase opacity-70 mb-1">
              {title}
            </p>
          </div>
          {Icon && (
            <motion.div
              animate={isHovered ? { rotate: 12, scale: 1.1 } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Icon size={20} className="opacity-60" />
            </motion.div>
          )}
        </div>

        {/* Value with animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-2"
        >
          <div className="text-2xl sm:text-3xl font-bold">{value}</div>
        </motion.div>

        {/* Subtitle and trend */}
        <div className="flex items-center justify-between">
          {subtitle && <p className="text-xs sm:text-sm opacity-70">{subtitle}</p>}
          {trend && (
            <motion.div
              animate={isHovered ? { x: 4 } : { x: 0 }}
              className={`text-xs font-semibold ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </motion.div>
          )}
        </div>
      </div>

      {/* Hover indicator line */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent"
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%' }}
      />
    </motion.div>
  );
}
