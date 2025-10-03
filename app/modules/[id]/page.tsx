"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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


export default function ModuleDetailPage() {
  const params = useParams()
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)

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
    } catch (error) {
      console.error('Error fetching module details:', error)
    } finally {
      setLoading(false)
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

        {/* Quiz Action */}
        <div className="text-center">
          <Button size="lg" asChild className="px-8 py-3 text-lg">
            <Link href={`/modules/${module.id}/quiz`}>Làm quiz</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}