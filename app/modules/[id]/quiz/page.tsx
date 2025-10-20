"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { DragDropFill } from "@/components/ui/drag-drop-fill"
import { MatchingQuestion } from "@/components/ui/matching-question"
import { OrderQuestion } from "@/components/ui/order-question"
import { Bookmark, Image, ImageOff } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  uniqueId: string
  type: string
  question: string
  answers: string[] | { premises: string[], responses: string[] }
  correctAnswers: any
  imageUrl?: string | null
  createdAt: string
}

interface Module {
  id: string
  title: string
  description: string | null
  isPublic: boolean
}

interface QuizSettings {
  timeLimit: number // in minutes, 0 = no limit
  showAnswers: boolean
  allowMarking: boolean
}

export default function ModuleQuizPage() {
  const params = useParams()
  const router = useRouter()
  const [module, setModule] = useState<Module | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    timeLimit: 0,
    showAnswers: false,
    allowMarking: true
  })
  const [showSettings, setShowSettings] = useState(true)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [showImage, setShowImage] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchModuleData(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (quizSettings.timeLimit > 0 && !showSettings) {
      setTimeLeft(quizSettings.timeLimit * 60)
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quizSettings.timeLimit, showSettings])

  const fetchModuleData = async (moduleId: string) => {
    try {
      setLoading(true)
      
      // Fetch module info
      const moduleResponse = await fetch(`/api/modules/${moduleId}`)
      if (!moduleResponse.ok) throw new Error('Module not found')
      const moduleData = await moduleResponse.json()
      setModule(moduleData)

      // Fetch questions
      const questionsResponse = await fetch(`/api/questions?moduleId=${moduleId}`)
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setQuestions(questionsData.items || [])
      }
    } catch (error) {
      console.error('Error fetching module data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = () => {
    setShowSettings(false)
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const toggleMarkQuestion = (questionId: string) => {
    setMarkedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setShowImage(false) // Reset image visibility when changing questions
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setShowImage(false) // Reset image visibility when changing questions
    }
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    setShowImage(false) // Reset image visibility when changing questions
  }

  const handleSubmit = () => {
    setSubmitted(true)
    // TODO: Submit answers to API
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getQuestionTypeAbbreviation = (type: string) => {
    const typeMap: Record<string, string> = {
      'multiple_choice': 'MC',
      'multiple_response': 'MR', 
      'numerical_question': 'NQ',
      'ordering_question': 'OQ',
      'matching_question': 'MQ',
      'hotspot_question': 'HQ',
      'fill_in_the_blank': 'FB',
      'fallback': 'FB'
    }
    return typeMap[type] || type.toUpperCase()
  }

  const renderQuestion = (question: Question) => {
    const currentAnswer = answers[question.id]
    const isMarked = markedQuestions.has(question.id)

    // Debug: Log question data
    console.log('Question data:', {
      id: question.id,
      type: question.type,
      answers: question.answers,
      answersType: typeof question.answers,
      isArray: Array.isArray(question.answers)
    })

    switch (question.type) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {Array.isArray(question.answers) && question.answers.map((answer: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                  {answer}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'multiple_response':
        return (
          <div className="space-y-2">
            {Array.isArray(question.answers) && question.answers.map((answer: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={Array.isArray(currentAnswer) && currentAnswer.includes(index.toString())}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(currentAnswer) ? currentAnswer : []
                    if (checked) {
                      handleAnswerChange(question.id, [...current, index.toString()])
                    } else {
                      handleAnswerChange(question.id, current.filter((item: string) => item !== index.toString()))
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                  {answer}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'numerical_question':
        return (
          <Input
            type="number"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Nhập số..."
          />
        )

      case 'fill_in_the_blank':
        // Check if question has drag-drop format (contains $1, $2, etc.)
        if (question.question.includes('$') && Array.isArray(question.answers)) {
          return (
            <DragDropFill
              question={question.question}
              answers={question.answers}
              correctAnswers={question.correctAnswers}
              currentAnswer={Array.isArray(currentAnswer) ? currentAnswer : []}
              onAnswerChange={(answers) => handleAnswerChange(question.id, answers)}
            />
          )
        }
        
        // Fallback to simple input for basic fill-in-the-blank
        return (
          <Input
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Điền vào chỗ trống..."
          />
        )

      case 'matching':
      case 'matching_question':
        // Parse matching question data
        let leftItems: string[] = []
        let rightItems: string[] = []
        
        if (Array.isArray(question.answers)) {
          // Old format: single array split in half
          leftItems = question.answers.slice(0, Math.ceil(question.answers.length / 2))
          rightItems = question.answers.slice(Math.ceil(question.answers.length / 2))
        } else if (question.answers && typeof question.answers === 'object') {
          // New format: object with premises and responses
          leftItems = question.answers.premises || []
          rightItems = question.answers.responses || []
        }
        
        const correctMatches: { [key: string]: string } = {}
        
        // Create correct matches from correctAnswers
        if (Array.isArray(question.correctAnswers)) {
          question.correctAnswers.forEach((matchIndex: any, leftIndex: number) => {
            if (leftItems[leftIndex] && rightItems[matchIndex]) {
              correctMatches[`left-${leftIndex}`] = `right-${matchIndex}`
            }
          })
        }

        return (
          <MatchingQuestion
            question={question.question}
            leftItems={leftItems.map((item: string, index: number) => ({ id: `left-${index}`, text: item }))}
            rightItems={rightItems.map((item: string, index: number) => ({ id: `right-${index}`, text: item }))}
            correctMatches={correctMatches}
            currentAnswer={typeof currentAnswer === 'object' ? currentAnswer : {}}
            onAnswerChange={(matches) => handleAnswerChange(question.id, matches)}
          />
        )

      case 'order':
      case 'ordering_question':
        // Parse ordering question data
        const orderItems = Array.isArray(question.answers) ? question.answers : []
        const correctOrder = Array.isArray(question.correctAnswers) ? question.correctAnswers : []
        
        return (
          <OrderQuestion
            question={question.question}
            items={orderItems}
            correctOrder={correctOrder}
            currentOrder={Array.isArray(currentAnswer) ? currentAnswer : orderItems}
            onOrderChange={(orderedItems) => handleAnswerChange(question.id, orderedItems)}
          />
        )

      default:
        // Fallback: Try to render as multiple choice if answers is an array
        if (Array.isArray(question.answers)) {
          return (
            <RadioGroup
              value={currentAnswer}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.answers.map((answer: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                    {answer}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )
        }
        
        return (
          <div className="text-muted-foreground">
            Loại câu hỏi không được hỗ trợ: {question.type}
            <br />
            Answers: {JSON.stringify(question.answers)}
          </div>
        )
    }
  }

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
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No questions found</h1>
          <p className="text-muted-foreground mb-4">
            This module has no questions available for a quiz.
          </p>
          <Button asChild>
            <Link href={`/modules/${params.id}`}>Back to module</Link>
          </Button>
        </div>
      </main>
    )
  }

  if (showSettings) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
              <CardDescription>
                Configure time and options for quiz "{module.title}"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="timeLimit">Time limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="0"
                  value={quizSettings.timeLimit}
                  onChange={(e) => setQuizSettings(prev => ({
                    ...prev,
                    timeLimit: parseInt(e.target.value) || 0
                  }))}
                  placeholder="0 = no time limit"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showAnswers"
                  checked={quizSettings.showAnswers}
                  onCheckedChange={(checked) => setQuizSettings(prev => ({
                    ...prev,
                    showAnswers: !!checked
                  }))}
                />
                <Label htmlFor="showAnswers">Show correct answers</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowMarking"
                  checked={quizSettings.allowMarking}
                  onCheckedChange={(checked) => setQuizSettings(prev => ({
                    ...prev,
                    allowMarking: !!checked
                  }))}
                />
                <Label htmlFor="allowMarking">Allow marking questions</Label>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Quiz info:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Total questions: {questions.length}</li>
                  <li>• Time: {quizSettings.timeLimit === 0 ? 'No limit' : `${quizSettings.timeLimit} minutes`}</li>
                  <li>• Can go back to previous question</li>
                  <li>• Can mark questions to review</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button onClick={startQuiz} className="flex-1">
                  Start quiz
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/modules/${params.id}`}>Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Completed!</CardTitle>
              <CardDescription>
                You have submitted the quiz successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-lg">
                Answered: {Object.keys(answers).length}/{questions.length} questions
              </div>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href={`/modules/${params.id}`}>Back to module</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/modules">See other modules</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).length
  const markedCount = markedQuestions.size

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{module.title}</h1>
            {quizSettings.timeLimit > 0 && (
              <div className="text-lg font-mono bg-muted px-3 py-1 rounded">
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Answered: {answeredCount}/{questions.length}</span>
            {quizSettings.allowMarking && (
              <span>Marked: {markedCount}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question list</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                  {questions.map((question, index) => (
                    <Button
                      key={question.id}
                      variant={
                        index === currentQuestionIndex 
                          ? "default" 
                          : answers[question.id] 
                            ? "secondary" 
                            : "outline"
                      }
                      size="sm"
                      onClick={() => goToQuestion(index)}
                      className="relative"
                    >
                      {index + 1}
                      {markedQuestions.has(question.id) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
                      )}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  <div>• White: Not answered</div>
                  <div>• Gray: Answered</div>
                  <div>• Blue: In progress</div>
                  <div>• Yellow dot: Marked</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Question {currentQuestionIndex + 1} / {questions.length}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {currentQuestion.question}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                      {getQuestionTypeAbbreviation(currentQuestion.type)}
                    </span>
                    {currentQuestion.imageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowImage(!showImage)}
                        className={`p-2 ${
                          showImage 
                            ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
                            : 'hover:bg-gray-100'
                        }`}
                        title={showImage ? 'Hide image' : 'Show image'}
                      >
                        {showImage ? <ImageOff className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                      </Button>
                    )}
                    {quizSettings.allowMarking && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMarkQuestion(currentQuestion.id)}
                        className={`p-2 ${
                          markedQuestions.has(currentQuestion.id) 
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200' 
                            : 'hover:bg-gray-100'
                        }`}
                        title={markedQuestions.has(currentQuestion.id) ? 'Bỏ đánh dấu' : 'Đánh dấu'}
                      >
                        <Bookmark 
                          className={`h-4 w-4 ${
                            markedQuestions.has(currentQuestion.id) ? 'fill-current' : ''
                          }`} 
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Show image if toggle is on and imageUrl exists */}
                  {showImage && currentQuestion.imageUrl && (
                    <div className="mb-4">
                      <img 
                        src={currentQuestion.imageUrl} 
                        alt="Question image" 
                        className="max-w-full h-auto rounded-lg border shadow-sm"
                        onError={(e) => {
                          console.error('Failed to load image:', currentQuestion.imageUrl)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  {renderQuestion(currentQuestion)}
                  
                  {quizSettings.showAnswers && currentQuestion.correctAnswers && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-800 mb-1">Correct answer:</div>
                      <div className="text-sm text-green-700">
                        {JSON.stringify(currentQuestion.correctAnswers)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6 gap-4">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="whitespace-nowrap min-w-fit"
              >
                ← Previous
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button 
                    onClick={nextQuestion}
                    className="whitespace-nowrap min-w-fit"
                  >
                    Next →
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    className="bg-green-600 hover:bg-green-700 whitespace-nowrap min-w-fit"
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Legend Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Question types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">MC</span>
                      <span>Multiple Choice</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">MR</span>
                      <span>Multiple Response</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">NQ</span>
                      <span>Numerical Question</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">OQ</span>
                      <span>Ordering Question</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">MQ</span>
                      <span>Matching Question</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">HQ</span>
                      <span>Hotspot Question</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">FB</span>
                      <span>Fill in the Blank</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}