import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * Hook for parallax scroll effect
 * Usage: const { ref, style } = useParallax(0.5);
 */
export function useParallax(speed = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Only calculate parallax if element is in view
      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        const scrolled = window.scrollY;
        const elementOffset = ref.current.offsetTop;
        setOffset((scrolled - elementOffset) * speed);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return {
    ref,
    style: {
      transform: `translateY(${offset}px)`,
    },
  };
}

/**
 * Hook for fade-in animation on scroll
 * Usage: const { ref, inView } = useFadeInOnScroll();
 */
export function useFadeInOnScroll(threshold = 0.1) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: true,
  });

  return { ref, inView };
}

/**
 * Hook for counting animation
 * Usage: const displayValue = useCountUp(1000, 1000, inView);
 */
export function useCountUp(
  target: number,
  duration: number = 2000,
  shouldCount: boolean = true
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldCount) return;

    let startTime: number;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [target, duration, shouldCount]);

  return count;
}

/**
 * Hook for staggered animations
 * Usage: const delays = useStaggeredDelay(5, 100);
 */
export function useStaggeredDelay(count: number, delayPerItem: number = 100) {
  return Array.from({ length: count }, (_, i) => i * delayPerItem);
}

/**
 * Hook for mouse tracking parallax effect
 * Usage: const { ref, style } = useMouseParallax();
 */
export function useMouseParallax(intensity = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = (e.clientX - centerX) / intensity;
      const y = (e.clientY - centerY) / intensity;

      setOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [intensity]);

  return {
    ref,
    style: {
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      transition: 'transform 0.3s ease-out',
    },
  };
}
