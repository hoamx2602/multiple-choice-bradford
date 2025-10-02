"use client"

import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthSignInButton } from "@/components/auth/sign-in-button"
import { AuthSignUpButton } from "@/components/auth/sign-up-button"
import Link from "next/link"

export default function Home() {
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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Multiple Choice Quiz App
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Tạo và tham gia các bài quiz trắc nghiệm một cách dễ dàng
          </p>
          {!isSignedIn && (
            <div className="flex justify-center space-x-4 mb-8">
              <AuthSignInButton />
              <AuthSignUpButton />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Tạo Quiz</CardTitle>
              <CardDescription>
                Tạo bài quiz mới với các câu hỏi trắc nghiệm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSignedIn ? (
                <Button asChild className="w-full">
                  <Link href="/quiz/create">Bắt đầu tạo</Link>
                </Button>
              ) : (
                <AuthSignInButton />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách Quiz</CardTitle>
              <CardDescription>
                Xem tất cả các bài quiz có sẵn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSignedIn ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/quiz">Xem danh sách</Link>
                </Button>
              ) : (
                <AuthSignInButton />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
              <CardDescription>
                Xem thống kê và kết quả của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSignedIn ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/stats">Xem thống kê</Link>
                </Button>
              ) : (
                <AuthSignInButton />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Tính năng chính</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <h3 className="font-medium">✨ Giao diện hiện đại</h3>
              <p className="text-sm text-muted-foreground">
                Sử dụng shadcn/ui và Tailwind CSS cho trải nghiệm người dùng tốt nhất
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">📊 Quản lý dữ liệu</h3>
              <p className="text-sm text-muted-foreground">
                Prisma ORM với MongoDB để lưu trữ và quản lý dữ liệu hiệu quả
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">⚡ Hiệu suất cao</h3>
              <p className="text-sm text-muted-foreground">
                Next.js App Router với Server Components cho tốc độ tối ưu
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">📱 Responsive</h3>
              <p className="text-sm text-muted-foreground">
                Thiết kế responsive hoạt động tốt trên mọi thiết bị
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}