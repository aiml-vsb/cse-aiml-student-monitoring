import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Countdown({ targetDate, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (!newTimeLeft && onExpire) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <span className="text-red-500 font-semibold text-sm">Expired</span>;
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-2.5 items-center">
      {units.map((unit, i) => (
        <motion.div
          key={unit.label}
          className="flex flex-col items-center bg-[#e0e5ec] rounded-xl px-3 py-2 min-w-[58px] shadow-neu-flat-sm border border-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <span className="text-xl font-extrabold text-indigo-600 font-mono tabular-nums">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-[9px] font-bold text-dark-400 uppercase tracking-wider">{unit.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
