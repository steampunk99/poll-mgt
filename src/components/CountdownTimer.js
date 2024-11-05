import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        if (!deadline) return null;
        const targetDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) return null;

        return {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        };
      } catch (error) {
        console.error('Error calculating time:', error);
        return null;
      }
    };

    const timer = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      if (timeLeft) {
        setTimeLeft(timeLeft);
      }
    }, 1000);

    // Initial calculation
    const initialTime = calculateTimeLeft();
    if (initialTime) {
      setTimeLeft(initialTime);
    }

    return () => clearInterval(timer);
  }, [deadline]);

  if (!deadline) return <span className="flex items-center gap-1"><Clock className="h-4 w-4" />No deadline</span>;
  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Closed</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <Clock className="h-4 w-4" />
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {timeLeft.hours > 0 && `${timeLeft.hours}h `}
      {timeLeft.days === 0 && (
        <>
          {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {timeLeft.seconds}s
          </motion.span>
        </>
      )}
    </div>
  );
};

export default CountdownTimer; 