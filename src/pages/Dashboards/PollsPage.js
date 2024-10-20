// import React, { useEffect, useState } from 'react'
// import { usePolls } from '@/context/PollContext'
// import { useUser } from '@/context/UserContext'
// import { useNavigate } from 'react-router-dom'
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { Loader2, Vote, Calendar, Users, ChevronDown, ChevronUp } from "lucide-react"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible"
// import { Progress } from "@/components/ui/progress"
// import { Card } from '@/components/ui/card'

// export default function PollsPage() {
//   const { polls, fetchPolls } = usePolls()
//   const { user } = useUser()
//   const [loading, setLoading] = useState(true)
//   const navigate = useNavigate()
//   const [expandedPolls, setExpandedPolls] = useState({})

  // useEffect(() => {
  //   const loadPolls = async () => {
  //     await fetchPolls()
  //     setLoading(false)
  //   }
  //   loadPolls()
  // }, [fetchPolls])

  // const formatDaysLeft = (timestamp) => {
  //   if (!timestamp) return 'N/A'
  //   const endDate = timestamp.toDate()
  //   const today = new Date()
  //   const timeDiff = endDate - today
  //   const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  //   return daysLeft > 0 ? `${daysLeft} day(s) left` : 'Closed'
  // }
  
//   const handleVote = (pollId) => {
//     navigate(`/dashboard/poll/${pollId}`)
//   }

//   const getStatusBadge = (deadline) => {
//     const daysLeft = formatDaysLeft(deadline)
//     if (daysLeft === 'Closed') {
//       return <Badge variant="secondary">Closed</Badge>
//     } else if (parseInt(daysLeft) <= 3) {
//       return <Badge variant="destructive">Ending Soon</Badge>
//     } else {
//       return <Badge variant="default">Active</Badge>
//     }
//   }

//   const toggleExpanded = (pollId) => {
//     setExpandedPolls(prev => ({ ...prev, [pollId]: !prev[pollId] }))
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     )
//   }

  // const activePolls = polls.filter(poll => formatDaysLeft(poll.deadline) !== 'Closed')
  // const closedPolls = polls.filter(poll => formatDaysLeft(poll.deadline) === 'Closed')

//   const PollTable = ({ polls, showVoteButton }) => (
//     <Card>
//     <Table className="p-4">
//       <TableHeader>
//         <TableRow>
//           <TableHead className="w-[300px]">Question</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>Total Votes</TableHead>
//           <TableHead className="text-right">Action</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {polls.map(poll => (
//           <React.Fragment key={poll.id}>
//             <TableRow className="group">
//               <TableCell className="font-medium">
//                 <Collapsible open={expandedPolls[poll.id]} onOpenChange={() => toggleExpanded(poll.id)}>
//                   <CollapsibleTrigger className="flex items-center gap-2 hover:underline">
//                     {poll.question}
//                     {expandedPolls[poll.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//                   </CollapsibleTrigger>
//                 </Collapsible>
//               </TableCell>
//               <TableCell>{getStatusBadge(poll.deadline)}</TableCell>
//               <TableCell>{poll.totalVotes||  0}</TableCell>
//               <TableCell className="text-right">
//                 {showVoteButton ? (
//                   <Button onClick={() => handleVote(poll.id)} size="sm">
//                     <Vote className="mr-2 h-4 w-4" />
//                     Vote Now
//                   </Button>
//                 ) : (
//                   <Button variant="outline" onClick={() => handleVote(poll.id)} size="sm">
//                     View Results
//                   </Button>
//                 )}
//               </TableCell>
//             </TableRow>
//             <TableRow>
//               <TableCell colSpan={4} className="p-0">
//                 <Collapsible open={expandedPolls[poll.id]}>
//                   <CollapsibleContent className="p-4 bg-muted/50">
//                     <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
//                       <span className="flex items-center gap-1">
//                         <Calendar className="h-4 w-4" />
//                         {formatDaysLeft(poll.deadline)}
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <Users className="h-4 w-4" />
//                         {poll.totalVotes||  0} votes
//                       </span>
//                     </div>
//                     <p className="text-sm mb-4">{poll.description || "No description provided."}</p>
//                     {poll.choices && (
//                       <div className="space-y-2">
//                         {poll.choices.map((choice, index) => (
//                           <div key={index} className="space-y-1">
//                             <div className="flex justify-between text-sm">
//                               <span>{choice.name}</span>
//                               <span>{choice.votes} votes</span>
//                             </div>
//                             <Progress value={(choice.votes / poll.totalVotes) * 100} className="h-2" />
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </CollapsibleContent>
//                 </Collapsible>
//               </TableCell>
//             </TableRow>
           
//           </React.Fragment>
//         ))}
//       </TableBody>
//     </Table>
//      </Card>
//   )

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Polls</h1>
      
//       </div>
//       <Tabs defaultValue="active" className="w-full">
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="active">Active Polls</TabsTrigger>
//           <TabsTrigger value="closed">Closed Polls</TabsTrigger>
//         </TabsList>
//         <TabsContent value="active">
//           {activePolls.length > 0 ? (
//             <PollTable polls={activePolls} showVoteButton={true} />
//           ) : (
//             <p className="text-center py-10 text-muted-foreground">No active polls available at the moment.</p>
//           )}
//         </TabsContent>
//         <TabsContent value="closed">
//           {closedPolls.length > 0 ? (
//             <PollTable polls={closedPolls} showVoteButton={false} />
//           ) : (
//             <p className="text-center py-10 text-muted-foreground">No closed polls available.</p>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

import React, { useEffect, useState, useMemo } from 'react'
import { usePolls } from '@/context/PollContext'
import { useUser } from '@/context/UserContext'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Vote, Calendar, Users, ChevronDown, ChevronUp, Search, PlusCircle, RefreshCw } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export default function PollsPage() {
  const { polls, fetchPolls, votePoll, searchPolls, createPoll, loading: contextLoading, error } = usePolls()
  const { user } = useUser()
  const [localPolls, setLocalPolls] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('deadline')
  const [expandedPolls, setExpandedPolls] = useState({})
  const [selectedTab, setSelectedTab] = useState('active')
  const [loading, setLoading] = useState()
  const navigate = useNavigate()

  useEffect(() => {
    const loadPolls = async () => {
      await fetchPolls()
      setLoading(false)
    }
    loadPolls()
  }, [fetchPolls])

  const formatDaysLeft = (timestamp) => {
    if (!timestamp) return 'N/A'
    const endDate = timestamp.toDate()
    const today = new Date()
    const timeDiff = endDate - today
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    return daysLeft > 0 ? `${daysLeft} day(s) left` : 'Closed'
  }

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setLocalPolls(polls)
    } else {
      const filteredPolls = polls.filter(poll => 
        poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poll.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setLocalPolls(filteredPolls)
    }
  }

  const handleRefresh = async () => {
    await fetchPolls()
    toast({
      title: "Polls Refreshed",
      description: "The poll list has been updated.",
      variant: "default",
    })
  }


  const sortedPolls = useMemo(() => {
    return [...localPolls].sort((a, b) => {
      if (sortBy === 'deadline') {
        return (a.deadline?.toDate() || 0) - (b.deadline?.toDate() || 0)
      } else if (sortBy === 'votes') {
        return (b.totalVotes || 0) - (a.totalVotes || 0)
      }
      return 0
    })
  }, [localPolls, sortBy])

  const activePolls = polls.filter(poll => formatDaysLeft(poll.deadline) !== 'Closed')
  const closedPolls = polls.filter(poll => formatDaysLeft(poll.deadline) === 'Closed')

  
  const handleVote = async (pollId, choiceId) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote.",
        variant: "default",
      })
      return
    }
    try {
      await votePoll(pollId, choiceId, user.uid)
      toast({
        title: "Vote Recorded",
        description: "Your vote has been successfully recorded.",
        variant: "default",
      })
      fetchPolls() // Refresh polls after voting
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (deadline) => {
    const daysLeft = formatDaysLeft(deadline)
    if (daysLeft === 'Closed') {
      return <Badge variant="secondary">Closed</Badge>
    } else if (parseInt(daysLeft) <= 3) {
      return <Badge variant="destructive">Ending Soon</Badge>
    } else {
      return <Badge variant="default">Active</Badge>
    }
  }

  const toggleExpanded = (pollId) => {
    setExpandedPolls(prev => ({ ...prev, [pollId]: !prev[pollId] }))
  }

  const handleCreatePoll = () => {
    navigate('/dashboard/create-poll')
  }

  const PollTable = ({ polls, showVoteButton }) => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Question</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Votes</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {polls.map(poll => (
            <React.Fragment key={poll.id}>
              <TableRow className="group">
                <TableCell className="font-medium">
                  <Collapsible open={expandedPolls[poll.id]} onOpenChange={() => toggleExpanded(poll.id)}>
                    <CollapsibleTrigger className="flex items-center gap-2 hover:underline">
                      {poll.question}
                      {expandedPolls[poll.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                  </Collapsible>
                </TableCell>
                <TableCell>{getStatusBadge(poll.deadline)}</TableCell>
                <TableCell>{poll.totalVotes || 0}</TableCell>
                <TableCell className="text-right">
                  {showVoteButton ? (
                    <Button onClick={() => toggleExpanded(poll.id)} size="sm">
                      <Vote className="mr-2 h-4 w-4" />
                      Vote Now
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => toggleExpanded(poll.id)} size="sm">
                      View Results
                    </Button>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <Collapsible open={expandedPolls[poll.id]}>
                    <CollapsibleContent className="p-4 bg-muted/50">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDaysLeft(poll.deadline)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {poll.totalVotes || 0} votes
                        </span>
                      </div>
                      <p className="text-sm mb-4">{poll.description || "No description provided."}</p>
                      {poll.choices && (
                        <div className="space-y-2">
                          {poll.choices.map((choice, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{choice.name}</span>
                                <span>{choice.votes} votes</span>
                              </div>
                              <Progress value={(choice.votes / (poll.totalVotes || 1)) * 100} className="h-2" />
                              {showVoteButton && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-1"
                                  onClick={() => handleVote(poll.id, choice.id)}
                                >
                                  Vote for this option
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </Card>
  )

  // if (loading || contextLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <Loader2 className="h-8 w-8 animate-spin" />
  //     </div>
  //   )
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Polls</h1>
        <div className="flex gap-2">
          <Button onClick={handleCreatePoll}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Poll
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search polls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
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
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Polls</TabsTrigger>
          <TabsTrigger value="closed">Closed Polls</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {activePolls.length > 0 ? (
            <PollTable polls={activePolls} showVoteButton={true} />
          ) : (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">No active polls available at the moment.</p>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="closed">
          {closedPolls.length > 0 ? (
            <PollTable polls={closedPolls} showVoteButton={false} />
          ) : (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">No closed polls available.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}