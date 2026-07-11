import { motion } from "framer-motion";
import type { ReactNode } from "react";

const variants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
};

const transition = {
  duration: 0.28,
  ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
};

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
