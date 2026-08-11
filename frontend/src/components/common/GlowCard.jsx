import { motion } from "framer-motion";

export default function GlowCard({ children, className = "", glowColor = "primary", delay = 0 }) {
  const glowClasses = {
    primary: "hover:shadow-glow",
    blue: "hover:shadow-glow-blue",
    green: "hover:shadow-glow-green",
    red: "hover:shadow-glow-red",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`glass-card p-6 transition-all duration-300 ${glowClasses[glowColor]} ${className}`}
    >
      {children}
    </motion.div>
  );
}