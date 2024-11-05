import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase'; // Import Firestore instance
import { serverTimestamp, collection,arrayUnion,getDoc,where,query,orderBy,limit, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
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
  try {
    console.log('Fetching active polls...'); // Debug log
    const pollsQuery = query(
      collection(db, 'polls'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(6)
    );
    
    const querySnapshot = await getDocs(pollsQuery);
    const fetchedPolls = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('Fetched active polls:', fetchedPolls); // Debug log
    setActivePolls(fetchedPolls); // Set the state
    return fetchedPolls; // Return the polls
    
  } catch (err) {
    console.error("Error fetching active polls:", err);
    setError('Failed to load active polls.');
    return []; // Return empty array on error
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

// update a poll
const updatePoll = async (pollId, updatedData) => {
  try {
    const pollDoc = doc(db, 'polls', pollId);
    const pollSnap = await getDoc(pollDoc);
    
    if (!pollSnap.exists()) {
      throw new Error('Poll not found');
    }

    const currentPoll = pollSnap.data();
    
    // Check for duplicate votes if this is a vote update
    if (updatedData.voters) {
      const newVoter = updatedData.voters[updatedData.voters.length - 1];
      const hasAlreadyVoted = currentPoll.voters?.some(voter => voter.userId === newVoter.userId);
      
      if (hasAlreadyVoted) {
        throw new Error('User has already voted');
      }
    }

    // Rest of the function remains the same...
    const updateObject = {};
    if (Array.isArray(updatedData.choices)) {
      updateObject.choices = updatedData.choices;
    }
    if (Array.isArray(updatedData.voters)) {
      updateObject.voters = updatedData.voters;
    }
    // ... rest of the function

    // Add timestamp
    updateObject.lastUpdated = serverTimestamp();

    // Remove any undefined values
    Object.keys(updateObject).forEach(key => {
      if (updateObject[key] === undefined) {
        delete updateObject[key];
      }
    });

    // Only proceed if we have valid data to update
    if (Object.keys(updateObject).length > 0) {
      await updateDoc(pollDoc, updateObject);
      await logAudit(user?.uid, 'update_poll', { pollId });
      await fetchPolls();
      return { success: true };
    }

    return { success: false, error: 'No valid data to update' };
  } catch (err) {
    console.error("Error updating poll:", err);
    setError('Failed to update poll.');
    throw err;
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
      const pollRef = doc(db, 'polls', pollId);
      await updateDoc(pollRef, { 
        status: 'closed',
        closedAt: serverTimestamp()
      });
      await logAudit(user?.uid, 'close_poll', { pollId });
      // Refresh polls after closing
      await fetchPolls();
    } catch (err) {
      console.error("Error closing poll:", err);
      setError('Failed to close poll.');
      throw err;
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


  const votePoll = async (pollId, choiceId, userId) => {
    try {
      // Get user document to check role
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const pollRef = doc(db, 'polls', pollId);
      const pollSnap = await getDoc(pollRef);
      const pollData = pollSnap.data();
      
      if (!userSnap.exists()) {
        throw new Error("User not found");
      }
  
      const userData = userSnap.data();
      
      // Check if user is admin
      if (userData.role === 'admin') {
        throw new Error("Administrators are not allowed to vote");
      }
  
      // Check if user is active
      if (!userData.isActive) {
        throw new Error("Your account is currently inactive");
      }
  
      if (!pollSnap.exists()) {
        throw new Error("Poll not found");
      }
  
      // Check poll visibility
      if (pollData.visibility === 'private') {
        throw new Error("This poll is not currently available for voting");
      }
  
      // Check if poll is still active
      const now = new Date();
      const deadline = pollData.deadline.toDate();
      
      if (now > deadline) {
        throw new Error("This poll has expired");
      }
  
      // Check if the user has already voted
      if (pollData.voters && pollData.voters.includes(userId)) {
        throw new Error("You have already voted on this poll");
      }
  
      // Validate that the choice exists in the poll
      const choiceExists = pollData.choices.some(choice => choice.id === choiceId);
      if (!choiceExists) {
        throw new Error("Invalid choice selected");
      }
  
      // Update the votes for the selected choice
     // Create a voter entry with both ID and choice
     const voterEntry = {
      userId: userId,
      choiceId: choiceId,
      votedAt: serverTimestamp()
    };

    // Update the votes for the selected choice
    const updatedChoices = pollData.choices.map(choice => 
      choice.id === choiceId ? { ...choice, votes: (choice.votes || 0) + 1 } : choice
    );

    // Update the poll document with both the choices and voter info
    const updateObject = {
      choices: updatedChoices,
      voters: arrayUnion(voterEntry), // Store full voter info instead of just ID
      lastVoteAt: serverTimestamp()
    };

    await updateDoc(pollRef, updateObject);
  
      return {
        success: true,
        message: "Vote recorded successfully"
      };
  
    } catch (error) {
      // Add custom error handling here if needed
      throw error;
    }
  };

  // New functionality: Get user's polls
  const getUserPolls = async (userId) => {
    try {
      const q = query(
        collection(db, 'polls'),
        where("voters", "array-contains", userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error("Error fetching user's polls:", err);
      setError('Failed to fetch user\'s polls.');
      return [];
    }
  };

  // New functionality: Get poll results
  const getPollResults = async (pollId) => {
    try {
      const pollRef = doc(db, 'polls', pollId);
      const pollSnap = await getDoc(pollRef);
      
      if (!pollSnap.exists()) {
        return {};
      }
  
      const pollData = pollSnap.data();
      // Create a results object mapping choice IDs to their vote counts
      const results = {};
      pollData.choices.forEach(choice => {
        results[choice.id] = choice.votes || 0;
      });
  
      return results;
    } catch (err) {
      console.error("Error fetching poll results:", err);
      setError('Failed to fetch poll results.');
      return {};
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
        activePolls,
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

  