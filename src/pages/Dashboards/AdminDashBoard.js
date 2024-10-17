import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Card, CardHeader, CardTitle, CardContent, CardFooter,CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { Loader2, PlusCircle, List,TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Label } from '../../components/ui/label';

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

export default function AdminDashboard() {
  const [recentPolls, setRecentPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [pollsData, setPollsData] = useState({
    totalPolls: 0,
    activePolls: 0,
    inactivePolls: 0,
  })
  const [votesOverTime, setVotesOverTime] = useState([])


  useEffect(() => {
    const fetchRecentPolls = async () => {
      try {
        const pollsQuery = query(collection(db, 'polls'), orderBy('createdAt', 'desc'), limit(5));
        const pollSnapshot = await getDocs(pollsQuery);
        const pollList = pollSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentPolls(pollList);
      } catch (error) {
        console.error("Error fetching recent polls:", error);
        toast({
          title: "Error",
          description: "Failed to fetch recent polls. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPolls();
  }, [toast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pollsQuery = query(collection(db, 'polls'), orderBy('createdAt', 'desc'))
        const pollSnapshot = await getDocs(pollsQuery)
        
        let total = 0
        let active = 0
        let inactive = 0
        let votesData = {}
        let recentPollsList = []

        pollSnapshot.forEach(doc => {
          const poll = doc.data()
          total++
          if (new Date(poll.deadline.toDate()) > new Date()) {
            active++
          } else {
            inactive++
          }

          // Aggregate votes over time
          const date = poll.createdAt.toDate().toISOString().split('T')[0]
          const votes = poll.choices.reduce((sum, choice) => sum + choice.votes, 0)
          if (votesData[date]) {
            votesData[date] += votes
          } else {
            votesData[date] = votes
          }

          // Collect recent polls
          if (recentPollsList.length < 5) {
            recentPollsList.push({ id: doc.id, ...poll })
          }
        })

        setPollsData({ totalPolls: total, activePolls: active, inactivePolls: inactive })

        // Convert votesData to array and sort by date
        const votesArray = Object.entries(votesData).map(([date, votes]) => ({ date, votes }))
        votesArray.sort((a, b) => new Date(a.date) - new Date(b.date))
        setVotesOverTime(votesArray)

        setRecentPolls(recentPollsList)

      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate()
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getTotalVotes = (choices) => {
    return choices.reduce((total, choice) => total + choice.votes, 0)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
    
      {/* <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1> */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm">Total Polls Distribution</CardTitle>
            <CardDescription>Active vs Inactive</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={{
                active: {
                  label: "Active Polls",
                  color: "hsl(var(--chart-1))",
                },
                inactive: {
                  label: "Inactive Polls",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={[
                    { name: 'Active', value: pollsData.activePolls },
                    { name: 'Inactive', value: pollsData.inactivePolls },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {pollsData.totalPolls}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total Polls
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              {pollsData.activePolls > pollsData.inactivePolls ? "More active polls" : "More inactive polls"}
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm">Active vs Inactive Polls</CardTitle>
            <CardDescription>Comparison</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={{
                active: {
                  label: "Active Polls",
                  color: "hsl(var(--chart-1))",
                },
                inactive: {
                  label: "Inactive Polls",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[pollsData]}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="activePolls" fill="var(--color-active)" name="Active" />
                  <Bar dataKey="inactivePolls" fill="var(--color-inactive)" name="Inactive" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              {pollsData.activePolls > pollsData.inactivePolls ? "More active polls" : "More inactive polls"}
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm">Total Votes Over Time</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={{
                votes: {
                  label: "Total Votes",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={votesOverTime}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="votes" stroke="var(--color-votes)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Recent Polls</h2>
        <div className="space-x-4">
          <Button asChild variant="outline" className="border-red-400">
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

      <Card>
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
            {recentPolls.map((poll) => (
              <TableRow key={poll.id}>
                <TableCell className="font-medium">{poll.question}</TableCell>
                <TableCell>{formatDate(poll.deadline)}</TableCell>
                <TableCell>{getTotalVotes(poll.choices)}</TableCell>
                <TableCell>
                  {new Date(poll.deadline.toDate()) > new Date() ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Closed</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/poll/${poll.id}`}>
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


