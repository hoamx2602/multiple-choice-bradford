"use client"

import { useState, useEffect } from "react"
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

interface ModulesResponse {
  items: Module[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPublicOnly, setShowPublicOnly] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  const fetchModules = async (page = 1, query = "", publicOnly = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (query) params.append('q', query)
      if (publicOnly) params.append('public', 'true')

      const response = await fetch(`/api/modules?${params}`)
      if (!response.ok) throw new Error('Failed to fetch modules')
      
      const data: ModulesResponse = await response.json()
      setModules(data.items)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching modules:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModules(1, searchQuery, showPublicOnly)
  }, [searchQuery, showPublicOnly])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchModules(1, searchQuery, showPublicOnly)
  }

  const handlePageChange = (newPage: number) => {
    fetchModules(newPage, searchQuery, showPublicOnly)
  }

  const handlePublicToggle = () => {
    setShowPublicOnly(!showPublicOnly)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Modules</h1>
          <p className="text-muted-foreground">
            Explore question collections created by the community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button type="submit">Search</Button>
          </form>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPublicOnly}
                onChange={handlePublicToggle}
                className="rounded"
              />
              <span className="text-sm">Show public modules only</span>
            </label>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Modules Grid */}
        {!loading && (
          <>
            {modules.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No modules found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try searching with a different keyword' : 'No modules created yet'}
                </p>
                <Button asChild>
                  <Link href="/quiz/create">Create your first module</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {modules.map((module) => (
                  <Card key={module.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-2 mb-2">
                            {module.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-3">
                            {module.description || 'No description'}
                          </CardDescription>
                        </div>
                        {module.isPublic && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Public
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{module._count.questions} questions</span>
                          <span>
                            {new Date(module.createdAt).toLocaleDateString('en-US')}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild className="flex-1">
                            <Link href={`/modules/${module.id}`}>View details</Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            Take quiz
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={pagination.page === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing {modules.length} of {pagination.total} modules
            </div>
          </>
        )}
      </div>
    </main>
  )
}