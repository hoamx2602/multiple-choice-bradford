import { UserButton } from "@clerk/nextjs"

export function AuthUserButton() {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-8 h-8",
          userButtonPopoverCard: "bg-background border border-border",
          userButtonPopoverActionButton: "text-foreground hover:bg-accent",
          userButtonPopoverActionButtonText: "text-foreground",
          userButtonPopoverFooter: "hidden",
        },
      }}
    />
  )
}