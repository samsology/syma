'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

/** Keep Framer Motion animations in the marketing tree aligned with OS preferences. */
export function MarketingMotion({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
