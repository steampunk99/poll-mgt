import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Loader2, PlusCircle, MinusCircle } from "lucide-react"
import { usePolls } from '@/context/PollContext'
import { useUser } from '@/context/UserContext'

export default function CreatePollPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { createPoll } = usePolls()
  const {user} = useUser();
  const [pollData, setPollData] = useState({
    question: '',
    description: '',
    choices: ['', ''],
    deadline: '',
    status: 'active',
    visibility: 'public',
    createdBy: user?.displayName
  })


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPollData(prev => ({ ...prev, [name]: value }))
  }

  const handleChoiceChange = (index, value) => {
    const newChoices = [...pollData.choices]
    newChoices[index] = value
    setPollData(prev => ({ ...prev, choices: newChoices }))
  }

  const addChoice = () => {
    setPollData(prev => ({ ...prev, choices: [...prev.choices, ''] }))
  }

  const removeChoice = (index) => {
    if (pollData.choices.length > 2) {
      const newChoices = pollData.choices.filter((_, i) => i !== index)
      setPollData(prev => ({ ...prev, choices: newChoices }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (pollData.question && pollData.choices.every(choice => choice !== '') && pollData.deadline) {
      const formattedPollData = {
        ...pollData,
        createdAt: new Date(),
        deadline: new Date(pollData.deadline),
        choices: pollData.choices.map(choice => ({ text: choice, votes: 0 })),
      }

      try {
        await createPoll(formattedPollData)
        toast({
          title: "Success",
          description: "Poll created successfully.",
        })
        navigate('/dashboard/admin')
      } catch (error) {
        console.error("Error creating poll:", error)
        toast({
          title: "Error",
          description: "Failed to create poll. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container  py-8">
      <Card className="w-full max-w-2xl ">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Poll</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                name="question"
                value={pollData.question}
                onChange={handleInputChange}
                required
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={pollData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label>Choices</Label>
              {pollData.choices.map((choice, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    placeholder={`Choice ${index + 1}`}
                    required
                  />
                  {index > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeChoice(index)}>
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={addChoice} variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Another Choice
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                name="deadline"
                type="datetime-local"
                value={pollData.deadline}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={pollData.status === 'active'}
                onCheckedChange={(checked) => setPollData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
              />
              <Label htmlFor="status">Active</Label>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <RadioGroup
                defaultValue={pollData.visibility}
                onValueChange={(value) => setPollData(prev => ({ ...prev, visibility: value }))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? 'Creating...' : 'Create Poll'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}