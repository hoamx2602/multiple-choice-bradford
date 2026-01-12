"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Image, ImageOff } from "lucide-react"
import Link from "next/link"
import { fillInTheBlankAnswersWithHighlight } from "@/lib/utils"

type QuestionResult = {
  id: string
  uniqueId: string
  type: string
  question: string
  answers: unknown
  correctAnswers: unknown
  imageUrl: string | null
  moduleId: string | null
  module: {
    id: string
    title: string
  } | null
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const [modules, setModules] = useState<Array<{
    id: string
    title: string
    description: string | null
    isPublic: boolean
    createdAt: string
    _count: { questions: number }
  }>>([])
  const [loadingModules, setLoadingModules] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<QuestionResult[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [showImages, setShowImages] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoadingModules(true)
        const params = new URLSearchParams({ page: "1", limit: "100" })
        const res = await fetch(`/api/modules?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setModules(Array.isArray(data.items) ? data.items : [])
        }
      } catch (e) {
        console.error("Failed to fetch modules", e)
      } finally {
        setLoadingModules(false)
      }
    }
    fetchModules()
  }, [])

  const searchQuestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setLoadingSearch(true)
      const params = new URLSearchParams({ 
        q: query.trim(),
        limit: "50"
      })
      const res = await fetch(`/api/questions?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(Array.isArray(data.items) ? data.items : [])
      }
    } catch (e) {
      console.error("Failed to search questions", e)
      setSearchResults([])
    } finally {
      setLoadingSearch(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchQuestions(searchQuery)
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchQuestions])

  const toggleImage = (questionId: string) => {
    setShowImages(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }))
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

  const renderAnswers = (question: QuestionResult) => {
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

      case 'numerical_question':
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Đáp án: </span>
              <span className="text-green-600">{String(question.correctAnswers)}</span>
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

      case 'matching_question':
        if (question.answers && typeof question.answers === 'object' && 'premises' in question.answers) {
          const answers = question.answers as { premises: string[], responses: string[] }
          return (
            <div className="space-y-2">
              <div className="text-sm font-medium mb-2">Các cặp đúng:</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-sm mb-2">Cột trái:</div>
                  {answers.premises.map((premise: string, idx: number) => (
                    <div key={idx} className="text-sm py-1">{premise}</div>
                  ))}
                </div>
                <div>
                  <div className="font-medium text-sm mb-2">Cột phải:</div>
                  {answers.responses.map((response: string, idx: number) => (
                    <div key={idx} className="text-sm py-1">{response}</div>
                  ))}
                </div>
              </div>
            </div>
          )
        }
        return null

      case 'ordering_question':
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

  const isSearching = searchQuery.trim().length > 0

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm câu hỏi trên tất cả modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 text-base pl-4 pr-4"
            />
            {loadingSearch && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Kết quả tìm kiếm {searchResults.length > 0 && `(${searchResults.length})`}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="text-sm"
              >
                Xóa tìm kiếm
              </Button>
            </div>

            {loadingSearch ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">Không tìm thấy câu hỏi nào</h3>
                  <p className="text-muted-foreground">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {searchResults.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            Q{index + 1}: {question.type === 'fill_in_the_blank' && Array.isArray(question.correctAnswers)
                              ? fillInTheBlankAnswersWithHighlight(question.question, question.correctAnswers)
                              : question.question}
                          </CardTitle>
                          {question.module && (
                            <CardDescription className="mt-2 flex items-center gap-2">
                              <span className="font-medium">Module:</span>
                              <Link 
                                href={`/modules/${question.module.id}`}
                                className="text-primary hover:underline"
                              >
                                {question.module.title}
                              </Link>
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {getQuestionTypeAbbreviation(question.type)}
                          </span>
                          {question.imageUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleImage(question.id)}
                              className={`p-2 ${
                                showImages[question.id]
                                  ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                                  : 'hover:bg-gray-100'
                              }`}
                              title={showImages[question.id] ? 'Hide image' : 'Show image'}
                            >
                              {showImages[question.id] ? <ImageOff className="h-4 w-4" /> : <Image className="h-4 w-4" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Show image if toggle is on and imageUrl exists */}
                        {showImages[question.id] && question.imageUrl && (
                          <div className="mb-4">
                            <img 
                              src={question.imageUrl} 
                              alt="Question image" 
                              className="max-w-full h-auto rounded-lg border shadow-sm"
                              onError={(e) => {
                                console.error('Failed to load image:', question.imageUrl)
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Answers */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Options:</h4>
                          {renderAnswers(question)}
                        </div>
                        
                        {/* Question ID and Module Link */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            ID: {question.uniqueId}
                          </div>
                          {question.moduleId && (
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/modules/${question.moduleId}`}>
                                Xem module
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modules List */}
        {!isSearching && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Modules</h2>
              <Button asChild variant="outline">
                <Link href="/modules">View all</Link>
              </Button>
            </div>

          {loadingModules ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No modules available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((m) => (
                <Card key={m.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2 mb-2">{m.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {m.description || "No description"}
                        </CardDescription>
                      </div>
                      {m.isPublic && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Public</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{m._count?.questions ?? 0} questions</span>
                        <span>{new Date(m.createdAt).toLocaleDateString('en-US')}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild className="flex-1">
                          <Link href={`/modules/${m.id}`}>View details</Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link href={`/modules/${m.id}/quiz`}>Take quiz</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          </div>
        )}
      </div>
    </main>
  )
}