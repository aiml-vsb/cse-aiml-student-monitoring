import { motion } from "framer-motion";

export default function Loader({ size = "md", text = "Loading..." }) {
  const sizeMap = {
    sm: { container: "w-8 h-8", spinner: "w-4 h-4 border-2" },
    md: { container: "w-12 h-12", spinner: "w-6 h-6 border-2" },
    lg: { container: "w-16 h-16", spinner: "w-8 h-8 border-[3px]" },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <div className={`${current.container} rounded-2xl bg-[#e0e5ec] shadow-neu-flat flex items-center justify-center border border-white/60 shrink-0`}>
        <motion.div
          className={`${current.spinner} rounded-full border-indigo-600/20 border-t-indigo-600 border-r-indigo-500`}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {text && (
        <p className="text-dark-500 font-bold text-xs tracking-wider uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}