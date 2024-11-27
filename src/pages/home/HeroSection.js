import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { usePolls } from '@/context/PollContext';
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowRight, Activity, Clock, Users2, Loader2, Vote, TrendingUp, Award, CheckCircle2, PlusCircle, LogIn, UserPlus, History, LayoutDashboard } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const HeroSection = () => {
  const { activePolls, fetchActivePolls, loading: pollsLoading } = usePolls();
  const { user } = useUser();
  const { pollStats } = useAdmin();
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    const getPolls = async () => {
      await fetchActivePolls();
    };
    getPolls();
  }, []);

  // Update countdowns every second
  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns = {};
      activePolls?.forEach(poll => {
        if (poll.deadline) {
          const deadline = poll.deadline.toDate ? poll.deadline.toDate() : new Date(poll.deadline);
          const now = new Date();
          const diff = deadline - now;

          if (diff <= 0) {
            newCountdowns[poll.id] = { text: 'Ended', urgent: false };
            return;
          }

          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          let text = '';
          if (days > 0) {
            text = `${days}d ${hours}h ${minutes}m ${seconds}s`;
          } else if (hours > 0) {
            text = `${hours}h ${minutes}m ${seconds}s`;
          } else if (minutes > 0) {
            text = `${minutes}m ${seconds}s`;
          } else {
            text = `${seconds}s`;
          }

          newCountdowns[poll.id] = {
            text,
            urgent: days <= 2
          };
        }
      });
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [activePolls]);

  const timeUntil = (poll) => {
    return countdowns[poll.id] || { text: 'No deadline', urgent: false };
  };

  // Filter active polls and limit to 3
  const displayedPolls = activePolls
    ?.filter(poll => {
      const deadline = poll.deadline?.toDate ? poll.deadline.toDate() : new Date(poll.deadline);
      return deadline > new Date();
    })
    .slice(0, 3);

  const calculateProgress = (poll) => {
    if (!poll.choices) return { votes: 0, percentage: 0, isPopular: false };
    const totalVotes = poll.choices.reduce((sum, choice) => sum + (choice.votes || 0), 0);
    const avgVotesPerPoll = pollStats?.averageVotesPerPoll || 0;
    return {
      votes: totalVotes,
      percentage: Math.min(100, (totalVotes / (avgVotesPerPoll * 2)) * 100),
      isPopular: totalVotes > avgVotesPerPoll
    };
  };

  const renderPollCard = (poll, index) => {
    const { votes, percentage, isPopular } = calculateProgress(poll);
    const { text: timeLeft, urgent } = timeUntil(poll);
    
    return (
      <motion.div
        key={poll.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className="group relative hover:shadow-md transition-shadow">
          <CardHeader className="py-3 px-4">
            <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-base flex-1 line-clamp-1">{poll.title || poll.question}</CardTitle>
              <div className="flex gap-1 flex-shrink-0">
                {isPopular && (
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                    <Award className="h-3 w-3" />
                  </Badge>
                )}
                {urgent && (
                  <Badge variant="destructive" className="animate-pulse">
                    <Clock className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-2 px-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center text-xs">
                  <Vote className="h-3 w-3 mr-1" /> {votes} votes
                </span>
                <span className={cn(
                  "font-mono text-xs",
                  urgent && "text-destructive font-medium"
                )}>{timeLeft}</span>
              </div>
              <Progress value={percentage} className="h-1.5" />
            </div>
          </CardContent>
          <CardFooter className="py-2 px-4">
            <Button variant="ghost" size="sm" className="w-full h-8 group-hover:bg-primary/5" asChild>
              <Link to={user ? `/dashboard/poll/${poll.id}` : `/login?redirect=/dashboard/poll/${poll.id}`}>
                Vote <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  return (
    <section className="relative h-screen bg-background">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-[url('https://images.pexels.com/photos/28056127/pexels-photo-28056127/free-photo-of-a-book-and-an-orange-on-a-blanket-on-the-beach.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
        style={{
          backgroundSize: '730px 730px',
          opacity: 0.6
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-background to-background" />
      
      <div className="container mx-auto px-4 relative py-8">
        <div className="flex flex-col h-full gap-8">
          {/* Top Section with Welcome Text */}
          <div className="flex justify-center text-center">
            <div className="relative mt-[100px] max-w-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary/10 rounded-full blur-2xl"
              />
             
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-2">
            {/* Actions */}
            <div className="flex justify-center">
              <div className="bg-card/50 backdrop-blur max-w-md w-full">
                
              </div>
            </div>

            {/* Polls Section */}
            <h2 className="text-2xl max-w-2xl mx-auto font-bold mt-8">Currently Active Polls</h2>
            <div className="bg-card/50 backdrop-blur rounded-lg border p-6">

          
              <Tabs defaultValue="active" className="w-full">
                <div className="flex justify-between items-center mb-6">
                  <TabsList>
                    <TabsTrigger value="active">Active Polls</TabsTrigger>
                    <TabsTrigger value="urgent">Ending Soon</TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard/polls">
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <ScrollArea className="w-full">
                  <TabsContent value="active" className="mt-0">
                    <AnimatePresence mode="wait">
                      {pollsLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex justify-center py-8"
                        >
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </motion.div>
                      ) : displayedPolls?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                          {displayedPolls.map((poll, index) => renderPollCard(poll, index))}
                        </div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-12"
                        >
                          <Vote className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p className="text-muted-foreground text-lg mb-4">No active polls at the moment</p>
                          {user?.role === 'admin' && (
                            <Button variant="outline" asChild>
                              <Link to="/dashboard/createpolls">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create New Poll
                              </Link>
                            </Button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="urgent" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                      {displayedPolls
                        ?.filter(poll => timeUntil(poll).urgent)
                        .map((poll, index) => renderPollCard(poll, index))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;