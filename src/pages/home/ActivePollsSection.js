import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Vote, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePolls } from '@/context/PollContext';
import { cn } from "@/lib/utils";
import { useUser } from '@/context/UserContext';

const ActivePollsSection = () => {
  const { activePolls, loading, error } = usePolls();
  const { user } = useUser();

  const formatDaysLeft = (deadline) => {
    try {
      if (!deadline) return { text: 'No deadline', isExpired: true };
      
      // Convert to Date object if it's a Firebase timestamp
      const endDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
      const today = new Date();
      const timeDiff = endDate - today;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 0) return { text: 'Closed', isExpired: true };
      if (daysLeft === 1) return { text: '1 day left', isExpired: false };
      return { text: `${daysLeft} days left`, isExpired: false };
    } catch (error) {
      console.error('Error formatting deadline:', error);
      return { text: 'Invalid date', isExpired: true };
    }
  };

  if (error) {
    return (
      <section className="py-20 bg-secondary px-12">
        <div className="container mx-auto px-8">
          <Card className="bg-destructive/10 text-destructive">
            <CardContent className="p-6">
              <p className="text-center">Error loading polls. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary px-12">
      <div className="container mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Active Polls</h2>
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">Participate Now</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {activePolls?.length > 0 ? (
                    activePolls.map((poll) => {
                      const { text: timeLeft, isExpired } = formatDaysLeft(poll.deadline);
                      return (
                        <motion.div 
                          key={poll.id} 
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border",
                            isExpired 
                              ? "bg-muted/50 border-muted" 
                              : "hover:bg-accent border-transparent hover:border-accent"
                          )}
                          whileHover={{ scale: isExpired ? 1 : 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={cn(
                              "p-2 rounded-full",
                              isExpired ? "bg-muted" : "bg-primary/10"
                            )}>
                              <Vote className={cn(
                                "h-5 w-5",
                                isExpired ? "text-muted-foreground" : "text-primary"
                              )} />
                            </div>
                            <div className={cn(
                              "flex-1",
                              isExpired && "text-muted-foreground"
                            )}>
                              <h3 className="font-medium flex items-center gap-2">
                                {poll.title || poll.question}
                                {isExpired && (
                                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Closed
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>
                                  {poll.choices?.reduce((sum, choice) => sum + (choice.votes || 0), 0) || 0} votes
                                </span>
                                <span className="text-muted-foreground/50">•</span>
                                <span className="inline-flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {timeLeft}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end ml-4">
                            <Button 
                              variant={isExpired ? "secondary" : "outline"} 
                              size="sm" 
                              asChild
                              className={cn(
                                isExpired && "opacity-50 cursor-not-allowed"
                              )}
                              disabled={isExpired}
                            >
                              <Link to={user ? `/dashboard/poll/${poll.id}` : `/login?redirect=/dashboard/poll/${poll.id}`}>
                                {isExpired ? 'View Results' : 'Vote Now'}
                              </Link>
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No active polls at the moment.</p>
                  )}
                </div>
              )}
              {!loading && activePolls?.length > 0 && (
                <div className="flex justify-center mt-6">
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/polls">View All Polls</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ActivePollsSection;