"use client"

import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthSignInButton } from "@/components/auth/sign-in-button"
import Link from "next/link"

// Mock data - trong thực tế sẽ lấy từ database
const mockStats = {
  totalQuizzes: 12,
  totalQuestions: 150,
  averageScore: 78.5,
  recentQuizzes: [
    {
      id: "1",
      title: "JavaScript Fundamentals",
      score: 85,
      completedAt: "2024-01-25"
    },
    {
      id: "2", 
      title: "React Hooks",
      score: 92,
      completedAt: "2024-01-24"
    },
    {
      id: "3",
      title: "Next.js App Router",
      score: 76,
      completedAt: "2024-01-23"
    }
  ],
  categoryStats: [
    { category: "JavaScript", count: 5, averageScore: 82 },
    { category: "React", count: 4, averageScore: 88 },
    { category: "Next.js", count: 3, averageScore: 75 }
  ]
}

export default function StatsPage() {
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
            Bạn cần đăng nhập để xem thống kê
          </p>
          <AuthSignInButton />
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Thống kê</h1>
          <p className="text-muted-foreground">
            Xem thống kê và tiến độ học tập của bạn
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng số Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                +2 từ tuần trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng câu hỏi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">
                +15 từ tuần trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Điểm trung bình
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                +2.3% từ tuần trước
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz gần đây</CardTitle>
              <CardDescription>
                Các bài quiz bạn đã hoàn thành gần đây
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStats.recentQuizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{quiz.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {quiz.completedAt}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        quiz.score >= 80 ? "text-green-600" :
                        quiz.score >= 60 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {quiz.score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/quiz">Xem tất cả quiz</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo chủ đề</CardTitle>
              <CardDescription>
                Hiệu suất của bạn theo từng chủ đề
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStats.categoryStats.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.count} quiz
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${category.averageScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {category.averageScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <div className="space-x-4">
            <Button asChild>
              <Link href="/quiz">Làm thêm quiz</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/quiz/create">Tạo quiz mới</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}