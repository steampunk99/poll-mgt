"use client"

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from "@/lib/firebase"
import { collection, getDocs, deleteDoc, doc, updateDoc, query, where, orderBy } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2, Edit, Eye, EyeOff, Plus, Search, Filter, Download, MoreVertical } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format } from 'date-fns'
import { usePolls } from '@/context/PollContext'

// helper function to calculate total votes
const calculateTotalVotes = (choices) => {
  return choices.reduce((total, choice) => total + (choice.votes || 0), 0);
};

const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return 'N/A';
  try {
    return format(new Date(timestamp.seconds * 1000), 'PPP');
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'Invalid Date';
  }
};

const PollStatsCard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const QuickViewDialog = ({ poll }) => {
  const totalVotes = calculateTotalVotes(poll.choices);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{poll.question}</DialogTitle>
          <DialogDescription>
            Created on {formatDate(poll.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Choices</h4>
            {poll.choices.map((choice, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{choice.text}</span>
                <Badge variant="secondary">
                  {((choice.votes || 0) / (totalVotes || 1) * 100).toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <div>
                <Badge className={new Date(poll.deadline?.seconds * 1000) > new Date() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {new Date(poll.deadline?.seconds * 1000) > new Date() ? "Active" : "Closed"}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Visibility</Label>
              <div>
                <Badge variant="outline">{poll.visibility}</Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function ManagePollsPage() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedPolls, setSelectedPolls] = useState([])
  const navigate = useNavigate()
  const { toast } = useToast()
  const { exportPollsData } = usePolls()

  const fetchPolls = async () => {
    try {
      setLoading(true)
      const pollCollection = collection(db, 'polls')
      let pollQuery = query(pollCollection)

      // Apply filters
      if (statusFilter !== "all") {
        const now = new Date()
        if (statusFilter === "active") {
          pollQuery = query(pollQuery, where("deadline", ">", now))
        } else {
          pollQuery = query(pollQuery, where("deadline", "<", now))
        }
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          pollQuery = query(pollQuery, orderBy("createdAt", "desc"))
          break
        case "oldest":
          pollQuery = query(pollQuery, orderBy("createdAt", "asc"))
          break
        case "mostVotes":
          pollQuery = query(pollQuery, orderBy("totalVotes", "desc"))
          break
        default:
          break
      }

      const pollSnapshot = await getDocs(pollQuery)
      let pollList = pollSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Apply search filter
      if (searchQuery) {
        pollList = pollList.filter(poll => 
          poll.question.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setPolls(pollList)
      setError(null)
    } catch (err) {
      setError('Failed to fetch polls')
      toast({
        title: "Error",
        description: "Failed to fetch polls. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [searchQuery, statusFilter, sortBy])

  const handleEdit = (pollId) => {
    navigate(`/dashboard/poll/${pollId}/edit`)
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "polls", id))
      setPolls(polls.filter(poll => poll.id !== id))
      toast({
        title: "Success",
        description: "Poll deleted successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete poll. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedPolls.map(id => deleteDoc(doc(db, "polls", id))))
      setPolls(polls.filter(poll => !selectedPolls.includes(poll.id)))
      setSelectedPolls([])
      toast({
        title: "Success",
        description: `${selectedPolls.length} polls deleted successfully.`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete polls. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleVisibility = async (id, currentVisibility) => {
    try {
      const newVisibility = currentVisibility === 'public' ? 'private' : 'public'
      await updateDoc(doc(db, "polls", id), { visibility: newVisibility })
      setPolls(polls.map(poll => 
        poll.id === id ? { ...poll, visibility: newVisibility } : poll
      ))
      toast({
        title: "Success",
        description: `Poll visibility changed to ${newVisibility}`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update poll visibility. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExport = async () => {
    try {
      const pollsToExport = selectedPolls.length > 0 
        ? polls.filter(poll => selectedPolls.includes(poll.id))
        : polls
      await exportPollsData(pollsToExport)
      toast({
        title: "Success",
        description: "Polls exported successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to export polls. Please try again.",
        variant: "destructive",
      })
    }
  }

  const activePolls = polls.filter(poll => new Date(poll.deadline?.seconds * 1000) > new Date())
  const closedPolls = polls.filter(poll => new Date(poll.deadline?.seconds * 1000) <= new Date())
  const totalVotes = polls.reduce((sum, poll) => sum + calculateTotalVotes(poll.choices), 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Polls</h1>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={() => navigate('/dashboard/createpolls')}>
            <Plus className="mr-2 h-4 w-4" /> Create New Poll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <PollStatsCard title="Total Active Polls" value={activePolls.length} icon={Eye} />
        <PollStatsCard title="Closed Polls" value={closedPolls.length} icon={EyeOff} />
        <PollStatsCard title="Total Votes" value={totalVotes} icon={Filter} />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            icon={Search}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Polls</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="mostVotes">Most Votes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button onClick={fetchPolls} variant="outline" className="mt-4">Try Again</Button>
        </div>
      ) : polls.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Question</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Total Votes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {polls.map((poll) => (
                <TableRow key={poll.id}>
                  <TableCell className="font-medium">{poll.question}</TableCell>
                  <TableCell>{formatDate(poll.deadline)}</TableCell>
                  <TableCell>
                    <Badge className={new Date(poll.deadline?.seconds * 1000) > new Date() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {new Date(poll.deadline?.seconds * 1000) > new Date() ? "Active" : "Closed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{poll.visibility}</Badge>
                  </TableCell>
                  <TableCell>{calculateTotalVotes(poll.choices)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <QuickViewDialog poll={poll} />
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(poll.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleToggleVisibility(poll.id, poll.visibility)}>
                            Toggle Visibility
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(poll.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="text-center text-gray-500">
          <p>No polls available</p>
          <Button onClick={() => navigate('/dashboard/createpolls')} variant="outline" className="mt-4">
            Create Your First Poll
          </Button>
        </div>
      )}
    </div>
  )
}