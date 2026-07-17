import { Variants } from 'framer-motion';

// Spring physics presets for micro-animations
export const transitionSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
};

export const transitionSmooth = {
  type: 'tween' as const,
  ease: [0.16, 1, 0.3, 1] as const, // easeOutExpo
  duration: 0.6,
};

// Animation Variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

export const slideUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitionSmooth
  }
};

export const slideDown: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitionSmooth
  }
};

export const scaleUp: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    }
  }
};

export const staggerContainer = (staggerChildren = 0.15, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    }
  }
});

export const staggerItem: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitionSpring
  }
};

// Hover Presets
export const hoverScale = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 }
};

export const hoverGlow = {
  hover: {
    boxShadow: '0 0 15px rgba(22, 199, 212, 0.4)',
    borderColor: '#16C7D4',
    y: -2,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};
