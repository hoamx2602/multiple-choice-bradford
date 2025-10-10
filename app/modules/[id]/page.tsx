"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Module {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
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

export default function ModuleDetailPage() {
  const params = useParams()
  const [module, setModule] = useState<Module | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchModuleDetails(params.id as string)
    }
  }, [params.id])

  const fetchModuleDetails = async (moduleId: string) => {
    try {
      setLoading(true)
      
      // Fetch module info
      const moduleResponse = await fetch(`/api/modules/${moduleId}`)
      if (!moduleResponse.ok) throw new Error('Module not found')
      const moduleData = await moduleResponse.json()
      setModule(moduleData)

      // Fetch questions in this module with pagination
      await fetchQuestions(moduleId, 1, "")
    } catch (error) {
      console.error('Error fetching module details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async (moduleId: string, page: number, search: string) => {
    try {
      setSearchLoading(true)
      
      const params = new URLSearchParams({
        moduleId,
        page: page.toString(),
        limit: "100"
      })
      
      if (search.trim()) {
        params.append("q", search.trim())
      }

      const questionsResponse = await fetch(`/api/questions?${params}`)
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setQuestions(questionsData.items || [])
        setTotalQuestions(questionsData.total || 0)
        setTotalPages(Math.ceil((questionsData.total || 0) / 100))
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Search functionality with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (params.id) {
        fetchQuestions(params.id as string, 1, searchQuery)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery, params.id])

  const handlePageChange = (page: number) => {
    if (params.id) {
      fetchQuestions(params.id as string, page, searchQuery)
    }
  }

  const renderAnswers = (question: Question) => {
    if (!question.answers) return null

    switch (question.type) {
      case 'multiple_choice':
      case 'multiple_response':
        return (
          <div className="space-y-2">
            {Array.isArray(question.answers) && question.answers.map((answer: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm">{answer}</span>
                {question.correctAnswers && Array.isArray(question.correctAnswers) && 
                 question.correctAnswers.includes(idx) && (
                  <span className="text-green-600 font-medium">✓ Đúng</span>
                )}
              </div>
            ))}
          </div>
        )

      case 'numerical':
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Đáp án: </span>
              <span className="text-green-600">{question.correctAnswers}</span>
            </div>
          </div>
        )

      case 'fill_in_the_blank':
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Đáp án: </span>
              {Array.isArray(question.correctAnswers) && question.correctAnswers.map((answer: string, idx: number) => (
                <span key={idx} className="text-green-600">
                  {answer}
                  {idx < question.correctAnswers.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        )

      case 'matching':
        if (question.answers && typeof question.answers === 'object' && 'premises' in question.answers) {
          return (
            <div className="space-y-2">
              <div className="text-sm font-medium mb-2">Các cặp đúng:</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-sm mb-2">Cột trái:</div>
                  {question.answers.premises.map((premise: string, idx: number) => (
                    <div key={idx} className="text-sm py-1">{premise}</div>
                  ))}
                </div>
                <div>
                  <div className="font-medium text-sm mb-2">Cột phải:</div>
                  {question.answers.responses.map((response: string, idx: number) => (
                    <div key={idx} className="text-sm py-1">{response}</div>
                  ))}
                </div>
              </div>
            </div>
          )
        }
        return null

      case 'ordering':
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Thứ tự đúng: </span>
              {Array.isArray(question.correctAnswers) && question.correctAnswers.map((order: number, idx: number) => (
                <span key={idx} className="text-green-600">
                  {order + 1}
                  {idx < question.correctAnswers.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Đáp án: {JSON.stringify(question.correctAnswers)}
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

  if (!module) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Module không tồn tại</h1>
          <p className="text-muted-foreground mb-4">
            Module bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button asChild>
            <Link href="/modules">Quay lại danh sách</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/modules">← Quay lại danh sách modules</Link>
          </Button>
        </div>

        {/* Module Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{module.title}</CardTitle>
                <CardDescription className="text-lg">
                  {module.description || 'Không có mô tả'}
                </CardDescription>
              </div>
              {module.isPublic && (
                <span className="ml-4 px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                  Công khai
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{module._count.questions} câu hỏi</span>
              <span>
                Tạo lúc: {new Date(module.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Search and Quiz Actions */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm câu hỏi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button size="lg" asChild className="px-8 py-3 text-lg">
              <Link href={`/modules/${module.id}/quiz`}>Làm quiz</Link>
            </Button>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                Câu hỏi trong module ({totalQuestions})
              </h2>
            </div>

            {searchLoading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Đang tải...</p>
                </CardContent>
              </Card>
            ) : questions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery ? 'Không tìm thấy câu hỏi nào' : 'Chưa có câu hỏi'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? 'Thử tìm kiếm với từ khóa khác' 
                      : 'Module này chưa có câu hỏi nào.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          Câu {index + 1}: {question.question}
                        </CardTitle>
                        <span className="ml-4 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {question.type.replace('_', ' ')}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Answers */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Các lựa chọn:</h4>
                          {renderAnswers(question)}
                        </div>
                        
                        {/* Question ID */}
                        <div className="text-xs text-muted-foreground">
                          ID: {question.uniqueId}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            {totalQuestions > 0 && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                Hiển thị {((currentPage - 1) * 100) + 1} - {Math.min(currentPage * 100, totalQuestions)} 
                trong tổng số {totalQuestions} câu hỏi
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}