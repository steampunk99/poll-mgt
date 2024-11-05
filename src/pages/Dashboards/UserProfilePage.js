import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { usePolls } from '@/context/PollContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User, Mail, Calendar, Vote, BarChart3, Settings,
  Clock, CheckCircle2, AlertTriangle, Activity
} from "lucide-react";
import { format } from 'date-fns';

export default function VoterProfile() {
  const { user, updateUserProfile } = useUser();
  const { polls, getUserPolls } = usePolls();
  const [userPolls, setUserPolls] = useState([]);
  const [votingStats, setVotingStats] = useState({
    totalVotes: 0,
    activePollsVoted: 0,
    closedPollsVoted: 0,
  });

  useEffect(() => {
    const loadUserVotingData = async () => {
      if (user?.uid) {
        try {
          const votedPolls = await getUserPolls(user.uid);
          setUserPolls(votedPolls);

          // Calculate voting statistics
          const stats = {
            totalVotes: votedPolls.length,
            activePollsVoted: votedPolls.filter(poll => !poll.closedAt).length,
            closedPollsVoted: votedPolls.filter(poll => poll.closedAt).length,
          };
          setVotingStats(stats);
        } catch (error) {
          console.error("Error loading voting data:", error);
        }
      }
    };

    loadUserVotingData();
  }, [user, getUserPolls]);

  const joinDate = user?.metadata?.creationTime 
    ? format(new Date(user.metadata.creationTime), 'MMMM dd, yyyy')
    : 'N/A';

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{user?.displayName || 'Voter'}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Voter Account
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                Joined {joinDate}
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column - Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-4 space-y-6"
        >
          {/* Voting Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Voting Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Votes Cast</span>
                  <span className="font-medium">{votingStats.totalVotes}</span>
                </div>
                <Progress value={(votingStats.totalVotes / Math.max(polls.length, 1)) * 100} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Active Polls</span>
                  <p className="text-2xl font-bold text-primary">
                    {votingStats.activePollsVoted}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Closed Polls</span>
                  <p className="text-2xl font-bold">
                    {votingStats.closedPollsVoted}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Email</span>
                <p className="font-medium">{user?.email}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <p className="font-medium">{joinDate}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Voting History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Recent Voting Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userPolls.length > 0 ? (
                <div className="space-y-4">
                  {userPolls.map((poll) => (
                    <div
                      key={poll.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h3 className="font-medium">{poll.question}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(poll.votedAt?.toDate() || new Date(), 'PPp')}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={poll.closedAt ? 'text-muted-foreground' : 'text-primary'}
                        >
                          {poll.closedAt ? 'Closed' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't voted in any polls yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
