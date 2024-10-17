// src/pages/EditPoll.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { Loader2 } from "lucide-react";

const EditPoll = () => {
  const { pollId } = useParams(); // Get pollId from the route parameters
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState(['', '']); // Initialize with two empty choices
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const pollDoc = doc(db, 'polls', pollId);
        const pollSnapshot = await getDoc(pollDoc);
        if (pollSnapshot.exists()) {
          const data = pollSnapshot.data();
          setPoll(data);
          setQuestion(data.question);
          setChoices(data.choices.map(choice => choice.text));
          setDeadline(data.deadline.toDate().toISOString().split('T')[0]); // Format to YYYY-MM-DD
        } else {
          toast({
            title: "Error",
            description: "Poll not found.",
            variant: "destructive",
          });
          navigate('/managepolls'); // Navigate back to manage polls if not found
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch poll data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [pollId, navigate, toast]);

  const handleUpdatePoll = async () => {
    if (!question && !deadline) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive",
      });
      return;
    }

    const updatedPoll = {
      question,
      choices: choices.map(text => ({ text, votes: 0 })), // Reset votes to 0
      deadline: new Date(deadline).getTime() / 1000, // Convert to Firestore timestamp format
    };

    try {
      const pollRef = doc(db, 'polls', pollId);
      await updateDoc(pollRef, updatedPoll);
      toast({
        title: "Success",
        description: "Poll updated successfully.",
      });
      navigate('/managepolls'); // Navigate back after updating
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update poll. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Poll</h1>
      <div className="mb-4">
        <label className="block mb-2">Question</label>
        <input 
          type="text" 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Choices</label>
        {choices.map((choice, index) => (
          <input 
            key={index}
            type="text" 
            value={choice}
            onChange={(e) => {
              const updatedChoices = [...choices];
              updatedChoices[index] = e.target.value;
              setChoices(updatedChoices);
            }}
            className="border p-2 w-full mb-2"
            placeholder={`choice ${index + 1}`}


          />
        ))}
        <button 
          onClick={() => setChoices([...choices, ''])} 
          className="btn-primary"
        >
          Add Choice
        </button>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Deadline</label>
        <input 
          type="date" 
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <Button onClick={handleUpdatePoll} className="mt-4">
        Update Poll
      </Button>
    </div>
  );
};

export default EditPoll;
