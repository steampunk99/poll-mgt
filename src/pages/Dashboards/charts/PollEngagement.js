
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Label } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { usePolls } from '@/context/PollContext'

const PollStatsDashboard = () => {
  const { user, usersList, fetchUsers } = useUser()
  const { polls, fetchPolls, getPollStatistics } = usePolls()
  const [pollsData, setPollsData] = useState({ activePolls: 0, inactivePolls: 0, totalPolls: 0 })
  const [votesOverTime, setVotesOverTime] = useState([])

  useEffect(() => {
    fetchUsers()
    fetchPolls()
  }, [])

  useEffect(() => {
    if (polls.length > 0) {
      const active = polls.filter(poll => poll.status === 'active').length
      const inactive = polls.filter(poll => poll.status === 'closed').length
      setPollsData({
        activePolls: active,
        inactivePolls: inactive,
        totalPolls: polls.length
      })

      // Generate mock data for votes over time
      const mockVotesOverTime = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        votes: Math.floor(Math.random() * 100)
      }))
      setVotesOverTime(mockVotesOverTime)
    }
  }, [polls])

  return (
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
  )
}

export default PollStatsDashboard