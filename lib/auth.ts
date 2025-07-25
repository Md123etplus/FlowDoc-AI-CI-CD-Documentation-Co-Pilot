import { cookies } from "next/headers"

export interface User {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
}

export interface Session {
  user: User
  accessToken: string
  authenticated: boolean
}

export async function getUserSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return null
    }

    const session = JSON.parse(sessionCookie.value) as Session

    // Validate session structure
    if (!session.user || !session.accessToken || !session.authenticated) {
      return null
    }

    return session
  } catch (error) {
    console.error("Error getting user session:", error)
    return null
  }
}

export async function clearUserSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("session")
  } catch (error) {
    console.error("Error clearing user session:", error)
  }
}
