"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
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
      </div>
    </main>
  )
}