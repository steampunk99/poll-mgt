// src/pages/EditPoll.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "../../hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { usePolls } from '@/context/PollContext';
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Form validation schema
const formSchema = z.object({
  question: z.string().min(1, "Question is required"),
  choices: z.array(z.string()).min(2, "At least two choices are required"),
  deadline: z.string().min(1, "Deadline is required"),
});

const EditPoll = () => {
  const { pollId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePoll } = usePolls();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      choices: ["", ""],
      deadline: "",
    },
  });

  // Fetch poll data
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const pollDoc = doc(db, 'polls', pollId);
        const pollSnapshot = await getDoc(pollDoc);
        if (pollSnapshot.exists()) {
          const data = pollSnapshot.data();
          form.reset({
            question: data.question,
            choices: data.choices.map(choice => choice.text),
            deadline: data.deadline.toDate().toISOString().split('T')[0],
          });
        } else {
          toast({
            title: "Poll not found",
            description: "The requested poll could not be found.",
            variant: "destructive",
          });
          navigate('dashboard/managepolls');
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch poll data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [pollId, navigate, toast, form]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const pollDoc = doc(db, 'polls', pollId);
      const pollSnapshot = await getDoc(pollDoc);
      const currentPoll = pollSnapshot.data();
      
      console.log('Current poll data:', currentPoll);
      console.log('Form data:', data);

      // Map new choices while preserving existing data
      const updatedChoices = data.choices.map((text, index) => {
        // First try to find an existing choice with the same index
        const existingChoice = currentPoll.choices[index];
        
        if (existingChoice && existingChoice.text === text) {
          // If text matches at same index, preserve everything
          return existingChoice;
        }
        
        // If text changed at this index, look for the text elsewhere
        const matchingChoice = currentPoll.choices.find(c => c.text === text);
        if (matchingChoice) {
          // If we found the text elsewhere, preserve its data
          return matchingChoice;
        }
        
        // If this is a new choice, create new entry
        return {
          id: `choice-${index}`,
          text: text,
          votes: 0
        };
      });

      // Update voter references if needed
      const updatedVoters = (currentPoll.voters || []).map(voter => {
        // Find the original choice this voter voted for
        const originalChoice = currentPoll.choices.find(c => c.id === voter.choiceId);
        if (!originalChoice) return voter;

        // Find where this choice text exists in the updated choices
        const newChoice = updatedChoices.find(c => c.text === originalChoice.text);
        if (!newChoice) return voter;

        // Update the voter's choiceId if it changed
        return {
          ...voter,
          choiceId: newChoice.id
        };
      });

      const updatedPoll = {
        question: data.question,
        choices: updatedChoices,
        voters: updatedVoters,
        deadline: new Date(data.deadline),
        description: currentPoll.description || '',
        lastUpdated: new Date(),
        createdBy: currentPoll.createdBy,
        createdAt: currentPoll.createdAt,
        status: currentPoll.status || 'active',
        visibility: currentPoll.visibility || 'public'
      };

      console.log('Updating poll with:', updatedPoll);

      const result = await updatePoll(pollId, updatedPoll);
      console.log('Update result:', result);
      
      toast({
        title: "Success",
        description: "Poll updated successfully.",
      });
      navigate('/dashboard/managepolls');
    } catch (err) {
      console.error("Error updating poll:", err);
      toast({
        title: "Error",
        description: "Failed to update poll: " + (err.message || "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddChoice = () => {
    const currentChoices = form.getValues("choices");
    if (currentChoices.length < 6) {
      form.setValue("choices", [...currentChoices, ""]);
    } else {
      toast({
        title: "Maximum Choices Reached",
        description: "You can only add up to 6 choices.",
        variant: "warning",
      });
    }
  };

  const handleRemoveChoice = (index) => {
    const currentChoices = form.getValues("choices");
    if (currentChoices.length > 2) {
      const newChoices = currentChoices.filter((_, i) => i !== index);
      form.setValue("choices", newChoices);
    } else {
      toast({
        title: "Minimum Choices Required",
        description: "A poll must have at least 2 choices.",
        variant: "warning",
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
    <div className="container max-w-4xl ml-0 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Poll</CardTitle>
          <CardDescription>
            Update your poll details below. All fields are required.
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your poll question" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Choices</FormLabel>
                {form.watch("choices").map((_, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`choices.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder={`Choice ${index + 1}`} {...field} />
                          </FormControl>
                          {form.watch("choices").length > 2 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => handleRemoveChoice(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddChoice}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Choice
                </Button>
              </div>

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Select the date when this poll will close.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('dashboard/managepolls')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default EditPoll;
