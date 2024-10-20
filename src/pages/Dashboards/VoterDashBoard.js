import React, { useState, useEffect } from 'react';
import { usePolls } from '../../context/PollContext';
import { useUser } from '../../context/UserContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  SortAsc, 
  BarChart,
  Calendar,
  Users
} from 'lucide-react';

const VoterDashboard = () => {
  const { user } = useUser();
  const { polls, loading, error, getPollResults } = usePolls();
  const [votedPolls, setVotedPolls] = useState([]);
  const [activePolls, setActivePolls] = useState([]);
  const [expiredPolls, setExpiredPolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedPollResults, setSelectedPollResults] = useState(null);
  const [displayedPolls, setDisplayedPolls] = useState({
    active: [],
    voted: [],
    expired: []
  });

  useEffect(() => {
    if (!polls || !user) return;
    categorizePollsForUser();
  }, [polls, user]);

  const categorizePollsForUser = () => {
    const now = new Date();
    
    const categorizedPolls = polls.reduce((acc, poll) => {
      const hasVoted = poll.votes?.some(vote => vote.userId === user.uid);
      const deadline = poll.deadline?.toDate();
      const isExpired = deadline && deadline < now;
      const enrichedPoll = {
        ...poll,
        participantCount: (poll.votes || []).length,
        daysRemaining: deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : null
      };

      if (hasVoted) {
        acc.voted.push({ 
          ...enrichedPoll, 
          votedAt: poll.votes.find(v => v.userId === user.uid).timestamp 
        });
      } else if (isExpired) {
        acc.expired.push(enrichedPoll);
      } else {
        acc.active.push(enrichedPoll);
      }
      return acc;
    }, { voted: [], active: [], expired: [] });

    setVotedPolls(categorizedPolls.voted);
    setActivePolls(categorizedPolls.active);
    setExpiredPolls(categorizedPolls.expired);
    setDisplayedPolls({
      active: categorizedPolls.active,
      voted: categorizedPolls.voted,
      expired: categorizedPolls.expired
    });
  };

  useEffect(() => {
    const filterAndSortPolls = (pollsList) => {
      let filtered = pollsList.filter(poll => 
        poll.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poll.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      switch (sortBy) {
        case 'date':
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'participants':
          filtered.sort((a, b) => b.participantCount - a.participantCount);
          break;
        case 'deadline':
          filtered.sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
          });
          break;
      }

      return filtered;
    };

    setDisplayedPolls({
      active: filterAndSortPolls(activePolls),
      voted: filterAndSortPolls(votedPolls),
      expired: filterAndSortPolls(expiredPolls)
    });
  }, [searchTerm, sortBy, activePolls, votedPolls, expiredPolls]);

  const PollResults = ({ poll }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchResults = async () => {
        const pollResults = await getPollResults(poll.id);
        setResults(pollResults);
        setLoading(false);
      };
      fetchResults();
    }, [poll.id]);

    if (loading) return <div className="text-center p-4">Loading results...</div>;

    const totalVotes = Object.values(results || {}).reduce((a, b) => a + b, 0);

    return (
      <div className="p-4">
        <h3 className="font-semibold mb-4">Results</h3>
        {poll.choices?.map(choice => {
          const voteCount = results?.[choice.id] || 0;
          const percentage = totalVotes ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
          
          return (
            <div key={choice.id} className="mb-4">
              <div className="flex justify-between mb-1">
                <span>{choice.text}</span>
                <span>{percentage}% ({voteCount} votes)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="mt-4 text-sm text-gray-500">
          Total votes: {totalVotes}
        </div>
      </div>
    );
  };

  const PollCard = ({ poll, status }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{poll.question}</CardTitle>
          <div className="flex gap-2">
            <Badge className={`
              ${status === 'voted' ? 'bg-green-500' : ''}
              ${status === 'active' ? 'bg-blue-500' : ''}
              ${status === 'expired' ? 'bg-red-500' : ''}
            `}>
              {status === 'voted' && <CheckCircle className="w-4 h-4 mr-1" />}
              {status === 'active' && <Clock className="w-4 h-4 mr-1" />}
              {status === 'expired' && <AlertCircle className="w-4 h-4 mr-1" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart className="w-4 h-4 mr-1" />
                  Results
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{poll.question} - Results</DialogTitle>
                </DialogHeader>
                <PollResults poll={poll} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{poll.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {status === 'voted' && (
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Voted on: {new Date(poll.votedAt).toLocaleDateString()}
            </div>
          )}
          {poll.deadline && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {status === 'active' ? 
                `Closes in ${poll.daysRemaining} days` : 
                `Closed on ${new Date(poll.deadline).toLocaleDateString()}`
              }
            </div>
          )}
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {poll.participantCount} participants
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FilterBar = () => (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search polls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          prefix={<Search className="w-4 h-4" />}
        />
      </div>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px]">
          <SortAsc className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date Created</SelectItem>
          <SelectItem value="participants">Participants</SelectItem>
          <SelectItem value="deadline">Deadline</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (loading) return <div className="text-center p-4">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="max-w-4xl p-4">
      <h1 className="text-2xl font-bold mb-6">Polls</h1>
      
      <FilterBar />
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Active Polls ({displayedPolls.active.length})
          </TabsTrigger>
          <TabsTrigger value="voted">
            Your Votes ({displayedPolls.voted.length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired ({displayedPolls.expired.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {displayedPolls.active.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm ? 'No matching active polls found' : 'No active polls available'}
            </p>
          ) : (
            displayedPolls.active.map(poll => (
              <PollCard key={poll.id} poll={poll} status="active" />
            ))
          )}
        </TabsContent>

        <TabsContent value="voted">
          {displayedPolls.voted.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm ? 'No matching voted polls found' : 'You haven\'t voted in any polls yet'}
            </p>
          ) : (
            displayedPolls.voted.map(poll => (
              <PollCard key={poll.id} poll={poll} status="voted" />
            ))
          )}
        </TabsContent>

        <TabsContent value="expired">
          {displayedPolls.expired.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm ? 'No matching expired polls found' : 'No expired polls'}
            </p>
          ) : (
            displayedPolls.expired.map(poll => (
              <PollCard key={poll.id} poll={poll} status="expired" />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoterDashboard;