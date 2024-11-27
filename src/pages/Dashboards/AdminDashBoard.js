import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp,
  getCountFromServer
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Card, CardHeader, CardTitle, CardContent, CardFooter,CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { Loader2, PlusCircle, List,TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Label } from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AuditLogs from './AuditLogs';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import PollStatsDashboard from './charts/PollEngagement';

export default function AdminDashboard() {
  
  const [dashboardData, setDashboardData] = useState({
    recentPolls: [],
    pollsData: {
      totalPolls: 0,
      activePolls: 0,
      inactivePolls: 0,
    },
    votesOverTime: [],
    loading: true
  });

  

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const now = Timestamp.now();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get counts using server-side counting
        const pollsRef = collection(db, 'polls');
        const [totalCount, activeCount] = await Promise.all([
          getCountFromServer(query(pollsRef)),
          getCountFromServer(query(pollsRef, where('deadline', '>', now)))
        ]);

        // Fetch only recent polls with necessary data
        const recentPollsQuery = query(
          pollsRef,
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        // Fetch votes data for the last 30 days
        const votesQuery = query(
          pollsRef,
          where('createdAt', '>', Timestamp.fromDate(thirtyDaysAgo)),
          orderBy('createdAt', 'desc')
        );

        // Execute queries in parallel
        const [recentPollsSnapshot, votesSnapshot] = await Promise.all([
          getDocs(recentPollsQuery),
          getDocs(votesQuery)
        ]);

        // Process recent polls
        const recentPolls = recentPollsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Process votes data
        const votesData = {};
        votesSnapshot.forEach(doc => {
          const poll = doc.data();
          const date = poll.createdAt.toDate().toISOString().split('T')[0];
          const votes = poll.choices.reduce((sum, choice) => sum + choice.votes, 0);
          votesData[date] = (votesData[date] || 0) + votes;
        });

        // Convert votesData to array and sort
        const votesArray = Object.entries(votesData)
          .map(([date, votes]) => ({ date, votes }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setDashboardData({
          recentPolls,
          pollsData: {
            totalPolls: totalCount.data().count,
            activePolls: activeCount.data().count,
            inactivePolls: totalCount.data().count - activeCount.data().count
          },
          votesOverTime: votesArray,
          loading: false
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data. Please try again.",
          variant: "destructive",
        });
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, [toast]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getTotalVotes = (choices) => {
    return choices.reduce((total, choice) => total + choice.votes, 0);
  };

  if (dashboardData.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen mt-6">
    
      {/* <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1> */}
      
      <PollStatsDashboard/>

      <div className="flex justify-between items-center mb-6 mt-6">
        <h2 className="text-2xl font-semibold">Recent Polls</h2>
        <div className="space-x-4">
          <Button asChild variant="outline" className="text-white bg-[#3b82f6] ">
            <Link to="/dashboard/createpolls">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Poll
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard/managepolls">
              <List className="mr-2 h-4 w-4" /> Manage Polls
            </Link>
          </Button>
        </div>
      </div>

      <Card className='w-full p-4'>
        <Table>
          <TableCaption>A list of your most recent polls.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Total Votes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
  {dashboardData.recentPolls.map((poll) => (
    <TableRow key={poll.id}>
      <TableCell className="font-medium">{poll.question}</TableCell>
      <TableCell>{formatDate(poll.deadline)}</TableCell>
      <TableCell>{getTotalVotes(poll.choices)}</TableCell>
      <TableCell>
        {poll.status === 'closed' ? (
          <span className="text-red-600">Closed</span>
        ) : new Date(poll.deadline) > new Date() ? (
          <span className="text-green-600">Active</span>
        ) : (
          <span className="text-red-600">Expired</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/dashboard/poll/${poll.id}`}>
            View Results
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
        </Table>
      </Card>
      <AuditLogs/>
    </div>
  );
}


