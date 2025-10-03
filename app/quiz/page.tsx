"use client"

import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthSignInButton } from "@/components/auth/sign-in-button"
import Link from "next/link"

// Mock data - trong thực tế sẽ lấy từ database
const mockQuizzes = [
  {
    id: "1",
    title: "Kiến thức JavaScript cơ bản",
    description: "Test kiến thức JavaScript của bạn với 10 câu hỏi",
    questionCount: 10,
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    title: "React Hooks và State Management",
    description: "Câu hỏi về React Hooks, useState, useEffect và các khái niệm khác",
    questionCount: 15,
    createdAt: "2024-01-20"
  },
  {
    id: "3",
    title: "Next.js App Router",
    description: "Kiểm tra hiểu biết về Next.js 13+ App Router",
    questionCount: 8,
    createdAt: "2024-01-25"
  }
]

export default function QuizListPage() {
  const { isSignedIn, isLoaded } = useUser()

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
          <h1 className="text-3xl font-bold mb-4">Cần đăng nhập</h1>
          <p className="text-muted-foreground mb-8">
            Bạn cần đăng nhập để xem danh sách quiz
          </p>
          <AuthSignInButton />
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Danh sách Quiz</h1>
            <p className="text-muted-foreground mt-2">
              Chọn một bài quiz để bắt đầu thử thách
            </p>
          </div>
          <Button asChild>
            <Link href="/quiz/create">Tạo Quiz mới</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockQuizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {quiz.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{quiz.questionCount} câu hỏi</span>
                    <span>{quiz.createdAt}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/quiz/${quiz.id}`}>Bắt đầu</Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      Xem trước
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockQuizzes.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Chưa có quiz nào</h3>
            <p className="text-muted-foreground mb-4">
              Hãy tạo quiz đầu tiên của bạn
            </p>
            <Button asChild>
              <Link href="/quiz/create">Tạo Quiz mới</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}