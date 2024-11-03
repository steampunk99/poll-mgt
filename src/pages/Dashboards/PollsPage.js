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

export default function PollsPage() {
  const { polls, fetchPolls, loading: contextLoading } = usePolls();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const [selectedTab, setSelectedTab] = useState('active');
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const calculateTotalVotes = (poll) => {
    if (!poll?.choices) return 0;
    return poll.choices.reduce((sum, choice) => sum + (choice.votes || 0), 0);
  };

  const formatDaysLeft = (timestamp) => {
    if (!timestamp) return 'No deadline';
    const endDate = timestamp.toDate();
    const today = new Date();
    const timeDiff = endDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysLeft > 30) return `${Math.floor(daysLeft / 30)}mo left`;
    if (daysLeft > 0) return `${daysLeft}d left`;
    return 'Closed';
  };

  const filteredPolls = useMemo(() => {
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
        const dateA = a.deadline?.toDate() || new Date(0);
        const dateB = b.deadline?.toDate() || new Date(0);
        return dateB - dateA;
      } else if (sortBy === 'votes') {
        const votesA = calculateTotalVotes(a);
        const votesB = calculateTotalVotes(b);
        return votesB - votesA;
      }
      return 0;
    });
  }, [polls, searchTerm, sortBy]);

  const activePolls = useMemo(() => 
    filteredPolls.filter(poll => formatDaysLeft(poll.deadline) !== 'Closed'),
  [filteredPolls]);

  const closedPolls = useMemo(() => 
    filteredPolls.filter(poll => formatDaysLeft(poll.deadline) === 'Closed'),
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
        <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-gradient-to-b from-card/50 to-card">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1 flex-1">
                <Link to={`/dashboard/poll/${poll.id}`}>
                  <CardTitle className="text-xl hover:text-primary transition-colors">
                    {poll.question}
                  </CardTitle>
                </Link>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {formatDaysLeft(poll.deadline)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users2 className="h-4 w-4 text-primary" />
                    {totalVotes} votes
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
            <div className="space-y-3">
              {poll.choices.map((choice, index) => {
                const votes = choice.votes || 0;
                const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                const isUserVote = userVote?.choiceId === choice.id;

                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium">{choice.text}</span>
                        {isUserVote && (
                          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                            Your vote
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground min-w-[4rem] text-right">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${isUserVote ? 'bg-primary' : 'bg-muted'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="hover:bg-primary/5 hover:text-primary"
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
    <div className="container max-w-5xl mx-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Polls</h1>
          <p className="text-muted-foreground">
            View and participate in active polls
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => fetchPolls()}
            className="hover:bg-primary/5 hover:text-primary"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {isAdmin && (
            <Button 
              onClick={() => navigate('/dashboard/create-poll')}
              className="bg-primary hover:bg-primary/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Poll
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-8 border-foreground/20">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search polls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-foreground/20 focus:ring-primary/20"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] border-foreground/20">
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
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Active Polls
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
              {activePolls.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="closed"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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