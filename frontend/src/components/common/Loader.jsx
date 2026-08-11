import { motion } from "framer-motion";

export default function Loader({ size = "md", text = "Loading..." }) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-4",
    lg: "h-14 w-14 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-t-transparent border-primary-500 border-r-secondary-500`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && <p className="text-dark-400 text-sm animate-pulse">{text}</p>}
    </div>
  );
}