import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePolls } from '@/context/PollContext'
import { useUser } from '@/context/UserContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, ChevronLeft, Check, Calendar } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { serverTimestamp } from 'firebase/firestore'

export default function PollPage() {
  const { pollId } = useParams()
  const { polls, updatePoll } = usePolls()
  const { user } = useUser()
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [isVoting, setIsVoting] = useState(false)
  const [voteReason, setVoteReason] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const foundPoll = polls.find((p) => p.id === pollId)
    if (foundPoll) {
      setPoll(foundPoll)
      setHasVoted(foundPoll.voters && foundPoll.voters.includes(user?.uid))
    }
    setLoading(false)
  }, [pollId, polls, user])

  const formatDate = (deadline) => {
    if (!deadline) return 'N/A'
    // Handle both Firestore timestamp and string date
    const date = deadline.toDate ? deadline.toDate() : new Date(deadline)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  
  const formatDaysLeft = (deadline) => {
    if (!deadline) return 'N/A'
    // Handle both Firestore timestamp and string date
    const endDate = deadline.toDate ? deadline.toDate() : new Date(deadline)
    const today = new Date()
    const timeDiff = endDate - today
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    return daysLeft > 0 ? `${daysLeft} day(s) left` : 'Closed'
  }

  const handleVote = async (pollId, choiceIndex) => {
    try {
      setIsVoting(true);
      const currentPoll = polls.find(p => p.id === pollId);
      if (!currentPoll) throw new Error('Poll not found');

      // Create updated choices array with default values for votes
      const updatedChoices = currentPoll.choices.map((choice, index) => ({
        ...choice,
        id: choice.id || `choice-${index}`, // Ensure each choice has an ID
        text: choice.text || '',
        votes: index === choiceIndex ? ((choice.votes || 0) + 1) : (choice.votes || 0)
      }));

      // Create voter entry with reason
      const voterEntry = {
        userId: user.uid,
        choiceId: currentPoll.choices[choiceIndex].id || `choice-${choiceIndex}`,
        reason: voteReason?.trim() || '',
        votedAt: new Date()
      };

      // Get current voters array or initialize it
      const currentVoters = Array.isArray(currentPoll.voters) ? currentPoll.voters : [];

      // Update the poll with validated data
      await updatePoll(pollId, {
        choices: updatedChoices,
        voters: [...currentVoters, voterEntry]
      });

      setHasVoted(true);
      setSelectedChoice(null);
      setVoteReason("");

      toast({
        title: "Success",
        description: "Your vote has been recorded",
      });

    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-8">
        <Card className="w-[300px]">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Poll not found</h1>
        <Button asChild>
          <Link to="/polls"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Polls</Link>
        </Button>
      </div>
    )
  }

  const totalVotes = poll.choices.reduce((sum, choice) => sum + choice.votes, 0)
  const isPollClosed = new Date(poll.deadline.toDate ? poll.deadline.toDate() : poll.deadline) < new Date()

  return (
    <div className=" max-w-4xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button 
          variant="ghost" 
          asChild 
          className="mb-4 hover:bg-primary/5 hover:text-primary -ml-2"
        >
          <Link to="/dashboard/polls">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Polls
          </Link>
        </Button>
      </motion.div>

      <Card className="backdrop-blur-sm bg-card/95 shadow-xl border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {poll.question}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatDate(poll.deadline)}
                </div>
                <Badge 
                  variant={isPollClosed ? "secondary" : "default"} 
                  className={`${isPollClosed ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}
                >
                  {isPollClosed ? "Closed" : formatDaysLeft(poll.deadline)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {poll.choices.map((choice, index) => {
              const votes = choice.votes || 0;
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              const isSelected = selectedChoice === index;
              const hasVotedForThis = hasVoted && poll.voters?.some(
                voter => voter.choiceId === choice.id && voter.userId === user?.uid
              );

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className={`relative rounded-lg border transition-all duration-200 ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-lg' 
                        : hasVotedForThis
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-muted hover:border-primary/20 hover:bg-muted/50'
                    } ${hasVoted || isPollClosed ? 'cursor-default' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (!hasVoted && !isPollClosed) {
                        setSelectedChoice(index);
                      }
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                            {choice.text}
                          </p>
                          {hasVotedForThis && (
                            <Badge variant="outline" className="mt-2 text-primary border-primary/20 bg-primary/5">
                              Your vote
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{votes} {votes === 1 ? 'vote' : 'votes'}</span>
                          <p className="text-xs text-background">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="mt-3 relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={`absolute h-2 rounded-full ${
                            hasVotedForThis 
                              ? 'bg-primary' 
                              : isSelected 
                              ? 'bg-primary/70' 
                              : 'bg-primary/30'
                          }`}
                        />
                        <div className="h-2 w-full bg-muted rounded-full" />
                      </div>

                      <AnimatePresence>
                        {isSelected && !hasVoted && !isPollClosed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4"
                          >
                            <label className="text-sm font-medium mb-2 block text-primary">
                              Why did you choose this option? (Optional)
                            </label>
                            <Textarea
                              placeholder="Share your thoughts..."
                              value={voteReason}
                              onChange={(e) => setVoteReason(e.target.value)}
                              className="w-full border-primary/20 focus:border-primary"
                              rows={3}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {hasVoted && poll.voters && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-3 space-y-2"
                        >
                          {poll.voters
                            .filter(voter => voter.choiceId === choice.id && voter.reason)
                            .map((voter, vIndex) => (
                              <motion.div
                                key={vIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: vIndex * 0.1 }}
                                className="text-sm text-muted-foreground pl-3 border-l-2 border-primary/20 italic"
                              >
                                "{voter.reason}"
                              </motion.div>
                            ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 pb-4">
          <div className="flex items-center gap-3 order-2 sm:order-1">
            <Avatar>
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.displayName || user?.email}</span>
              <span className="text-xs text-muted-foreground">Total votes: {totalVotes}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!hasVoted && !isPollClosed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="order-1 sm:order-2"
              >
                <Button 
                  onClick={() => handleVote(poll.id, selectedChoice)} 
                  disabled={selectedChoice === null || isVoting}
                  className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  {isVoting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Submit Vote
                    </>
                  )}
                </Button>
              </motion.div>
            )}
            {hasVoted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="order-1 sm:order-2"
              >
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                  <Check className="mr-2 h-4 w-4" /> Vote Submitted
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </div>
  )
}
