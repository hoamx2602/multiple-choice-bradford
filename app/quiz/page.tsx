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
          <h1 className="text-3xl font-bold mb-4">Cần đăng nhập</h1>
          <p className="text-muted-foreground mb-8">
            Bạn cần đăng nhập để xem danh sách quiz
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
            <h1 className="text-3xl font-bold mb-4">Không tìm thấy quiz</h1>
            <p className="text-muted-foreground mb-8">
              Module này chưa có câu hỏi nào để làm quiz.
            </p>
            <Button asChild>
              <Link href="/modules">Quay lại danh sách modules</Link>
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
                <Link href={`/modules/${module.id}`}>← Quay lại module</Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
            <p className="text-muted-foreground text-lg">
              {module.description || 'Làm quiz để kiểm tra kiến thức của bạn'}
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              {questions.length} câu hỏi • Tạo lúc {new Date(module.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>

          {/* Quiz Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Quiz cơ bản</CardTitle>
                <CardDescription>
                  Làm tất cả {questions.length} câu hỏi theo thứ tự
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    • Không giới hạn thời gian<br/>
                    • Có thể quay lại câu trước<br/>
                    • Hiển thị kết quả ngay
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/modules/${module.id}/quiz`}>Bắt đầu làm</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Quiz có thời gian</CardTitle>
                <CardDescription>
                  Làm bài với giới hạn thời gian
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    • 30 phút làm bài<br/>
                    • Tự động nộp khi hết giờ<br/>
                    • Áp lực thời gian
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/modules/${module.id}/quiz?timed=true`}>Bắt đầu có thời gian</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Xem trước câu hỏi</CardTitle>
                <CardDescription>
                  Xem tất cả câu hỏi trước khi làm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    • Xem tất cả câu hỏi<br/>
                    • Không cần trả lời<br/>
                    • Chuẩn bị trước khi thi
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/modules/${module.id}`}>Xem trước</Link>
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
            <h1 className="text-3xl font-bold">Danh sách Quiz</h1>
            <p className="text-muted-foreground mt-2">
              Chọn một bài quiz để bắt đầu thử thách
            </p>
          </div>
          <Button asChild>
            <Link href="/quiz/create">Tạo Quiz mới</Link>
          </Button>
        </div>

        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Chọn module để làm quiz</h3>
          <p className="text-muted-foreground mb-4">
            Để làm quiz, hãy chọn một module từ danh sách modules
          </p>
          <Button asChild>
            <Link href="/modules">Xem danh sách modules</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}