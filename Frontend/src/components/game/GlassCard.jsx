import React from "react";
import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", hover = false, ...rest }) {
  const Comp = hover ? motion.div : "div";
  const props = hover
    ? { whileHover: { y: -3, transition: { duration: 0.2 } } }
    : {};
  return (
    <Comp
      {...props}
      {...rest}
      className={`glass rounded-2xl ${className}`}
    >
      {children}
    </Comp>
  );
}