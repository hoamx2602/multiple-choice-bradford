import { SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function AuthSignUpButton() {
  return (
    <SignUpButton mode="modal">
      <Button variant="outline">Đăng ký</Button>
    </SignUpButton>
  )
}