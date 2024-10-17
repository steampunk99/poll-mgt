

import React, { useState, useEffect } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from 'date-fns'
import * as XLSX from "xlsx"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Filter } from 'lucide-react'
import PollStatsDashboard from './charts/PollEngagement'


export default function Reports() {
  const { pollStats, userStats, loading, error, getPollEngagement, getUserActivity, getRecentPolls } = useAdmin()
  const [pollEngagement, setPollEngagement] = useState([])
  const [userActivity, setUserActivity] = useState([])
  const [recentPolls, setRecentPolls] = useState([])
  const [filteredPolls, setFilteredPolls] = useState(recentPolls)
  const [filterQuestion, setFilterQuestion] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const engagementData = await getPollEngagement()
      const activityData = await getUserActivity()
      const recentPollsData = await getRecentPolls()
      setPollEngagement(engagementData)
      setUserActivity(activityData)
      setRecentPolls(recentPollsData)
    }
    fetchData()
  }, [])

  const handleFilter = () => {
    let filtered = recentPolls
    if (filterQuestion) {
      filtered = filtered.filter(poll => 
        poll.question.toLowerCase().includes(filterQuestion.toLowerCase())
      )
    }
    if (filterStatus) {
      filtered = filtered.filter(poll => poll.status === filterStatus)
    }
    setFilteredPolls(filtered)
  }


  // handle export and download
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPolls.map(poll => ({
      Question: poll.question,
      'Created At': format(poll.createdAt.toDate(), 'MM/dd/yyyy HH:mm'),
      Status: poll.status,
      Votes: poll.choices.reduce((sum, choice) => sum + choice.votes, 0)
    })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recent Polls")
    XLSX.writeFile(workbook, "recent_polls.xlsx")
  }

  if (loading) return <p className="text-center py-4">Loading admin dashboard...</p>
  if (error) return <p className="text-center py-4 text-red-500">Error: {error}</p>

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pollStats.totalPolls}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pollStats.activePolls}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pollStats.totalVotes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userStats.totalUsers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
      
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Polls
           
             </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Filter by question"
            value={filterQuestion}
            onChange={(e) => setFilterQuestion(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleFilter} variant="secondary">
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
          <span>  <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export to XLS
          </Button></span>
        </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Votes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPolls.map((poll) => (
                <TableRow key={poll.id}>
                  <TableCell>{poll.question}</TableCell>
                  <TableCell>{format(poll.createdAt.toDate(), 'MM/dd/yyyy HH:mm')}</TableCell>
                  <TableCell>{poll.status}</TableCell>
                  <TableCell>{poll.choices.reduce((sum, choice) => sum + choice.votes, 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PollStatsDashboard/>
    </div>
  )
}