import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase'; // Import Firestore instance
import { serverTimestamp, collection,arrayUnion,getDoc,where,query,orderBy,limit, getDocs, addDoc, deleteDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { useUser } from './UserContext';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

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

// helper function to format dates safely
const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return 'N/A';
  try {
    return format(new Date(timestamp.seconds * 1000), 'PPP');
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'Invalid Date';
  }
};

// helper function to calculate total votes
const calculateTotalVotes = (choices) => {
  return choices.reduce((total, choice) => total + (choice.votes || 0), 0);
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
      // Ensure deadline is a Firestore Timestamp
      let deadline;
      if (pollData.deadline instanceof Date) {
        deadline = Timestamp.fromDate(pollData.deadline);
      } else if (typeof pollData.deadline === 'string') {
        deadline = Timestamp.fromDate(new Date(pollData.deadline));
      } else if (pollData.deadline instanceof Timestamp) {
        deadline = pollData.deadline;
      } else {
        throw new Error('Invalid deadline format');
      }

      const pollWithTimestamp = {
        ...pollData,
        deadline,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'polls'), pollWithTimestamp);
      await fetchPolls();
      await logAudit(user?.uid, 'create_poll', { pollData });
    } catch (err) {
      console.error("Error creating poll:", err);
      setError('Failed to create poll.');
      throw err;
    }
  };

// update a poll
const updatePoll = async (pollId, updatedData) => {
  try {
    console.log('Starting poll update for:', pollId);
    const pollDoc = doc(db, 'polls', pollId);
    const pollSnap = await getDoc(pollDoc);
    
    if (!pollSnap.exists()) {
      throw new Error('Poll not found');
    }

    const currentPoll = pollSnap.data();
    console.log('Current poll data:', currentPoll);
    
    // Check for duplicate votes if this is a vote update
    if (updatedData.voters && updatedData.voters.length > currentPoll.voters?.length) {
      const newVoter = updatedData.voters[updatedData.voters.length - 1];
      const hasAlreadyVoted = currentPoll.voters?.some(voter => voter.userId === newVoter.userId);
      
      if (hasAlreadyVoted) {
        throw new Error('User has already voted');
      }
    }

    // Create update object with all valid fields
    const updateObject = {
      ...updatedData
    };

    // Convert dates to Timestamps
    if (updateObject.deadline instanceof Date) {
      updateObject.deadline = Timestamp.fromDate(updateObject.deadline);
    }
    if (updateObject.lastUpdated instanceof Date) {
      updateObject.lastUpdated = serverTimestamp();
    }

    // Ensure choices maintain their structure and votes
    if (Array.isArray(updateObject.choices)) {
      updateObject.choices = updateObject.choices.map(choice => ({
        id: choice.id,
        text: choice.text,
        votes: typeof choice.votes === 'number' ? choice.votes : 0
      }));

      // Validate that all choices have proper structure
      const invalidChoice = updateObject.choices.find(
        choice => !choice.id || typeof choice.text !== 'string'
      );
      if (invalidChoice) {
        throw new Error('Invalid choice structure detected');
      }
    }

    console.log('Final update object:', updateObject);

    // Only proceed if we have valid data to update
    if (Object.keys(updateObject).length > 0) {
      await updateDoc(pollDoc, updateObject);
      await logAudit(user?.uid, 'update_poll', { pollId, changes: updateObject });
      await fetchPolls();
      return { success: true };
    }

    return { success: false, error: 'No valid data to update' };
  } catch (err) {
    console.error("Error updating poll:", err);
    setError('Failed to update poll: ' + err.message);
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

  // Export polls data to Excel
  const exportPollsData = async (pollsToExport) => {
    try {
      // Create worksheets for different aspects of the data
      const pollSummaryData = pollsToExport.map(poll => ({
        Question: poll.question,
        'Created At': formatDate(poll.createdAt),
        Status: new Date(poll.deadline?.seconds * 1000) > new Date() ? 'Active' : 'Closed',
        'Total Votes': calculateTotalVotes(poll.choices),
        Deadline: formatDate(poll.deadline),
        Visibility: poll.visibility
      }));

      // Detailed votes worksheet data
      const votesData = [];
      pollsToExport.forEach(poll => {
        poll.choices.forEach(choice => {
          votesData.push({
            Question: poll.question,
            Choice: choice.text,
            'Number of Votes': choice.votes || 0,
            'Vote Percentage': `${((choice.votes || 0) / (calculateTotalVotes(poll.choices) || 1) * 100).toFixed(1)}%`,
            Status: new Date(poll.deadline?.seconds * 1000) > new Date() ? 'Active' : 'Closed',
            'Poll Created': formatDate(poll.createdAt),
            'Poll Deadline': formatDate(poll.deadline)
          });
        });
      });

      // Create a workbook with multiple sheets
      const workbook = XLSX.utils.book_new();
      
      // Add Poll Summary sheet
      const summaryWorksheet = XLSX.utils.json_to_sheet(pollSummaryData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Poll Summary");
      
      // Add Detailed Votes sheet
      const votesWorksheet = XLSX.utils.json_to_sheet(votesData);
      XLSX.utils.book_append_sheet(workbook, votesWorksheet, "Vote Details");

      // Auto-size columns for both sheets
      const summaryRange = XLSX.utils.decode_range(summaryWorksheet['!ref']);
      const votesRange = XLSX.utils.decode_range(votesWorksheet['!ref']);
      
      [
        { sheet: summaryWorksheet, range: summaryRange },
        { sheet: votesWorksheet, range: votesRange }
      ].forEach(({ sheet, range }) => {
        const cols = [];
        for(let C = range.s.c; C <= range.e.c; ++C) {
          let max = 0;
          for(let R = range.s.r; R <= range.e.r; ++R) {
            const cell = sheet[XLSX.utils.encode_cell({r: R, c: C})];
            if(cell && cell.v) max = Math.max(max, String(cell.v).length);
          }
          cols[C] = { wch: max + 2 };
        }
        sheet['!cols'] = cols;
      });

      // Write the workbook to a file
      XLSX.writeFile(workbook, "poll_results.xlsx");

      // Log the export action
      await logAudit(user?.uid, 'export_polls', { 
        count: pollsToExport.length,
        exportType: 'excel'
      });

    } catch (err) {
      console.error("Error exporting polls:", err);
      throw new Error('Failed to export polls data');
    }
  };

  return (
    <PollContext.Provider
      value={{
        polls,
        activePolls,
        loading,
        error,
        fetchPolls,
        fetchActivePolls,
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
        exportPollsData
      }}
    >
      {children}
    </PollContext.Provider>
  );
};

export const usePolls = () => useContext(PollContext);