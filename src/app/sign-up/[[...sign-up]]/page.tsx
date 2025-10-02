import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90",
            card: "bg-card border border-border",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "border border-input hover:bg-accent",
            formFieldInput: "bg-background border-input",
            footerActionLink: "text-primary hover:text-primary/90",
          },
        }}
      />
    </div>
  )
}