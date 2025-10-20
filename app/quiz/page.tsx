"use client"

import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthSignInButton } from "@/components/auth/sign-in-button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

interface Module {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  createdAt: string
  _count: {
    questions: number
  }
}

interface Question {
  id: string
  uniqueId: string
  type: string
  question: string
  answers: any
  correctAnswers: any
  imageUrl?: string | null
  createdAt: string
}

export default function QuizListPage() {
  const { isSignedIn, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const moduleId = searchParams.get('module')
  
  const [module, setModule] = useState<Module | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (moduleId) {
      fetchModuleQuiz(moduleId)
    }
  }, [moduleId])

  const fetchModuleQuiz = async (id: string) => {
    try {
      setLoading(true)
      
      // Fetch module info
      const moduleResponse = await fetch(`/api/modules/${id}`)
      if (moduleResponse.ok) {
        const moduleData = await moduleResponse.json()
        setModule(moduleData)
      }

      // Fetch questions
      const questionsResponse = await fetch(`/api/questions?moduleId=${id}`)
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setQuestions(questionsData.items || [])
      }
    } catch (error) {
      console.error('Error fetching module quiz:', error)
    } finally {
      setLoading(false)
    }
  }

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
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Sign-in required</h1>
          <p className="text-muted-foreground mb-8">
            You need to sign in to view the quiz list
          </p>
          <AuthSignInButton />
        </div>
      </main>
    )
  }

  // If moduleId is provided, show module-specific quiz
  if (moduleId) {
    if (loading) {
      return (
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      )
    }

    if (!module || questions.length === 0) {
      return (
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Quiz not found</h1>
            <p className="text-muted-foreground mb-8">
              This module has no questions available for a quiz.
            </p>
            <Button asChild>
              <Link href="/modules">Back to modules list</Link>
            </Button>
          </div>
        </main>
      )
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Module Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" asChild>
                <Link href={`/modules/${module.id}`}>← Back to module</Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
            <p className="text-muted-foreground text-lg">
              {module.description || 'Take a quiz to test your knowledge'}
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              {questions.length} questions • Created {new Date(module.createdAt).toLocaleDateString('en-US')}
            </div>
          </div>

          {/* Quiz Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Basic quiz</CardTitle>
                <CardDescription>
                  Answer all {questions.length} questions in order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    • No time limit<br/>
                    • Can go back to previous question<br/>
                    • Show results immediately
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/modules/${module.id}/quiz`}>Start</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Timed quiz</CardTitle>
                <CardDescription>
                  Take the quiz with a time limit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    • 30 minutes<br/>
                    • Auto-submit when time is up<br/>
                    • Time pressure
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/modules/${module.id}/quiz?timed=true`}>Start timed</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Preview questions</CardTitle>
                <CardDescription>
                  View all questions before taking the quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    • View all questions<br/>
                    • No need to answer<br/>
                    • Prepare before testing
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/modules/${module.id}`}>Preview</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  // Default quiz list (when no moduleId)
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quiz list</h1>
            <p className="text-muted-foreground mt-2">
              Choose a quiz to start the challenge
            </p>
          </div>
          <Button asChild>
            <Link href="/quiz/create">Create new Quiz</Link>
          </Button>
        </div>

        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Choose a module to take a quiz</h3>
          <p className="text-muted-foreground mb-4">
            To take a quiz, select a module from the list of modules
          </p>
          <Button asChild>
            <Link href="/modules">View modules list</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}