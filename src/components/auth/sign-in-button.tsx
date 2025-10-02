import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function AuthSignInButton() {
  return (
    <SignInButton mode="modal">
      <Button>Đăng nhập</Button>
    </SignInButton>
  )
}