import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const ErrorPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [showConfetti]);



  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl md:text-2xl text-foreground mb-8">Oops! Looks like you've wandered off the map.</p>
      </motion.div>

   

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-foreground mb-4">Please try one of these links:</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild variant="secondary">
            <Link to="/">Home</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/aboutus">About</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/contactus">Contact</Link>
          </Button>
        </div>
      </motion.div>

      {showConfetti && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-8"
        >
          <p className="text-foreground text-lg">You found our hidden confetti! 🎉</p>
        </motion.div>
      )}
    </div>
  );
};

export default ErrorPage;