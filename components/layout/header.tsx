"use client"

import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { AuthUserButton } from "@/components/auth/user-button"
import { AuthSignInButton } from "@/components/auth/sign-in-button"
import { AuthSignUpButton } from "@/components/auth/sign-up-button"

export function Header() {
  const { isSignedIn } = useUser()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          QuizApp
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/modules" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Modules
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <AuthUserButton />
          ) : (
            <div className="flex items-center space-x-2">
              <AuthSignInButton />
              <AuthSignUpButton />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}