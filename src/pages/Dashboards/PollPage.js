import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePolls } from '@/context/PollContext'
import { useUser } from '@/context/UserContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, ChevronLeft, Check } from 'lucide-react'
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
  const [voteReason, setVoteReason] = useState("");
  const { toast } = useToast()


  useEffect(() => {
    const foundPoll = polls.find((p) => p.id === pollId)
    if (foundPoll) {
      setPoll(foundPoll)
      setHasVoted(foundPoll.voters && foundPoll.voters.includes(user?.uid))
    }
    setLoading(false)
  }, [pollId, polls, user])

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate()
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatDaysLeft = (timestamp) => {
    if (!timestamp) return 'N/A'
    const endDate = timestamp.toDate()
    const today = new Date()
    const timeDiff = endDate - today
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    return daysLeft > 0 ? `${daysLeft} day(s) left` : 'Closed'
  }

//  vote function
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
  const isPollClosed = new Date(poll.deadline.toDate()) < new Date()

  return (
    <div className=" px-4 py-8">
      <Card className="max-w-2xl ">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold mb-2">{poll.question}</CardTitle>
              <CardDescription className="p-4">
                Deadline: {formatDate(poll.deadline)}
                <Badge variant={isPollClosed ? "secondary" : "default"} className="ml-2">
                  {isPollClosed ? "Closed" : formatDaysLeft(poll.deadline)}
                </Badge>
              </CardDescription>
            </div>
       
          </div>
        </CardHeader>
        <CardContent >
          <div className="space-y-4">
          {poll.choices.map((choice, index) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Button
      variant={selectedChoice === index ? "secondary" : "outline"}
      className="w-full justify-between h-auto py-3"
      onClick={() => {
        if (!hasVoted && !isPollClosed) {
          console.log('Setting selected choice:', index) // Debug log
          setSelectedChoice(index)
        }
      }}
      disabled={hasVoted || isPollClosed}
    >
      <span className="text-left">{choice.text}</span>
      <span className="ml-2">{choice.votes || 0} votes</span>
    </Button>
                <div className="relative my-2">
                  <Progress
                    value={totalVotes > 0 ? (choice.votes / totalVotes) * 100 : 0}
                    className="h-2"
                  />
                
{hasVoted && poll.voters && (
  <div className="mt-2">
    {poll.voters
      .filter(voter => voter.choiceId === choice.id && voter.reason)
      .map((voter, vIndex) => (
        <div key={vIndex} className="text-sm text-muted-foreground mt-1 pl-4 border-l-2">
          "{voter.reason}"
        </div>
      ))}
  </div>
)}
                  <span className="absolute my-2 right-0 top-0 text-xs text-muted-foreground">
                    {totalVotes > 0 ? ((choice.votes / totalVotes) * 100).toFixed(1) : 0}%
                  </span>
                  {selectedChoice === index && !hasVoted && !isPollClosed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <label className="text-sm font-medium mb-2 block">
                    Why did you choose this option? (Optional)
                  </label>
                  <Textarea
                    placeholder="Share your reason for voting..."
                    value={voteReason}
                    onChange={(e) => setVoteReason(e.target.value)}
                    className="w-full"
                    rows={3}
                  />
                </motion.div>
              )}

                 {/* Show reasons for votes */}
                 {hasVoted && poll.voters && (
                <div className="mt-2">
                  {poll.voters
                    .filter(voter => voter.choiceId === choice.id && voter.reason)
                    .map((voter, vIndex) => (
                      <div key={vIndex} className="text-sm text-muted-foreground mt-1 pl-4 border-l-2">
                        "{voter.reason}"
                      </div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
             
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{user?.displayName || user?.email}</span>
          </div>
          <AnimatePresence>
            {!hasVoted && !isPollClosed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
              <Button 
  onClick={() => handleVote(poll.id, selectedChoice)} 
  disabled={selectedChoice === null || isVoting}
>
  {isVoting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
  {isVoting ? 'Submitting...' : 'Submit Vote'}
</Button>
              </motion.div>
            )}
            {hasVoted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Badge variant="success">
                  <Check className="mr-1 h-3 w-3" /> Voted
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Total votes: {totalVotes}
      </div>
    </div>
  )
}



