import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase'; // Import Firestore instance
import { collection,arrayUnion,getDoc,where,query,orderBy,limit, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { useUser } from './UserContext';


// Create PollContext
const PollContext = createContext();

// audit trail
// Log actions to Firestore
const logAudit = async (userId, action, details = {}) => {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      userId,
      action,
      timestamp: new Date(),
      details
    });
    
  } catch (err) {
    console.error("Error logging audit action:", err);
  }
};

// Provider component
export const PollProvider = ({ children }) => {
  const [polls, setPolls] = useState([]);
  const [activePolls, setActivePolls] = useState([]); // New state for active polls
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  // New function to fetch active polls
 const fetchActivePolls = async () => {
  setLoading(true);
  try {
    // Query for public polls, ordered by creation date
    const pollsQuery = query(
      collection(db, 'polls'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    
    const querySnapshot = await getDocs(pollsQuery);
    const fetchedPolls = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('Fetched polls from Firestore:', fetchedPolls); // Debug log

    // Filter active polls
    const now = new Date();
    const currentActivePolls = fetchedPolls.filter(poll => {
      if (!poll.deadline) return true; // Include polls without deadline
      const deadline = poll.deadline?.toDate();
      return deadline > now;
    });

    console.log('Active polls after filtering:', currentActivePolls); // Debug log
    setActivePolls(currentActivePolls);
    setError(null);
  } catch (err) {
    console.error("Error fetching active polls:", err);
    setError('Failed to load active polls.');
  } finally {
    setLoading(false);
  }
};

  // Fetch polls from Firestore
  const fetchPolls = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'polls'));
      const pollsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPolls(pollsArray);
      setError(null);
    } catch (err) {
      console.error("Error fetching polls:", err);
      setError('Failed to load polls.');
    } finally {
      setLoading(false);
    }
  };

  // Add a new poll
  const createPoll = async (pollData) => {
    try {
      await addDoc(collection(db, 'polls'), pollData);
      fetchPolls();
      await logAudit(user?.uid, 'create_poll', { pollData });
    } catch (err) {
      console.error("Error creating poll:", err);
      setError('Failed to create poll.');
    }
  };

  // Update a poll
  const updatePoll = async (pollId, updatedData) => {
    try {
      const pollDoc = doc(db, 'polls', pollId);
      await updateDoc(pollDoc, updatedData);
      await logAudit(user?.uid, 'update_poll', { updatedData });
      fetchPolls();
    } catch (err) {
      console.error("Error updating poll:", err);
      setError('Failed to update poll.');
    }
  };

  // Delete a poll
  const deletePoll = async (pollId) => {
    try {
      await deleteDoc(doc(db, 'polls', pollId));
      await logAudit(user?.uid, 'delete_poll', { pollId });
      fetchPolls();
    } catch (err) {
      console.error("Error deleting poll:", err);
      setError('Failed to delete poll.');
    }
  };

  // Close a poll (change status to closed)
  const closePoll = async (pollId) => {
    try {
      await updatePoll(pollId, { status: 'closed' });
      await logAudit(user?.uid, 'close_poll', { pollId });
    } catch (err) {
      console.error("Error closing poll:", err);
      setError('Failed to close poll.');
    }
  };

  // Toggle poll visibility (e.g., draft or published)
  const togglePollVisibility = async (pollId, currentVisibility) => {
    try {
      const newVisibility = currentVisibility === 'public' ? 'draft' : 'public';
      await updatePoll(pollId, { visibility: newVisibility });
    } catch (err) {
      console.error("Error toggling visibility:", err);
      setError('Failed to toggle poll visibility.');
    }
  };

  // Get poll statistics (calculate total votes)
  const getPollStatistics = (pollId) => {
    const poll = polls.find((p) => p.id === pollId);
    if (!poll || !poll.choices) return { totalVotes: 0, choices: [] };

    const totalVotes = poll.choices.reduce((acc, choice) => acc + choice.votes, 0);
    return {
      totalVotes,
      choices: poll.choices.map((choice) => ({
        name: choice.name,
        votes: choice.votes,
        percentage: totalVotes ? (choice.votes / totalVotes) * 100 : 0,
      })),
    };
  };

  // Use effect to fetch polls on component mount
  useEffect(() => {
    fetchPolls();
  }, []);


  // // New functionality: Vote on a poll
  // const votePoll = async (pollId, choiceId, userId) => {
  //   try {
  //     const pollRef = doc(db, 'polls', pollId);
  //     const choiceRef = doc(pollRef, 'choices', choiceId);
      
  //     await updateDoc(choiceRef, {
  //       votes: increment(1)
  //     });

  //     // Record the user's vote
  //     await addDoc(collection(db, 'votes'), {
  //       pollId,
  //       choiceId,
  //       userId,
  //       timestamp: new Date()
  //     });

  //     await logAudit(userId, 'vote', { pollId, choiceId });
  //     fetchPolls();
  //   } catch (err) {
  //     console.error("Error voting on poll:", err);
  //     setError('Failed to vote on poll.');
  //   }
  // };

  const votePoll = async (pollId, choiceId, userId) => {
    const pollRef = doc(db, 'polls', pollId);
    const pollSnap = await getDoc(pollRef);
  
    if (pollSnap.exists()) {
      const pollData = pollSnap.data();
  
      // Check if the user has already voted
      if (pollData.voters && pollData.voters.includes(userId)) {
        throw new Error("User has already voted on this poll.");
      }
  
      // Update the votes for the selected choice
      const updatedChoices = pollData.choices.map(choice => 
        choice.id === choiceId ? { ...choice, votes: choice.votes + 1 } : choice
      );
  
      // Add the user ID to the voters list
      await updateDoc(pollRef, {
        choices: updatedChoices,
        voters: arrayUnion(userId) // Add the user ID to the array of voters
      });
    } else {
      throw new Error("Poll not found");
    }
  };
  


  // New functionality: Get user's polls
  const getUserPolls = async (userId) => {
    try {
      const q = query(collection(db, 'polls'), where("createdBy", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching user's polls:", err);
      setError('Failed to fetch user\'s polls.');
    }
  };

  // New functionality: Get poll results
  const getPollResults = async (pollId) => {
    try {
      const pollRef = doc(db, 'polls', pollId);
      const votesSnapshot = await getDocs(collection(pollRef, 'votes'));
      const votes = votesSnapshot.docs.map(doc => doc.data());
      
      // Process votes and return results
      // This is a simple implementation; you might want to add more complex analysis
      const results = votes.reduce((acc, vote) => {
        acc[vote.choiceId] = (acc[vote.choiceId] || 0) + 1;
        return acc;
      }, {});

      return results;
    } catch (err) {
      console.error("Error fetching poll results:", err);
      setError('Failed to fetch poll results.');
    }
  };

  // New functionality: Search polls
  const searchPolls = async (searchTerm) => {
    try {
      // Note: This is a simple implementation. For more complex search,
      // you might want to use a dedicated search service like Algolia
      const querySnapshot = await getDocs(collection(db, 'polls'));
      const searchResults = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(poll => 
          poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          poll.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return searchResults;
    } catch (err) {
      console.error("Error searching polls:", err);
      setError('Failed to search polls.');
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <PollContext.Provider
      value={{
        polls,
        loading,
        error,
        fetchPolls,
        createPoll,
        updatePoll,
        deletePoll,
        closePoll,
        togglePollVisibility,
        getPollStatistics,
        votePoll,
        getUserPolls,
        getPollResults,
        searchPolls,
        fetchActivePolls,
        
      }}
    >
      {children}
    </PollContext.Provider>
  );
};

export const usePolls = () => useContext(PollContext);

  