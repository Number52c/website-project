import { motion } from 'framer-motion';
import { Video as LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  label?: string;
  color?: 'gold' | 'blue' | 'green';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const colorMap = {
  gold: 'bg-[#C9A84C] hover:bg-[#D4B85F] text-[#0D1B3E]',
  blue: 'bg-blue-500 hover:bg-blue-600 text-white',
  green: 'bg-green-500 hover:bg-green-600 text-white',
};

const positionMap = {
  'bottom-right': 'bottom-8 right-8',
  'bottom-left': 'bottom-8 left-8',
  'top-right': 'top-8 right-8',
  'top-left': 'top-8 left-8',
};

export default function FloatingActionButton({
  icon: Icon,
  onClick,
  label,
  color = 'gold',
  position = 'bottom-right',
}: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`fixed ${positionMap[position]} z-50`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Ripple effect */}
      {isHovered && (
        <>
          <motion.div
            className={`absolute inset-0 rounded-full ${colorMap[color]} opacity-30`}
            initial={{ scale: 0 }}
            animate={{ scale: 2 }}
            transition={{ duration: 0.6 }}
          />
          <motion.div
            className={`absolute inset-0 rounded-full ${colorMap[color]} opacity-20`}
            initial={{ scale: 0 }}
            animate={{ scale: 3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
        </>
      )}

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className={`relative w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${colorMap[color]}`}
        title={label}
      >
        <Icon size={24} />
      </motion.button>

      {/* Label tooltip */}
      {label && isHovered && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
        >
          {label}
        </motion.div>
      )}
    </motion.div>
  );
}
