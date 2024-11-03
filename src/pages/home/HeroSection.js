import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { usePolls } from '@/context/PollContext';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Activity, Clock, Users2, Loader2 } from 'lucide-react';

const HeroSection = () => {
  const { activePolls, fetchActivePolls } = usePolls();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPolls = async () => {
      setIsLoading(true);
      try {
        await fetchActivePolls();
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getPolls();
  }, []);

  console.log('Active Polls in Hero render:', activePolls);

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
    <div className="relative min-h-screen bg-gradient-to-b from-background to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      <div className="relative container mx-auto px-4 pt-24 pb-16">
        {/* Main Content */}
        <div className="text-center max-w-3xl mx-auto mb-16 mt-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold mb-6"
          >
            Your Voice,{" "}
            <span className="text-primary">Your Impact</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-8"
          >
            Participate in real-time polls and make your opinion count. 
            Join thousands of others in shaping decisions that matter.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 justify-center"
          >
            <Button asChild size="lg" className="bg-foreground">
              <Link to="/register">Create Account <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard/polls">View All Polls</Link>
            </Button>
          </motion.div>
        </div>

        {/* Active Polls Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Trending Polls</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/dashboard/polls">View All</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : Array.isArray(activePolls) && activePolls.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePolls.map((poll) => (
                <motion.div
                  key={poll.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to={`/dashboard/poll/${poll.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all border-foreground/20">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                            {poll.question}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users2 className="h-4 w-4" />
                            <span>
                              {poll.choices?.reduce((sum, choice) => sum + (choice.votes || 0), 0) || 0} votes
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{timeUntil(poll.deadline)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No active polls available at the moment.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;