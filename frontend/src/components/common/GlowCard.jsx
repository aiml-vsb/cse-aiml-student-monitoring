import { motion } from "framer-motion";

export default function GlowCard({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3 }}
      className={`neu-card p-5 md:p-6 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}