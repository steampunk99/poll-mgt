"use client"

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from "@/lib/firebase"
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2, Edit, Eye, EyeOff, Plus } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card } from '@/components/ui/card'

// helper function to calculate total votes
const calculateTotalVotes = (choices) => {
  return choices.reduce((total, choice) => total + (choice.votes || 0), 0);
};


export default function ManagePollsPage() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchPolls = async () => {
    try {
      const pollCollection = collection(db, 'polls')
      const pollSnapshot = await getDocs(pollCollection)
      const pollList = pollSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
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
  }, [])

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
        <Button onClick={() => navigate('/dashboard/createpolls')}>
          <Plus className="mr-2 h-4 w-4" /> Create New Poll
        </Button>
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
              <TableHead>Total Votes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {polls.map((poll) => (
              <TableRow key={poll.id}>
                <TableCell className="font-medium">{poll.question}</TableCell>
                <TableCell>{new Date(poll.deadline.seconds * 1000).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge className={new Date(poll.deadline.seconds * 1000) > new Date() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {new Date(poll.deadline.seconds * 1000) > new Date() ? "Active" : "Closed"}
                  </Badge>
                </TableCell>
                <TableCell>{calculateTotalVotes(poll.choices)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(poll.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the poll
                          and remove all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(poll.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </Card>
      ) : (
        <div className="text-center text-gray-500">
          <p>No polls available</p>
         
      
        
        </div>
      )}
    </div>
  )
}