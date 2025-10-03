import { auth } from "@clerk/nextjs"
import { prisma } from "./prisma"

export async function getCurrentUser() {
  const { userId } = auth()
  
  if (!userId) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      // Create user if not exists
      const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }).then(res => res.json())

      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.email_addresses[0].email_address,
          firstName: clerkUser.first_name,
          lastName: clerkUser.last_name,
          imageUrl: clerkUser.image_url,
        },
      })

      return newUser
    }

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}