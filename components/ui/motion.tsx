"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function MotionFade({
  children,
  delay = 0,
  className
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function MotionStagger({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        reduced
          ? undefined
          : {
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } }
            }
      }
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={{ once: true, margin: "-20px" }}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={
        reduced
          ? undefined
          : {
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } }
            }
      }
    >
      {children}
    </motion.div>
  );
}
