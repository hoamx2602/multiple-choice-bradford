"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
}

export default function CreateQuizPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    }
  ])

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    router.push("/sign-in")
    return null
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: (questions.length + 1).toString(),
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map((opt, idx) => 
              idx === optionIndex ? value : opt
            )
          }
        : q
    ))
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement save to database
    console.log("Quiz data:", { quizTitle, quizDescription, questions })
    alert("Quiz saved successfully!")
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create new Quiz</h1>
          <p className="text-muted-foreground">
            Create a multiple-choice quiz with questions and answers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quiz Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz information</CardTitle>
              <CardDescription>
                Enter a title and description for your quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Enter quiz title..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  placeholder="Short description about the quiz..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Questions</h2>
              <Button type="button" onClick={addQuestion}>
                Add question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      Question {index + 1}
                    </CardTitle>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`question-${question.id}`}>
                      Question content *
                    </Label>
                    <Textarea
                      id={`question-${question.id}`}
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                      placeholder="Enter question content..."
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Options *</Label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() => updateQuestion(question.id, "correctAnswer", optionIndex)}
                          className="w-4 h-4"
                        />
                        <Input
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}...`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/quiz">Cancel</Link>
            </Button>
            <Button type="submit">
              Save Quiz
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}