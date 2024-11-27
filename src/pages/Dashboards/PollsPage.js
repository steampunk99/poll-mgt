import React, { useEffect, useState, useMemo } from 'react';
import { usePolls } from '@/context/PollContext';
import { useUser } from '@/context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Calendar, Users2, ChevronDown, ChevronUp, 
  Search, PlusCircle, RefreshCw, BarChart3, Clock 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timestamp } from 'firebase/firestore';


export default function PollsPage() {
  const { polls, fetchPolls, loading: contextLoading } = usePolls();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [selectedTab, setSelectedTab] = useState('active');
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const calculateTotalVotes = (poll) => {
    try {
      if (!poll?.choices) return 0;
      return poll.choices.reduce((sum, choice) => sum + (choice.votes || 0), 0);
    } catch (error) {
      console.error('Error calculating votes:', error);
      return 0;
    }
  };

  const formatDaysLeft = (timestamp) => {
    try {
      if (!timestamp) return 'No deadline';
      
      let endDate;
      // Check if it's a Firestore Timestamp
      if (timestamp instanceof Timestamp) {
        endDate = timestamp.toDate();
      } 
      // Check if it has toDate method (another way to check for Firestore Timestamp)
      else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        endDate = timestamp.toDate();
      }
      // Handle regular Date object or timestamp
      else {
        endDate = new Date(timestamp);
      }

      const today = new Date();
      const timeDiff = endDate - today;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysLeft < 0) return 'Closed';
      if (daysLeft > 30) return `${Math.floor(daysLeft / 30)}mo left`;
      if (daysLeft > 0) return `${daysLeft}d left`;
      return 'Closing today';
    } catch (error) {
      console.error('Error formatting deadline:', error, timestamp);
      return 'Invalid deadline';
    }
  };

  const filteredPolls = useMemo(() => {
    try {
      let filtered = polls.filter(poll => {
        const searchLower = searchTerm.toLowerCase();
        return (
          poll.question.toLowerCase().includes(searchLower) ||
          poll.choices.some(choice => 
            choice.text.toLowerCase().includes(searchLower)
          )
        );
      });

      return filtered.sort((a, b) => {
        if (sortBy === 'deadline') {
          let dateA, dateB;
          
          try {
            dateA = a.deadline?.toDate?.() || new Date(a.deadline || 0);
          } catch (error) {
            dateA = new Date(0);
          }
          
          try {
            dateB = b.deadline?.toDate?.() || new Date(b.deadline || 0);
          } catch (error) {
            dateB = new Date(0);
          }

          return dateB - dateA;
        } else if (sortBy === 'votes') {
          const votesA = calculateTotalVotes(a);
          const votesB = calculateTotalVotes(b);
          return votesB - votesA;
        }
        return 0;
      });
    } catch (error) {
      console.error('Error filtering polls:', error);
      return [];
    }
  }, [polls, searchTerm, sortBy]);

  const activePolls = useMemo(() => 
    filteredPolls.filter(poll => {
      try {
        return formatDaysLeft(poll.deadline) !== 'Closed';
      } catch (error) {
        console.error('Error filtering active polls:', error);
        return false;
      }
    }),
  [filteredPolls]);

  const closedPolls = useMemo(() => 
    filteredPolls.filter(poll => {
      try {
        return formatDaysLeft(poll.deadline) === 'Closed';
      } catch (error) {
        console.error('Error filtering closed polls:', error);
        return false;
      }
    }),
  [filteredPolls]);

  const PollCard = ({ poll }) => {
    const totalVotes = calculateTotalVotes(poll);
    const hasVoted = poll.voters?.some(voter => voter.userId === user?.uid);
    const userVote = poll.voters?.find(voter => voter.userId === user?.uid);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full"
      >
        <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20 bg-gradient-to-b from-card/50 to-card">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5 flex-1">
                <Link to={`/dashboard/poll/${poll.id}`}>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {poll.question}
                  </CardTitle>
                </Link>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary animate-pulse" />
                    {formatDaysLeft(poll.deadline)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users2 className="h-4 w-4 text-primary" />
                    {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                  </span>
                  {hasVoted && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      You voted
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {poll.choices.map((choice, index) => {
                const votes = choice.votes || 0;
                const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                const isUserVote = userVote?.choiceId === choice.id;

                return (
                  <motion.div 
                    key={index} 
                    className="space-y-1.5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium">{choice.text}</span>
                        {isUserVote && (
                          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                            Your vote
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground min-w-[4rem] text-right font-medium">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`absolute h-2 rounded-full ${
                          isUserVote ? 'bg-primary' : 'bg-primary/30'
                        }`}
                      />
                      <div className="h-2 w-full bg-muted rounded-full" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="hover:bg-primary/5 hover:text-primary border-primary/20"
              >
                <Link to={`/dashboard/poll/${poll.id}`}>
                  View Details
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className=" px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Polls</h1>
          <p className="text-muted-foreground">
            View and participate in community polls
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => fetchPolls()}
            className="flex-1 sm:flex-initial hover:bg-primary/5 hover:text-primary border-primary/20"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {isAdmin && (
            <Button 
              onClick={() => navigate('/dashboard/create-poll')}
              className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Poll
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-8 border-primary/20 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search polls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 border-primary/20 focus:ring-primary/20 focus:border-primary/30"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] border-primary/20">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">Sort by Deadline</SelectItem>
                <SelectItem value="votes">Sort by Votes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            Active Polls
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
              {activePolls.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="closed"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            Closed Polls
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
              {closedPolls.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="active" className="space-y-6">
            {activePolls.length > 0 ? (
              activePolls.map(poll => <PollCard key={poll.id} poll={poll} />)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No active polls found{searchTerm && ' matching your search'}</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="closed" className="space-y-6">
            {closedPolls.length > 0 ? (
              closedPolls.map(poll => <PollCard key={poll.id} poll={poll} />)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No closed polls found{searchTerm && ' matching your search'}</p>
              </div>
            )}
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}