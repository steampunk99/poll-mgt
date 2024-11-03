import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { usePolls } from '@/context/PollContext';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Activity, Clock, Users2, Loader2 } from 'lucide-react';

const HeroSection = () => {
  const { activePolls, fetchActivePolls } = usePolls();

  useEffect(() => {
    const getPolls = async () => {
      await fetchActivePolls();
    };
    getPolls();
  }, []);

  const timeUntil = (deadline) => {
    if (!deadline) return 'No deadline';
    const now = new Date();
    const end = deadline.toDate();
    const diff = end - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} days left`;
    }
    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m left`;
    return 'Ending soon';
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2069&auto=format&fit=crop"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mt-[54px] mx-auto px-4 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Your Voice,{" "}
              <span className="text-primary">Your Impact</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl">
              Participate in real-time polls and make your opinion count. 
              Join thousands of others in shaping decisions that matter.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="rounded-md bg-foreground">
                <Link to="/register">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-md">
                <Link to="/polls">Browse Polls</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 max-w-xl">
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-2xl font-bold text-primary">100+</h3>
                <p className="text-sm text-muted-foreground">Active Polls</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-2xl font-bold text-primary">10k+</h3>
                <p className="text-sm text-muted-foreground">Votes Cast</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-2xl font-bold text-primary">5k+</h3>
                <p className="text-sm text-muted-foreground">Users</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Active Polls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Live Polls</h2>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {activePolls?.map((poll) => (
                <motion.div
                  key={poll.id}
                  whileHover={{ scale: 1.02 }}
                  className="transform transition-all"
                >
                  <Link to={`/poll/${poll.id}`}>
                    <Card className="bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-colors">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{poll.question}</h3>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users2 className="h-4 w-4" />
                            {poll.choices?.reduce((sum, choice) => sum + (choice.votes || 0), 0) || 0} votes
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {timeUntil(poll.deadline)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;