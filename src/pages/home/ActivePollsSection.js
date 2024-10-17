import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Vote, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePolls } from '@/context/PollContext';

const ActivePollsSection = () => {
  const { activePolls, loading, error } = usePolls();

  const formatDaysLeft = (timestamp) => {
    if (!timestamp) return 'No deadline';
    const endDate = timestamp.toDate();
    const today = new Date();
    const timeDiff = endDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `${daysLeft} day(s) left` : 'Closed';
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
                  activePolls.map((poll) => (
                    <motion.div 
                      key={poll.id} 
                      className="flex items-center justify-between p-4 hover:bg-accent rounded-lg"
                    >
                      <div className="flex items-center">
                        <Vote className="h-5 w-5 text-primary" />
                        <span className="ml-3 block text-sm font-medium">
                          {poll.question || poll.title}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground mb-1">
                          {formatDaysLeft(poll.deadline)}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/dashboard/poll/${poll.id}`}>
                            Vote Now
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No active polls at the moment.</p>
                )}
              </div>
            )}
            {!loading && activePolls?.length > 0 && (
              <Button variant="link" asChild className="mt-4">
                <Link to="/dashboard/polls">View All Polls</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </section>
  );
};

export default ActivePollsSection;