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
    return <span className="text-red-400 font-semibold">Expired</span>;
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 items-center">
      {units.map((unit, i) => (
        <motion.div
          key={unit.label}
          className="flex flex-col items-center bg-white/5 rounded-lg px-3 py-2 min-w-[60px] border border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <span className="text-2xl font-bold text-white tabular-nums">
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] text-dark-400 uppercase">{unit.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
