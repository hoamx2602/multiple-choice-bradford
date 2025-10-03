"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// Mock data - trong thực tế sẽ lấy từ database
const mockQuiz = {
  id: "1",
  title: "Kiến thức JavaScript cơ bản",
  description: "Test kiến thức JavaScript của bạn với 10 câu hỏi",
  questions: [
    {
      id: "1",
      text: "JavaScript là gì?",
      options: [
        "Một ngôn ngữ lập trình",
        "Một framework",
        "Một thư viện",
        "Một database"
      ],
      correctAnswer: 0
    },
    {
      id: "2", 
      text: "Cú pháp nào đúng để khai báo biến trong JavaScript?",
      options: [
        "var name = 'John'",
        "let name = 'John'",
        "const name = 'John'",
        "Tất cả đều đúng"
      ],
      correctAnswer: 3
    },
    {
      id: "3",
      text: "Phương thức nào dùng để thêm phần tử vào cuối mảng?",
      options: [
        "push()",
        "pop()",
        "shift()",
        "unshift()"
      ],
      correctAnswer: 0
    }
  ]
}

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < mockQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateScore()
      setShowResults(true)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    mockQuiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++
      }
    })
    setScore(correct)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setShowResults(false)
    setScore(0)
  }

  if (showResults) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Kết quả Quiz</CardTitle>
              <CardDescription>
                Bạn đã hoàn thành bài quiz: {mockQuiz.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="text-6xl font-bold text-primary">
                {score}/{mockQuiz.questions.length}
              </div>
              <div className="text-2xl">
                {score === mockQuiz.questions.length ? "🎉 Xuất sắc!" : 
                 score >= mockQuiz.questions.length * 0.8 ? "👍 Tốt lắm!" :
                 score >= mockQuiz.questions.length * 0.6 ? "👌 Khá ổn!" : "💪 Cần cố gắng thêm!"}
              </div>
              <div className="space-y-2">
                <Button onClick={resetQuiz} className="mr-4">
                  Làm lại
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/quiz">Danh sách Quiz</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const question = mockQuiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / mockQuiz.questions.length) * 100

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{mockQuiz.title}</h1>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {mockQuiz.questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Câu hỏi {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">{question.text}</p>
            
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    answers[currentQuestion] === index
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === index
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300"
                    }`}>
                      {answers[currentQuestion] === index && "✓"}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                Câu trước
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={answers[currentQuestion] === undefined}
              >
                {currentQuestion === mockQuiz.questions.length - 1 ? "Hoàn thành" : "Câu tiếp"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to quiz list */}
        <div className="mt-6 text-center">
          <Button variant="ghost" asChild>
            <Link href="/quiz">← Quay lại danh sách</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}