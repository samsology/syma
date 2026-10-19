import type { Transition, Variants } from 'framer-motion';

/**
 * Syma Tech Solutions — Reusable Motion System
 * Inspired by Apple's fluid-interface principles:
 * - Spring-driven physics
 * - Direct tactile manipulation
 * - Velocity-aware transitions
 * - Graceful reduced-motion alternatives
 */

// 1. Calibrated Spring Transitions
export const springTactile: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
  mass: 0.8,
};

export const springCard: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 26,
  mass: 0.9,
};

export const springSmooth: Transition = {
  type: 'spring',
  stiffness: 240,
  damping: 28,
  mass: 1.0,
};

export const springDrawer: Transition = {
  type: 'spring',
  stiffness: 360,
  damping: 34,
  mass: 1.0,
};

// 2. Viewport Reveal Defaults
export const viewportDefault = {
  once: true,
  margin: '-40px',
} as const;

// 3. Reusable Animation Variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
};

export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springSmooth,
  },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

/**
 * Creates custom stagger container variants with specified timings.
 */
export function createStaggerContainer(staggerDelay = 0.08, delayChildren = 0.05): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

// 4. Interactive Gesture Presets
export const buttonTapTransition = {
  whileTap: { scale: 0.98 },
  transition: springTactile,
};

export const cardHoverTransition = {
  whileHover: { y: -4 },
  transition: springCard,
};
