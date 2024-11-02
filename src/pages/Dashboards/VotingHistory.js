import React, { useEffect, useState } from 'react';
import { usePolls } from '@/context/PollContext';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Users, CheckCircle2, Trash2, Edit, Lock, AlertTriangle, BarChart2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VotingHistory() {
  const { polls, fetchPolls, deletePoll, closePoll, getPollResults, getUserPolls } = usePolls();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [userPolls, setUserPolls] = useState([]);
  const [pollResults, setPollResults] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const loadPolls = async () => {
      await fetchPolls();
      if (!isAdmin && user) {
        const votedPolls = await getUserPolls(user.uid);
        console.log('User Polls:', votedPolls);
        setUserPolls(votedPolls);
      }
      setLoading(false);
    };
    loadPolls();
  }, [fetchPolls, getUserPolls, isAdmin, user]);

  useEffect(() => {
    const loadPollResults = async () => {
      const results = {};
      for (const poll of polls) {
        results[poll.id] = await getPollResults(poll.id);
      }
      setPollResults(results);
    };
    loadPollResults();
  }, [polls, getPollResults]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

 
  const handleClosePoll = async (pollId) => {
    await closePoll(pollId);
    await fetchPolls();
  };

  const calculateTotalVotes = (pollId) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll || !poll.choices) return 0;
    
    // Sum up votes from all choices
    return poll.choices.reduce((sum, choice) => sum + (choice.votes || 0), 0);
  };

  const renderPollCard = (poll) => {
    const totalVotes = calculateTotalVotes(poll.id);

      // Get the user's vote for this specific poll
      const userPoll = userPolls?.find(p => p.id === poll.id);
      console.log('User vote for poll:', poll.id, userPoll?.userVote); // Debug log
       // Debug log


    return (
      <Card key={poll.id} className={poll.status === 'closed' ? 'opacity-75' : ''}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{poll.question}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {poll.status === 'closed' ? 'Closed on' : 'Ends on'} {formatDate(poll.deadline)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {totalVotes} total votes
                  </span>
                  {poll.status === 'closed' && (
                    <Badge variant="secondary">
                      <Lock className="h-4 w-4 mr-1" />
                      Closed
                    </Badge>
                  )}
                </div>
              </CardDescription>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClosePoll(poll.id)}
                  disabled={poll.status === 'closed'}
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Close Poll
                </Button>
            
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
        <Table>
  <TableHeader>
    <TableRow>
      <TableHead>Choice</TableHead>
      <TableHead>Votes</TableHead>
      {/* <TableHead>Percentage</TableHead> */}
      {!isAdmin && <TableHead>Your Vote</TableHead>}
    </TableRow>
  </TableHeader>
  <TableBody>
  {poll.choices.map((choice, index) => {
    const votes = choice.votes || 0;
    const totalVotes = poll.choices.reduce((sum, c) => sum + (c.votes || 0), 0);
    


    return (
      <TableRow key={index}>
        <TableCell>{choice.text}</TableCell>
        <TableCell>{votes}</TableCell>
        {!isAdmin && (
          <TableCell>
            {userPoll?.userVote === choice.text && (
              <Badge variant="secondary">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Your Vote
              </Badge>
            )}
          </TableCell>
        )}
      </TableRow>
    );
  })}
</TableBody>
</Table>

        </CardContent>
        {isAdmin && (
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Poll ID: {poll.id} • Created by: {poll.createdBy}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isAdmin ? "Poll Management" : "Your Voting History"}
        </h1>
        {isAdmin && (
          <Badge variant="secondary" className="text-sm">
            Admin View
          </Badge>
        )}
      </div>

      {isAdmin ? (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Polls</TabsTrigger>
            <TabsTrigger value="active">Active Polls</TabsTrigger>
            <TabsTrigger value="closed">Closed Polls</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            {polls?.length > 0 ? (
              <div className="space-y-6">
                {polls.map(renderPollCard)}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No polls found in the system.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="active">
            {polls.filter(poll => poll.status !== 'closed')?.length > 0 ? (
              <div className="space-y-6">
                {polls.filter(poll => poll.status !== 'closed').map(renderPollCard)}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active polls found.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="closed">
            {polls.filter(poll => poll.status === 'closed')?.length > 0 ? (
              <div className="space-y-6">
                {polls.filter(poll => poll.status === 'closed').map(renderPollCard)}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No closed polls found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="voted">
          <TabsList>
            <TabsTrigger value="voted">Polls You've Voted On</TabsTrigger>
            <TabsTrigger value="active">Active Polls</TabsTrigger>
          </TabsList>
          <TabsContent value="voted">
            {userPolls?.length > 0 ? (
              <div className="space-y-6">
                {userPolls.map(renderPollCard)}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't voted in any polls yet.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="active">
            {polls.filter(poll => poll.status !== 'closed').length > 0 ? (
              <div className="space-y-6">
                {polls.filter(poll => poll.status !== 'closed').map(renderPollCard)}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active polls available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

   
    </div>
  );
}