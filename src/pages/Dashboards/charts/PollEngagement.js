import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Label, Tooltip, Legend, CartesianGrid } from 'recharts'
import { TrendingUp, Activity, Users, Award, Loader2 } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'
import { format } from 'date-fns'

const StatCard = ({ title, value, subtitle, icon: Icon }) => (
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">
        {subtitle}
      </p>
    </CardContent>
  </Card>
)

const PollStatsDashboard = () => {
  const { getPollEngagement } = useAdmin()
  const [engagementData, setEngagementData] = useState({
    metrics: {
      totalPolls: 0,
      activePolls: 0,
      totalVotes: 0,
      averageVotesPerPoll: 0,
      engagementTrends: {
        participationRate: 0,
        growthRate: 0,
        mostEngagedTimeOfDay: "N/A"
      },
      votesOverTime: [],
      topPerformingPolls: []
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      if (!mounted) return

      try {
        const data = await getPollEngagement()
        if (mounted && data?.metrics) {
          setEngagementData(data)
          setError(null)
        }
      } catch (err) {
        if (mounted) {
          console.error('Error fetching engagement data:', err)
          setError(err.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [getPollEngagement])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="p-6 border-destructive">
          <CardContent className="text-center space-y-2">
            <div className="text-2xl text-destructive">⚠️</div>
            <div className="text-lg font-semibold text-destructive">Error Loading Data</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { metrics } = engagementData

  return (
    <div className="space-y-12">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Polls"
          value={metrics.totalPolls}
          subtitle={`${metrics.activePolls} active polls`}
          icon={Activity}
        />
        <StatCard
          title="Total Votes"
          value={metrics.totalVotes}
          subtitle={`~${metrics.averageVotesPerPoll} votes per poll`}
          icon={Users}
        />
        <StatCard
          title="Engagement Rate"
          value={`${metrics.engagementTrends.participationRate}%`}
 
          icon={TrendingUp}
        />
     
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {metrics.votesOverTime && metrics.votesOverTime.length > 0 && (
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg">Votes Over Time</CardTitle>
              <CardDescription>Voting activity over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.votesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                      formatter={(value) => [value, 'Votes']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="votes"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, className: 'fill-primary' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {metrics.topPerformingPolls && metrics.topPerformingPolls.length > 0 && (
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Polls</CardTitle>
              <CardDescription>By average votes per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={metrics.topPerformingPolls} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" className="text-xs" />
                    <YAxis 
                      type="category" 
                      dataKey="question" 
                      width={150}
                      tickFormatter={(value) => value?.length > 20 ? value.substring(0, 20) + '...' : value}
                      className="text-xs"
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                      formatter={(value) => [`${value} votes/day`, 'Average']}
                    />
                    <Bar 
                      dataKey="averageVotesPerDay" 
                      fill="hsl(var(--primary))"
                      name="Avg. Votes/Day"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PollStatsDashboard